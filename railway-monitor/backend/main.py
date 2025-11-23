from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.svg_processor import parse_svg
from services.station_detector import detect_stations_from_image
from models.svg_models import SVGProcessResponse
from models.station_detection import StationDetectionResponse, Station, Coordinates

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


@app.post("/detect-stations", response_model=StationDetectionResponse)
async def detect_stations(file: UploadFile = File(...)):
    """
    Endpoint para detectar estaciones de metro en una imagen PNG.
    
    Args:
        file: Archivo PNG con el mapa del metro
        
    Returns:
        JSON con las estaciones detectadas
    """
    # Validar que sea un archivo PNG
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
        
        # Convertir a modelos Pydantic
        stations = [
            Station(
                id=s["id"],
                nombre=s["nombre"],
                coords=Coordinates(x=s["coords"]["x"], y=s["coords"]["y"]),
                radio=s["radio"]
            )
            for s in stations_data
        ]
        
        return StationDetectionResponse(
            success=True,
            total_stations=len(stations),
            stations=stations,
            message=f"Se detectaron {len(stations)} estaciones exitosamente"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar la imagen: {str(e)}"
        )


