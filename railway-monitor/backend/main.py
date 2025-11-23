from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.metro_matcher import find_best_match, get_line_color, METRO_CDMX_MAP, METRO_VIENNA_MAP, LINE_COLORS, COLORS_VIENNA, similarity_ratio
from services.station_coords import METRO_CDMX_COORDS, METRO_VIENNA_COORDS
from models.station_detection import LinesDetectionResponse, MetroLine, StationNode
from collections import defaultdict
import time
import json
import os

app = FastAPI(title="Railway Monitor Backend")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
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
    Endpoint que recibe una imagen PNG y detecta las estaciones.
    Según el nombre del archivo (vienna.png o cdmx.png), carga el JSON correspondiente
    y hace fuzzy matching con las estaciones del Metro.
    
    Args:
        file: Archivo PNG con el mapa del metro (vienna.png o cdmx.png)
        
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
        # 1. DETERMINAR CIUDAD POR NOMBRE DE ARCHIVO
        filename = file.filename.lower() if file.filename else ""
        
        if "vienna" in filename or "wien" in filename:
            json_file = "services/estacionesvienna.json"
            current_map = METRO_VIENNA_MAP
            current_colors = COLORS_VIENNA
            city_name = "Vienna"
        elif "cdmx" in filename or "mexico" in filename:
            json_file = "services/estacionescdmx.json"
            current_map = METRO_CDMX_MAP
            current_colors = LINE_COLORS
            city_name = "CDMX"
        else:
            raise HTTPException(
                status_code=400,
                detail="El nombre del archivo debe contener 'vienna' o 'cdmx' para identificar la ciudad"
            )
        
        # 2. CARGAR JSON CON ESTACIONES DETECTADAS
        json_path = os.path.join(os.path.dirname(__file__), json_file)
        
        if not os.path.exists(json_path):
            raise HTTPException(
                status_code=404,
                detail=f"No se encontró el archivo JSON: {json_file}"
            )
        
        with open(json_path, 'r', encoding='utf-8') as f:
            stations_data = json.load(f)
        
        # 3. PROCESAR ESTACIONES CON FUZZY MATCHING
        lines_dict = defaultdict(list)
        unmatched_stations = []
        
        for station in stations_data:
            detected_name = station["nombre"]
            
            # Hacer match contra el mapa seleccionado
            match_result = find_best_match(detected_name, current_map)
            
            if match_result:
                real_name, line_name, score = match_result
                
                # FIX DE GEOMETRÍA: Intentar buscar coordenada maestra
                # Usamos las coordenadas detectadas por defecto
                x = float(station["coords"]["x"])
                y = float(station["coords"]["y"])
                
                target_coords_map = None
                if city_name == "CDMX":
                    target_coords_map = METRO_CDMX_COORDS
                elif city_name == "Vienna":
                    target_coords_map = METRO_VIENNA_COORDS
                
                if target_coords_map:
                    # 1. Intentar match exacto con el nombre real detectado
                    if real_name in target_coords_map:
                        x = target_coords_map[real_name]["x"]
                        y = target_coords_map[real_name]["y"]
                    else:
                        # 2. Fuzzy match contra las claves de COORDS para encontrar la posición correcta
                        best_coord_match = None
                        best_coord_score = 0.0
                        
                        for coord_name in target_coords_map.keys():
                            # Usamos similarity_ratio importado de metro_matcher
                            sim_score = similarity_ratio(real_name, coord_name)
                            if sim_score > best_coord_score:
                                best_coord_score = sim_score
                                best_coord_match = coord_name
                        
                        # Si encontramos un match de coordenada muy probable (> 0.75)
                        if best_coord_score > 0.75 and best_coord_match:
                            x = target_coords_map[best_coord_match]["x"]
                            y = target_coords_map[best_coord_match]["y"]
                
                # Crear nodo de estación
                station_node = StationNode(
                    id=f"node-{station['id']}",
                    name=real_name,
                    x=x,
                    y=y
                )
                
                lines_dict[line_name].append(station_node)
            else:
                # Estación no identificada
                unmatched_stations.append(detected_name)
        
        # 4. CONSTRUIR RESPUESTA AGRUPADA POR LÍNEA
        lines = []
        for line_name, stations_list in lines_dict.items():
            # ---------------------------------------------------------
            # ORDENAMIENTO TOPOLÓGICO (FIX para evitar líneas zigzag)
            # Usamos el orden oficial definido en metro_matcher.py
            # ---------------------------------------------------------
            if line_name in current_map:
                official_order = current_map[line_name]
                # Crear un mapa de índices { "NombreEstación": Indice }
                order_map = {station: i for i, station in enumerate(official_order)}
                
                # Ordenar la lista de estaciones detectadas según su índice oficial
                # Si por alguna razón el nombre no está (raro pq viene de find_best_match), lo manda al final (999)
                stations_list.sort(key=lambda s: order_map.get(s.name, 999))

            metro_line = MetroLine(
                id=f"{city_name}-{line_name}-{int(time.time() * 1000)}",
                name=line_name,
                color=get_line_color(line_name, current_colors),
                stations=stations_list
            )
            lines.append(metro_line)
        
        total_stations = sum(len(line.stations) for line in lines)
        
        message = f"Procesado mapa de {city_name}. {total_stations} estaciones identificadas en {len(lines)} líneas"
        if unmatched_stations:
            message += f". {len(unmatched_stations)} estaciones no reconocidas"
        
        return LinesDetectionResponse(
            success=True,
            total_lines=len(lines),
            total_stations=total_stations,
            lines=lines,
            message=message
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar la imagen: {str(e)}"
        )

