from datetime import datetime

from pydantic import BaseModel


class RailwayIncident(BaseModel):
    timestamp: datetime
    estacion: str
    categoria: str
    gravedad: str
    texto_original: str


