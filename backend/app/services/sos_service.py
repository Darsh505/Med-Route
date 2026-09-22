"""services/sos_service.py — SOS Emergency Service with In-Memory Fallback"""

try:
    import structlog
    logger = structlog.get_logger()
except ImportError:
    import logging
    logger = logging.getLogger("sos_service")

from typing import Optional, Dict
from app.services.hospital_service import hospital_service, estimate_travel_time


def _is_memory_mode() -> bool:
    from app.database import USE_MEMORY_DB
    return USE_MEMORY_DB


class SOSNearestResult:
    def __init__(self, hospital_name, hospital_phone, hospital_emergency_phone,
                 hospital_address, latitude, longitude, distance_km, estimated_arrival_minutes,
                 beds_icu_available, is_trauma_center, hospital_id=None):
        self.hospital_name = hospital_name
        self.hospital_phone = hospital_phone
        self.hospital_emergency_phone = hospital_emergency_phone
        self.hospital_address = hospital_address
        self.latitude = latitude
        self.longitude = longitude
        self.distance_km = distance_km
        self.estimated_arrival_minutes = estimated_arrival_minutes
        self.beds_icu_available = beds_icu_available
        self.is_trauma_center = is_trauma_center
        self.hospital_id = hospital_id


class SOSAlertResult:
    def __init__(self, id, status, hospital_name, hospital_phone, distance_km,
                 estimated_arrival_minutes, ambulance_number, created_at):
        self.id = id
        self.status = status
        self.hospital_name = hospital_name
        self.hospital_phone = hospital_phone
        self.distance_km = distance_km
        self.estimated_arrival_minutes = estimated_arrival_minutes
        self.ambulance_number = ambulance_number
        self.created_at = created_at


# WebSocket registry
_ws_connections: Dict[str, list] = {}


class SOSService:

    def register_ws(self, hospital_id: str, ws):
        if hospital_id not in _ws_connections:
            _ws_connections[hospital_id] = []
        _ws_connections[hospital_id].append(ws)

    def unregister_ws(self, hospital_id: str, ws):
        if hospital_id in _ws_connections:
            try:
                _ws_connections[hospital_id].remove(ws)
            except ValueError:
                pass

    async def find_nearest_and_create_alert(self, db, request):
        lat, lng = request.latitude, request.longitude

        # Find nearest trauma center
        result = await hospital_service.find_nearest_trauma_center(db, lat, lng)
        if not result:
            result = hospital_service._find_fallback_nearest_trauma(lat, lng)
        if not result:
            raise ValueError("No trauma center found within 100km")

        hospital, dist = result

        # Handle both dict and ORM object
        if isinstance(hospital, dict):
            h_name = hospital.get("name", "Nearest Hospital")
            h_phone = hospital.get("phone", "108")
            h_emer = hospital.get("emergency_phone") or hospital.get("phone", "108")
            h_addr = hospital.get("address", "")
            h_lat = hospital.get("latitude") or hospital.get("lat") or lat
            h_lng = hospital.get("longitude") or hospital.get("lng") or lng
            h_icu = hospital.get("beds_icu_available", 8)
            h_id = str(hospital.get("id", ""))
            h_trauma = hospital.get("is_trauma_center", True)
        else:
            h_name = hospital.name
            h_phone = hospital.phone
            h_emer = hospital.emergency_phone or hospital.phone
            h_addr = hospital.address
            h_lat = hospital.latitude or lat
            h_lng = hospital.longitude or lng
            h_icu = hospital.beds_icu_available
            h_id = str(hospital.id)
            h_trauma = hospital.is_trauma_center

        eta = estimate_travel_time(dist)

        nearest = SOSNearestResult(
            hospital_name=h_name,
            hospital_phone=h_phone,
            hospital_emergency_phone=h_emer,
            hospital_address=h_addr,
            latitude=float(h_lat),
            longitude=float(h_lng),
            distance_km=dist,
            estimated_arrival_minutes=eta,
            beds_icu_available=h_icu,
            is_trauma_center=h_trauma,
            hospital_id=h_id,
        )

        # Create SOS alert
        if _is_memory_mode():
            from app.services.memory_store import memory_store
            alert_dict = memory_store.create_sos_alert(
                lat=lat, lng=lng,
                hospital_name=h_name,
                hospital_phone=h_phone,
                distance_km=dist,
                eta_minutes=eta,
                hospital_id=h_id,
            )
            from datetime import datetime, timezone
            alert = SOSAlertResult(
                id=alert_dict["id"],
                status=alert_dict["status"],
                hospital_name=h_name,
                hospital_phone=h_phone,
                distance_km=dist,
                estimated_arrival_minutes=eta,
                ambulance_number=alert_dict["ambulance_number"],
                created_at=datetime.now(timezone.utc),
            )
        else:
            try:
                from app.models.sos_alert import SOSAlert, SOSStatus
                from datetime import datetime, timezone
                alert_obj = SOSAlert(
                    latitude=lat,
                    longitude=lng,
                    distance_km=dist,
                    estimated_arrival_minutes=eta,
                    status=SOSStatus.DISPATCHED,
                )
                db.add(alert_obj)
                await db.flush()
                await db.refresh(alert_obj)
                alert = SOSAlertResult(
                    id=alert_obj.id,
                    status=alert_obj.status.value if hasattr(alert_obj.status, 'value') else alert_obj.status,
                    hospital_name=h_name,
                    hospital_phone=h_phone,
                    distance_km=dist,
                    estimated_arrival_minutes=eta,
                    ambulance_number=alert_obj.ambulance_number or f"MR-{str(alert_obj.id)[:6].upper()}",
                    created_at=alert_obj.created_at or datetime.now(timezone.utc),
                )
            except Exception as e:
                logger.warning(f"DB SOS alert creation failed, using memory: {e}")
                from app.services.memory_store import memory_store
                from datetime import datetime, timezone
                alert_dict = memory_store.create_sos_alert(
                    lat=lat, lng=lng, hospital_name=h_name, hospital_phone=h_phone,
                    distance_km=dist, eta_minutes=eta, hospital_id=h_id,
                )
                alert = SOSAlertResult(
                    id=alert_dict["id"], status="dispatched",
                    hospital_name=h_name, hospital_phone=h_phone,
                    distance_km=dist, estimated_arrival_minutes=eta,
                    ambulance_number=alert_dict["ambulance_number"],
                    created_at=datetime.now(timezone.utc),
                )

        # Notify WebSocket clients
        import json
        alert_payload = json.dumps({
            "type": "sos_alert",
            "hospital_id": h_id,
            "patient_lat": lat,
            "patient_lng": lng,
            "eta_minutes": eta,
        })
        for ws in _ws_connections.get(h_id, []):
            try:
                await ws.send_text(alert_payload)
            except Exception:
                pass

        return nearest, alert

    async def update_status(self, db, alert, new_status, ambulance_number=None, resolved_note=None):
        if _is_memory_mode():
            from app.services.memory_store import memory_store
            alert_obj = memory_store.get_sos_alert(str(alert.id) if hasattr(alert, 'id') else str(alert))
            if alert_obj:
                alert_obj["status"] = new_status
                if ambulance_number:
                    alert_obj["ambulance_number"] = ambulance_number
            return alert
        alert.status = new_status
        if ambulance_number:
            alert.ambulance_number = ambulance_number
        await db.flush()
        return alert


sos_service = SOSService()
