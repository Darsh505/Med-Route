"""schemas/sos.py — SOS Emergency Schemas"""

import uuid
from datetime import datetime
from typing import Optional, Union
from pydantic import BaseModel, Field

class SOSRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    emergency_description: Optional[str] = Field(None, max_length=500)
    patient_name: Optional[str] = Field(None, max_length=100)
    contact_phone: Optional[str] = None

class SOSNearestResponse(BaseModel):
    """Response from /api/sos/nearest — nearest trauma center."""
    hospital_id: Union[uuid.UUID, str]
    hospital_name: str
    hospital_phone: str
    hospital_emergency_phone: Optional[str]
    hospital_address: str
    latitude: float
    longitude: float
    distance_km: float
    estimated_arrival_minutes: int
    beds_icu_available: int
    is_trauma_center: bool

class SOSAlertResponse(BaseModel):
    id: Union[uuid.UUID, str]
    status: str
    hospital_name: Optional[str]
    hospital_phone: Optional[str]
    distance_km: Optional[float]
    estimated_arrival_minutes: Optional[int]
    ambulance_number: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}

class SOSStatusUpdateRequest(BaseModel):
    status: str  # acknowledged | dispatched | resolved | cancelled
    ambulance_number: Optional[str] = None
    resolved_note: Optional[str] = None
