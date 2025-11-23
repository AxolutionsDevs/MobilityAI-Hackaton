from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.svg_processor import parse_svg
from models.svg_models import SVGProcessResponse

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


