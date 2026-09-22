"""services/sos_service.py — SOS Emergency Dispatch Service"""

import math
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.sos_alert import SOSAlert, SOSStatus
from app.schemas.sos import SOSRequest, SOSNearestResponse, SOSAlertResponse
from app.services.hospital_service import hospital_service

logger = structlog.get_logger()

# Connected WebSocket clients for real-time hospital staff notifications
# In production, this should use Redis pub/sub for multi-process support
_ws_clients: dict[str, set] = {}  # {hospital_id: {websocket_connections}}


class SOSService:

    async def find_nearest_and_create_alert(
        self,
        db: AsyncSession,
        request: SOSRequest,
        user_id=None,
    ) -> tuple[SOSNearestResponse, SOSAlert]:
        """
        Full SOS pipeline:
        1. Find nearest trauma center using PostGIS
        2. Create SOSAlert record
        3. Broadcast via WebSocket to hospital staff
        4. Return nearest hospital info to citizen

        Target: < 100ms end-to-end
        """
        # Step 1: Find nearest trauma center (PostGIS query)
        result = await hospital_service.find_nearest_trauma_center(
            db=db,
            lat=request.latitude,
            lng=request.longitude,
            radius_km=100,  # 100km SOS search radius
        )

        if not result:
            # FALLBACK: If no trauma center within 100km, find nearest ANY hospital
            logger.warning("No trauma center found within 100km — falling back to nearest hospital")
            result = await self._find_nearest_any(db, request.latitude, request.longitude)

        if not result:
            raise ValueError("No hospitals found near your location. Please call 108 immediately.")

        hospital, distance_km = result
        eta_minutes = hospital_service.estimate_travel_time(distance_km)

        # Step 2: Create SOSAlert record
        alert = SOSAlert(
            user_id=user_id,
            latitude=request.latitude,
            longitude=request.longitude,
            hospital_id=hospital.id,
            distance_km=distance_km,
            estimated_arrival_minutes=eta_minutes,
            status=SOSStatus.SENT,
            emergency_description=request.emergency_description,
            patient_name=request.patient_name,
            contact_phone=request.contact_phone,
        )
        db.add(alert)
        await db.flush()

        # Step 3: Broadcast to hospital staff dashboard (fire-and-forget)
        await self._broadcast_sos(hospital.id, alert)

        # Step 4: Build response
        nearest_response = SOSNearestResponse(
            hospital_id=hospital.id,
            hospital_name=hospital.name,
            hospital_phone=hospital.phone,
            hospital_emergency_phone=hospital.emergency_phone,
            hospital_address=hospital.address,
            latitude=hospital.latitude,
            longitude=hospital.longitude,
            distance_km=distance_km,
            estimated_arrival_minutes=eta_minutes,
            beds_icu_available=hospital.beds_icu_available,
            is_trauma_center=hospital.is_trauma_center,
        )

        logger.info(
            "SOS alert created",
            alert_id=str(alert.id),
            hospital=hospital.name,
            distance_km=distance_km,
            eta=eta_minutes,
        )

        return nearest_response, alert

    async def update_status(
        self,
        db: AsyncSession,
        alert: SOSAlert,
        new_status: str,
        ambulance_number: str = None,
        resolved_note: str = None,
    ) -> SOSAlert:
        """Hospital staff updates alert status."""
        alert.status = new_status
        if ambulance_number:
            alert.ambulance_number = ambulance_number
        if resolved_note:
            alert.resolved_note = resolved_note
        await db.flush()

        # Notify the citizen (in production: push notification via FCM)
        await self._notify_citizen(alert)
        return alert

    async def _find_nearest_any(self, db, lat, lng):
        """Fallback: find nearest non-trauma hospital."""
        from geoalchemy2.functions import ST_DWithin, ST_Distance, ST_MakePoint
        from sqlalchemy import select

        ref_point = ST_MakePoint(lng, lat)
        distance_col = (ST_Distance(
            __import__("app.models.hospital", fromlist=["Hospital"]).Hospital.location,
            ref_point,
        ) / 1000).label("distance_km")

        from app.models.hospital import Hospital
        result = await db.execute(
            select(Hospital, distance_col)
            .where(Hospital.is_active == True)
            .order_by(distance_col)
            .limit(1)
        )
        row = result.first()
        return (row[0], round(row[1], 2)) if row else None

    async def _broadcast_sos(self, hospital_id, alert):
        """
        WebSocket broadcast to hospital staff dashboard.
        In production: use Redis pub/sub for multi-process support.
        """
        hospital_id_str = str(hospital_id)
        if hospital_id_str in _ws_clients:
            message = {
                "type": "sos_alert",
                "alert_id": str(alert.id),
                "patient": alert.patient_name,
                "location": f"{alert.latitude}, {alert.longitude}",
                "status": alert.status,
            }
            import json
            dead = set()
            for ws in _ws_clients[hospital_id_str]:
                try:
                    await ws.send_text(json.dumps(message))
                except Exception:
                    dead.add(ws)
            _ws_clients[hospital_id_str] -= dead

    async def _notify_citizen(self, alert):
        """Push notification to citizen app — stub for now."""
        logger.info("Would send push notification", alert_id=str(alert.id))

    def register_ws(self, hospital_id: str, ws):
        _ws_clients.setdefault(hospital_id, set()).add(ws)

    def unregister_ws(self, hospital_id: str, ws):
        if hospital_id in _ws_clients:
            _ws_clients[hospital_id].discard(ws)


sos_service = SOSService()
