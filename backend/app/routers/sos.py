"""routers/sos.py — SOS Emergency Endpoints"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import APIResponse
from app.schemas.sos import SOSRequest, SOSNearestResponse, SOSAlertResponse, SOSStatusUpdateRequest
from app.services.sos_service import sos_service
from app.models.sos_alert import SOSAlert
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/sos", tags=["SOS Emergency"])

@router.post("/nearest", response_model=APIResponse[SOSNearestResponse])
async def find_nearest_hospital(
    request: SOSRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Find nearest trauma center without creating an alert.
    Used for preview before user confirms SOS dispatch.
    """
    from app.services.hospital_service import hospital_service, estimate_travel_time
    try:
        result = await hospital_service.find_nearest_trauma_center(
            db, request.latitude, request.longitude
        )
    except Exception:
        result = None

    if not result:
        result = hospital_service._find_fallback_nearest_trauma(request.latitude, request.longitude)

    if not result:
        raise HTTPException(
            status_code=404,
            detail={"code": "NO_HOSPITAL_NEARBY", "message": "No hospitals found within 100km"},
        )
    hospital, dist = result
    eta = estimate_travel_time(dist)

    # Handle both dict (in-memory mode) and ORM object (DB mode)
    def _get(obj, key, default=None):
        if isinstance(obj, dict):
            return obj.get(key, default)
        return getattr(obj, key, default)

    h_name = _get(hospital, "name", "Unknown")
    return APIResponse(
        data=SOSNearestResponse(
            hospital_id=_get(hospital, "id", ""),
            hospital_name=h_name,
            hospital_phone=_get(hospital, "phone", ""),
            hospital_emergency_phone=_get(hospital, "emergency_phone"),
            hospital_address=_get(hospital, "address", ""),
            latitude=_get(hospital, "latitude", 0),
            longitude=_get(hospital, "longitude", 0),
            distance_km=dist,
            estimated_arrival_minutes=eta,
            beds_icu_available=_get(hospital, "beds_icu_available", 0),
            is_trauma_center=_get(hospital, "is_trauma_center", True),
        ),
        message=f"Nearest hospital found: {h_name}",
    )

@router.post("/alert", response_model=APIResponse[SOSAlertResponse], status_code=201)
async def create_sos_alert(
    request: SOSRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Create emergency SOS alert.
    Finds nearest trauma center, creates alert record, broadcasts to hospital staff.
    Target response time: < 2 seconds.
    """
    try:
        nearest, alert = await sos_service.find_nearest_and_create_alert(
            db=db,
            request=request,
        )
        from datetime import datetime
        return APIResponse(
            data=SOSAlertResponse(
                id=alert.id,
                status=alert.status if isinstance(alert.status, str) else alert.status.value,
                hospital_name=nearest.hospital_name,
                hospital_phone=nearest.hospital_phone,
                distance_km=alert.distance_km,
                estimated_arrival_minutes=alert.estimated_arrival_minutes,
                ambulance_number=alert.ambulance_number,
                created_at=alert.created_at or datetime.utcnow(),
            ),
            message=f"🚨 SOS alert sent to {nearest.hospital_name}. ETA: {nearest.estimated_arrival_minutes} minutes.",
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail={"code": "SOS_FAILED", "message": str(e)})

@router.patch("/{alert_id}", response_model=APIResponse[SOSAlertResponse])
async def update_alert_status(
    alert_id: uuid.UUID,
    data: SOSStatusUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Hospital staff: update alert status (acknowledge / dispatch / resolve)."""
    result = await db.execute(select(SOSAlert).where(SOSAlert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail={"code": "ALERT_NOT_FOUND"})

    alert = await sos_service.update_status(
        db=db,
        alert=alert,
        new_status=data.status,
        ambulance_number=data.ambulance_number,
        resolved_note=data.resolved_note,
    )
    return APIResponse(data=SOSAlertResponse.model_validate(alert), message=f"Alert status: {data.status}")

@router.get("/{alert_id}", response_model=APIResponse[SOSAlertResponse])
async def get_alert_status(alert_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Citizen: check status of their SOS alert."""
    result = await db.execute(select(SOSAlert).where(SOSAlert.id == alert_id))
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail={"code": "ALERT_NOT_FOUND"})
    return APIResponse(data=SOSAlertResponse.model_validate(alert), message="Alert status")

@router.websocket("/ws/{hospital_id}")
async def hospital_sos_ws(hospital_id: str, websocket: WebSocket):
    """
    WebSocket endpoint for hospital staff dashboard.
    Hospital staff connect here to receive real-time SOS alerts.

    Usage:
        const ws = new WebSocket('wss://api.medroute.in/api/sos/ws/{hospital_id}');
        ws.onmessage = (e) => {
            const alert = JSON.parse(e.data);
            if (alert.type === 'sos_alert') showAlertBanner(alert);
        };
    """
    await websocket.accept()
    sos_service.register_ws(hospital_id, websocket)
    try:
        while True:
            # Keep connection alive — wait for client ping
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        sos_service.unregister_ws(hospital_id, websocket)
