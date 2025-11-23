from pydantic import BaseModel
from typing import List, Optional


class StationNode(BaseModel):
    id: str
    name: str
    x: int
    y: int


class MetroLine(BaseModel):
    id: str
    name: str
    color: str
    stations: List[StationNode]


class LinesDetectionResponse(BaseModel):
    success: bool
    total_lines: int
    total_stations: int
    lines: List[MetroLine]
    message: Optional[str] = None

