from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.station_detector import detect_stations_from_image
from services.metro_matcher import find_best_match, get_line_color
from models.station_detection import LinesDetectionResponse, MetroLine, StationNode
from collections import defaultdict
import time

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


@app.post("/detect-stations", response_model=LinesDetectionResponse)
async def detect_stations(file: UploadFile = File(...)):
    """
    Endpoint para detectar estaciones de metro en una imagen PNG.
    Hace fuzzy matching con las estaciones del Metro CDMX y agrupa por línea.
    
    Args:
        file: Archivo PNG con el mapa del metro
        
    Returns:
        JSON con las líneas y estaciones detectadas agrupadas
    """
    # Validar que sea un archivo de imagen
    if not file.content_type or "image" not in file.content_type:
        raise HTTPException(
            status_code=400, 
            detail="El archivo debe ser una imagen (PNG recomendado)"
        )
    
    try:
        # Leer los bytes de la imagen
        image_bytes = await file.read()
        
        # Procesar la imagen
        stations_data = detect_stations_from_image(image_bytes)
        
        # Agrupar estaciones por línea usando fuzzy matching
        lines_dict = defaultdict(list)
        unmatched_stations = []
        
        for station in stations_data:
            detected_name = station["nombre"]
            
            # Intentar hacer match con estaciones reales
            match_result = find_best_match(detected_name)
            
            if match_result:
                real_name, line_name, score = match_result
                
                # Crear nodo de estación
                station_node = StationNode(
                    id=f"node-{station['id']}",
                    name=real_name,
                    x=station["coords"]["x"],
                    y=station["coords"]["y"]
                )
                
                lines_dict[line_name].append(station_node)
            else:
                # Estación no identificada
                unmatched_stations.append(detected_name)
        
        # Convertir a lista de MetroLine
        lines = []
        for line_name, stations in lines_dict.items():
            metro_line = MetroLine(
                id=f"custom-{int(time.time() * 1000)}",
                name=line_name,
                color=get_line_color(line_name),
                stations=stations
            )
            lines.append(metro_line)
        
        total_stations = sum(len(line.stations) for line in lines)
        
        message = f"Se detectaron {total_stations} estaciones en {len(lines)} líneas"
        if unmatched_stations:
            message += f". {len(unmatched_stations)} estaciones no identificadas"
        
        return LinesDetectionResponse(
            success=True,
            total_lines=len(lines),
            total_stations=total_stations,
            lines=lines,
            message=message
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar la imagen: {str(e)}"
        )


