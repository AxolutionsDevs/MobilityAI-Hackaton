from pydantic import BaseModel
from typing import List, Optional

# 1. Nodo de una estación individual (ya procesada y limpia)
class StationNode(BaseModel):
    id: str
    name: str
    x: float
    y: float

# 2. Una línea de metro que contiene una lista de estaciones
class MetroLine(BaseModel):
    id: str
    name: str       # Ej: "Línea 1", "U1"
    color: str      # Ej: "#F54EA2"
    stations: List[StationNode]

# 3. La respuesta principal del endpoint
class LinesDetectionResponse(BaseModel):
    success: bool
    total_lines: int
    total_stations: int
    lines: List[MetroLine]
    message: str