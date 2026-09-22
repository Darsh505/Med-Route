"""
──────────────────────────────────────────────
services/search_service.py — Search Orchestration
──────────────────────────────────────────────

Orchestrates the full NL search pipeline:
1. Receive NL query from user
2. Call NLP parser (Gemini or rule-based fallback)
3. Geocode location text → lat/lng
4. Query hospital_service.find_nearby() with filters
5. Fetch procedure costs for searched procedures
6. Apply ranking_service to score and sort
7. Return ranked results with transparent breakdown
"""

import structlog
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.hospital_service import hospital_service
from app.services.ranking_service import ranking_service
from app.schemas.search import NLSearchRequest, SearchFilters, SearchResultMeta

logger = structlog.get_logger()


class SearchService:

    async def natural_language_search(
        self,
        db: AsyncSession,
        request: NLSearchRequest,
        nlp_parser=None,  # Injected — avoids circular import
    ) -> tuple[list, SearchResultMeta]:
        """
        Full NL search pipeline.

        Args:
            request: User's raw query + optional GPS coordinates
            nlp_parser: NLP parser instance (from app.ai.nlp_parser)

        Returns:
            (ranked_hospitals, meta)
        """

        # Step 1: Parse natural language query
        filters: SearchFilters = SearchFilters(raw_query=request.query)
        if nlp_parser:
            try:
                filters = await nlp_parser.parse(request.query)
            except Exception as e:
                logger.warning("NLP parsing failed, using empty filters", error=str(e))

        # Step 2: Override lat/lng from request if client sent GPS coordinates
        # Client-side GPS is more accurate than geocoding from text
        if request.latitude and request.longitude:
            filters.latitude = request.latitude
            filters.longitude = request.longitude

        # Step 3: Geocode location_text if no coordinates available
        if not filters.latitude or not filters.longitude:
            if filters.location_text:
                lat, lng = await self._geocode(filters.location_text)
                if lat and lng:
                    filters.latitude = lat
                    filters.longitude = lng
                else:
                    # Default to Chandigarh (primary target city)
                    filters.latitude = 30.7333
                    filters.longitude = 76.7794
                    filters.location_text = "Chandigarh (default)"
            else:
                # No location info at all — default to Chandigarh
                filters.latitude = 30.7333
                filters.longitude = 76.7794

        if request.radius_km:
            filters.radius_km = request.radius_km

        # Step 4: Find nearby hospitals with filters
        hospitals, total = await hospital_service.find_nearby(
            db=db,
            lat=filters.latitude,
            lng=filters.longitude,
            radius_km=filters.radius_km,
            filters=filters,
            page=1,
            per_page=50,  # Get more than needed for re-ranking
        )

        # Step 5: Apply transparent ranking
        ranked = ranking_service.rank_hospitals(
            hospitals=hospitals,
            max_budget=filters.max_budget,
        )

        # Return top 20
        ranked = ranked[:20]

        meta = SearchResultMeta(
            total=total,
            page=1,
            per_page=20,
            radius_km=filters.radius_km,
            location_text=filters.location_text,
            ai_provider=filters.ai_provider,
            confidence=filters.confidence,
            extracted_filters=filters,
        )

        return ranked, meta

    async def _geocode(self, location_text: str) -> tuple[Optional[float], Optional[float]]:
        """
        Geocode location text to lat/lng using Nominatim (OSM).
        Returns (None, None) on failure — caller handles fallback.
        """
        try:
            from geopy.geocoders import Nominatim
            from geopy.adapters import AioHTTPAdapter

            async with Nominatim(
                user_agent="medroute-app/1.0",
                adapter_factory=AioHTTPAdapter,
            ) as geolocator:
                result = await geolocator.geocode(
                    f"{location_text}, India",
                    country_codes="in",
                    timeout=5,
                )
                if result:
                    return result.latitude, result.longitude
        except Exception as e:
            logger.warning("Geocoding failed", location=location_text, error=str(e))
        return None, None


search_service = SearchService()
