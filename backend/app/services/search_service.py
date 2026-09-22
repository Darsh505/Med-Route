"""services/search_service.py — NL and Structured Search with In-Memory Fallback"""

try:
    import structlog
    logger = structlog.get_logger()
except ImportError:
    import logging
    logger = logging.getLogger("search_service")

from app.schemas.search import SearchMeta


def _is_memory_mode() -> bool:
    from app.database import USE_MEMORY_DB
    return USE_MEMORY_DB


class SearchService:

    async def natural_language_search(self, db, request, nlp_parser):
        """NL search: parse query → filter hospitals → rank results."""
        try:
            parsed = await nlp_parser.parse(request.query)
        except Exception as e:
            logger.warning(f"NLP parse failed, using raw query: {e}")
            parsed = None

        lat = getattr(request, 'latitude', 30.7333) or 30.7333
        lng = getattr(request, 'longitude', 76.7794) or 76.7794
        radius_km = getattr(request, 'radius_km', 50) or 50

        filters_dict = {}
        if parsed:
            if hasattr(parsed, 'requires_pmjay') and parsed.requires_pmjay:
                filters_dict['requires_pmjay'] = True
            if hasattr(parsed, 'max_budget') and parsed.max_budget:
                filters_dict['max_budget'] = parsed.max_budget
            if hasattr(parsed, 'hospital_types') and parsed.hospital_types:
                filters_dict['hospital_types'] = parsed.hospital_types

        if _is_memory_mode():
            from app.services.memory_store import memory_store
            query_text = request.query
            if parsed and hasattr(parsed, 'procedure_categories') and parsed.procedure_categories:
                query_text += " " + " ".join(parsed.procedure_categories)
            results = memory_store.search(query_text, filters_dict, lat, lng)
            meta = SearchMeta(
                query=request.query,
                ai_provider=getattr(parsed, 'ai_provider', 'clinical_rules') if parsed else 'clinical_rules',
                parsed_intent=getattr(parsed, 'intent', 'hospital_search') if parsed else 'hospital_search',
                total_found=len(results),
                radius_km=radius_km,
            )
            return results, meta

        # PostgreSQL path
        try:
            from app.services.hospital_service import hospital_service
            from app.schemas.search import SearchFilters
            f = SearchFilters()
            if filters_dict.get('requires_pmjay'):
                f.requires_pmjay = True
            if filters_dict.get('max_budget'):
                f.max_budget = filters_dict['max_budget']

            hospitals, total = await hospital_service.find_nearby(
                db=db, lat=lat, lng=lng, radius_km=radius_km, filters=f, per_page=20
            )
            meta = SearchMeta(
                query=request.query,
                ai_provider=getattr(parsed, 'ai_provider', 'clinical_rules') if parsed else 'clinical_rules',
                parsed_intent='hospital_search',
                total_found=total,
                radius_km=radius_km,
            )
            return hospitals, meta
        except Exception as e:
            logger.warning(f"DB NL search failed, using memory: {e}")
            from app.services.memory_store import memory_store
            results = memory_store.search(request.query, filters_dict, lat, lng)
            meta = SearchMeta(
                query=request.query, ai_provider='clinical_rules',
                parsed_intent='hospital_search', total_found=len(results), radius_km=radius_km,
            )
            return results, meta


search_service = SearchService()
