from pydantic import BaseModel
from typing import List, Optional


class Coordinates(BaseModel):
    x: int
    y: int


class Station(BaseModel):
    id: int
    nombre: str
    coords: Coordinates
    radio: int


class StationDetectionResponse(BaseModel):
    success: bool
    total_stations: int
    stations: List[Station]
    message: Optional[str] = None
