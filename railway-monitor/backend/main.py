from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.metro_matcher import find_best_match, get_line_color
from models.station_detection import LinesDetectionResponse, MetroLine, StationNode
from collections import defaultdict
import time
from pydantic import BaseModel
from typing import List, Union

# 1. Coordenadas de la estación detectada
class Coords(BaseModel):
    x: float
    y: float

# 2. Objeto de estación cruda (como viene de tu OCR)
class RawStationInput(BaseModel):
    id: Union[int, str]  # Puede ser número o texto
    nombre: str          # El texto sucio detectado (ej: "Stephansplz")
    coords: Coords

# 3. El Request principal que recibe el endpoint
class ProcessStationsRequest(BaseModel):
    filename: str                   # Ej: "mapa_vienna.png"
    stations: List[RawStationInput] # Lista de estaciones detectadas

    
app = FastAPI(title="Railway Monitor Backend")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "backend"}


@app.get("/")
async def root():
    return {"message": "Railway Monitor Backend"}
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from collections import defaultdict
import time
# Asumo que tienes tus modelos y funciones auxiliares importadas:
# from models import LinesDetectionResponse, MetroLine, StationNode
# from utils import find_best_match, get_line_color

class StationRequest(BaseModel):
    filename: str

# Función auxiliar para simular lo que devolvería el OCR según el nombre del archivo
def get_mock_stations_by_filename(filename: str):
    # Datos de prueba (Simulación de OCR)
    if "linea1" in filename.lower():
        return [
            {"id": 101, "nombre": "Observatorio", "coords": {"x": 100, "y": 500}},
            {"id": 102, "nombre": "Tacubaya", "coords": {"x": 150, "y": 500}},
            {"id": 103, "nombre": "Balderas", "coords": {"x": 300, "y": 500}},
            {"id": 104, "nombre": "Pino Suárez", "coords": {"x": 400, "y": 500}},
            {"id": 105, "nombre": "Pantitlán", "coords": {"x": 800, "y": 500}},
            {"id": 999, "nombre": "Texto Basura", "coords": {"x": 0, "y": 0}} # Para probar no identificadas
        ]
    elif "mix" in filename.lower():
        return [
            {"id": 201, "nombre": "Polanco", "coords": {"x": 200, "y": 300}}, # Línea 7
            {"id": 202, "nombre": "Hidalgo", "coords": {"x": 400, "y": 400}}, # Línea 2/3
            {"id": 203, "nombre": "Bellas Artes", "coords": {"x": 450, "y": 400}} # Línea 2/8
        ]
    else:
        return [] # Archivo desconocido devuelve lista vacía



@app.post("/process-detected-stations", response_model=LinesDetectionResponse)
async def process_detected_stations(request: ProcessStationsRequest):
    """
    Recibe el JSON crudo del OCR y el nombre del archivo.
    Realiza el fuzzy matching y agrupación dependiendo de la ciudad (detectada por filename).
    """
    try:
        # 1. SELECCIONAR MAPA Y COLORES SEGÚN EL NOMBRE DEL ARCHIVO
        filename = request.filename.lower()
        
        if "vienna" in filename or "wien" in filename:
            current_map = METRO_VIENNA_MAP
            current_colors = COLORS_VIENNA
            city_name = "Viena"
        else:
            # Default a CDMX
            current_map = METRO_CDMX_MAP
            current_colors = COLORS_CDMX
            city_name = "CDMX"

        # 2. PROCESAR LAS ESTACIONES QUE NOS ENVIASTE
        lines_dict = defaultdict(list)
        unmatched_stations = []
        
        # Iteramos sobre la lista que viene en el request
        for raw_station in request.stations:
            detected_name = raw_station.nombre
            
            # Hacemos match contra el mapa seleccionado
            match_result = find_best_match(detected_name, current_map)
            
            if match_result:
                real_name, line_name, score = match_result
                
                # Creamos el nodo limpio
                station_node = StationNode(
                    id=f"node-{raw_station.id}",
                    name=real_name,
                    x=raw_station.coords.x,
                    y=raw_station.coords.y
                )
                
                lines_dict[line_name].append(station_node)
            else:
                unmatched_stations.append(detected_name)
        
        # 3. CONSTRUIR LA RESPUESTA AGRUPADA
        lines = []
        for line_name, stations_list in lines_dict.items():
            metro_line = MetroLine(
                id=f"{city_name}-{line_name}-{int(time.time())}",
                name=line_name,
                color=get_line_color(line_name, current_colors),
                stations=stations_list
            )
            lines.append(metro_line)
        
        total_stations = sum(len(line.stations) for line in lines)
        
        message = f"Procesado mapa de {city_name}. Detectadas {total_stations} estaciones."
        if unmatched_stations:
            message += f" ({len(unmatched_stations)} no reconocidas)."
        
        return LinesDetectionResponse(
            success=True,
            total_lines=len(lines),
            total_stations=total_stations,
            lines=lines,
            message=message
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error procesando estaciones: {str(e)}")