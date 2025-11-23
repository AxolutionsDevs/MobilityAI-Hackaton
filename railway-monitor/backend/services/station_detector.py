import cv2
import numpy as np
import easyocr
import math
from typing import List, Dict, Any
import tempfile
import os


# --- PARÁMETROS ---
MIN_RADIUS = 5      
MAX_RADIUS = 20     
SENSITIVITY = 30    
UMBRAL_BLANCO = 200 
MAX_DIST_MATCH = 100 


def distancia_punto_a_caja(cx: int, cy: int, bbox) -> float:
    """Calcula la distancia mínima entre un punto y una caja delimitadora."""
    (tl, tr, br, bl) = bbox
    box_x1, box_y1 = tl
    box_x2, box_y2 = br
    closest_x = max(box_x1, min(cx, box_x2))
    closest_y = max(box_y1, min(cy, box_y2))
    return math.sqrt((cx - closest_x)**2 + (cy - closest_y)**2)


def detect_stations_from_image(image_bytes: bytes) -> List[Dict[str, Any]]:
    """
    Detecta estaciones de metro en una imagen PNG.
    
    Args:
        image_bytes: Bytes de la imagen PNG
        
    Returns:
        Lista de diccionarios con información de cada estación detectada
    """
    # Guardar temporalmente la imagen
    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_file:
        tmp_file.write(image_bytes)
        tmp_path = tmp_file.name
    
    try:
        # Leer la imagen
        img = cv2.imread(tmp_path)
        if img is None:
            raise ValueError("No se pudo leer la imagen")
        
        # 1. DETECTAR CÍRCULOS
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray_blurred = cv2.medianBlur(gray, 7)

        circles = cv2.HoughCircles(
            gray_blurred, cv2.HOUGH_GRADIENT, dp=1,
            minDist=15, param1=50, param2=SENSITIVITY,
            minRadius=MIN_RADIUS, maxRadius=MAX_RADIUS
        )

        lista_circulos = []
        if circles is not None:
            circles = np.round(circles[0, :]).astype("int")
            h, w, _ = img.shape
            for (x, y, r) in circles:
                if y < h and x < w and np.mean(img[y, x]) > UMBRAL_BLANCO:
                    lista_circulos.append({"x": int(x), "y": int(y), "r": int(r)})

        # 2. OCR GLOBAL
        reader = easyocr.Reader(['es'], gpu=False)
        resultados_ocr = reader.readtext(img, detail=1, paragraph=False)
        
        lista_textos = []
        for (bbox, text, prob) in resultados_ocr:
            if len(text) < 3:
                continue
            cx = int((bbox[0][0] + bbox[2][0]) / 2)
            cy = int((bbox[0][1] + bbox[2][1]) / 2)
            lista_textos.append({
                "id_texto": len(lista_textos),
                "texto": text,
                "bbox": bbox,
                "cx": cx, 
                "cy": cy
            })

        # 3. MATCHING INTELIGENTE (1 a 1)
        posibles_matches = []

        # A. Calcular TODAS las distancias posibles
        for i, circ in enumerate(lista_circulos):
            for txt in lista_textos:
                dist = distancia_punto_a_caja(circ['x'], circ['y'], txt['bbox'])
                if dist < MAX_DIST_MATCH:
                    posibles_matches.append({
                        "dist": dist,
                        "idx_estacion": i,
                        "idx_texto": txt['id_texto'],
                        "nombre": txt['texto'],
                        "coords_texto": (txt['cx'], txt['cy'])
                    })

        # B. Ordenar por distancia
        posibles_matches.sort(key=lambda x: x["dist"])

        # C. Asignar sin repetir
        estaciones_asignadas = {}
        textos_usados = set()

        for match in posibles_matches:
            idx_est = match["idx_estacion"]
            idx_txt = match["idx_texto"]

            if idx_est not in estaciones_asignadas and idx_txt not in textos_usados:
                estaciones_asignadas[idx_est] = match
                textos_usados.add(idx_txt)

        # D. Construir lista final
        estaciones_finales = []
        
        for i, circ in enumerate(lista_circulos):
            nombre_final = f"Estacion_{i}"

            if i in estaciones_asignadas:
                match_data = estaciones_asignadas[i]
                nombre_final = match_data["nombre"]

            estacion = {
                "id": i,
                "nombre": nombre_final,
                "coords": {"x": circ['x'], "y": circ['y']},
                "radio": circ['r']
            }
            estaciones_finales.append(estacion)

        return estaciones_finales
        
    finally:
        # Limpiar archivo temporal
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
