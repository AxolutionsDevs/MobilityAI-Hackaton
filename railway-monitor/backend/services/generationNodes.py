import cv2
import numpy as np
import json
import os
import easyocr
import math

# ================= CONFIGURACIÓN =================
INPUT_IMAGE = "Mexico_City_metro.png"
JSON_OUTPUT = "estaciones_final_unicas.json"
VISUAL_OUTPUT = "resultado_match_unico.jpg"

# --- PARÁMETROS ---
MIN_RADIUS = 5      
MAX_RADIUS = 20     
SENSITIVITY = 30    
UMBRAL_BLANCO = 200 
MAX_DIST_MATCH = 100 
# =================================================

def distancia_punto_a_caja(cx, cy, bbox):
    (tl, tr, br, bl) = bbox
    box_x1, box_y1 = tl
    box_x2, box_y2 = br
    closest_x = max(box_x1, min(cx, box_x2))
    closest_y = max(box_y1, min(cy, box_y2))
    return math.sqrt((cx - closest_x)**2 + (cy - closest_y)**2)

def procesar_todo():
    if not os.path.exists(INPUT_IMAGE):
        print(f"❌ No encuentro '{INPUT_IMAGE}'")
        return

    img = cv2.imread(INPUT_IMAGE)
    vis_img = img.copy()

    # 1. DETECTAR CÍRCULOS
    print("🔍 1. Buscando estaciones...")
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
                cv2.circle(vis_img, (x, y), r, (0, 255, 0), 2)

    print(f"   ✅ {len(lista_circulos)} círculos válidos.")

    # 2. OCR GLOBAL
    print("🧠 2. Leyendo textos...")
    reader = easyocr.Reader(['es'], gpu=False)
    resultados_ocr = reader.readtext(img, detail=1, paragraph=False)
    
    lista_textos = []
    for (bbox, text, prob) in resultados_ocr:
        if len(text) < 3: continue
        cx = int((bbox[0][0] + bbox[2][0]) / 2)
        cy = int((bbox[0][1] + bbox[2][1]) / 2)
        lista_textos.append({
            "id_texto": len(lista_textos), # ID único para controlar uso
            "texto": text,
            "bbox": bbox,
            "cx": cx, "cy": cy
        })
        tl = tuple(map(int, bbox[0]))
        br = tuple(map(int, bbox[2]))
        cv2.rectangle(vis_img, tl, br, (255, 0, 0), 1)

    print(f"   ✅ {len(lista_textos)} palabras detectadas.")

    # ====================================================================
    # 3. MATCHING INTELIGENTE (1 a 1)
    # ====================================================================
    print("🔗 3. Calculando mejores parejas (Greedy Matching)...")
    
    posibles_matches = []

    # A. Calcular TODAS las distancias posibles
    for i, circ in enumerate(lista_circulos):
        for txt in lista_textos:
            dist = distancia_punto_a_caja(circ['x'], circ['y'], txt['bbox'])
            if dist < MAX_DIST_MATCH:
                # Guardamos: (distancia, índice_estación, índice_texto)
                posibles_matches.append({
                    "dist": dist,
                    "idx_estacion": i,
                    "idx_texto": txt['id_texto'],
                    "nombre": txt['texto'],
                    "coords_texto": (txt['cx'], txt['cy'])
                })

    # B. Ordenar por distancia (El match más corto va primero)
    # Esto es clave: asegura que la estación más cercana gane el nombre.
    posibles_matches.sort(key=lambda x: x["dist"])

    # C. Asignar sin repetir
    estaciones_asignadas = {}     # Diccionario: id_estacion -> datos_match
    textos_usados = set()         # Set: id_texto ya usados

    for match in posibles_matches:
        idx_est = match["idx_estacion"]
        idx_txt = match["idx_texto"]

        # Si la estación NO tiene nombre Y el texto NO se ha usado
        if idx_est not in estaciones_asignadas and idx_txt not in textos_usados:
            estaciones_asignadas[idx_est] = match
            textos_usados.add(idx_txt) # ¡Marcamos este texto como OCUPADO!

    # D. Construir lista final
    estaciones_finales = []
    
    for i, circ in enumerate(lista_circulos):
        nombre_final = f"Estacion_{i}"
        match_data = None

        # Verificamos si esta estación ganó algún match en el paso anterior
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

        # Visualización
        if match_data:
            # Escribir nombre
            cv2.putText(vis_img, nombre_final, (circ['x'], circ['y']-10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 0), 1)
            # Línea amarilla conectora
            cv2.line(vis_img, (circ['x'], circ['y']), match_data["coords_texto"], (0, 255, 255), 2)

    # GUARDAR
    with open(JSON_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(estaciones_finales, f, indent=4, ensure_ascii=False)
    
    cv2.imwrite(VISUAL_OUTPUT, vis_img)
    print(f"✅ ¡LISTO! Revisa {VISUAL_OUTPUT}")

if __name__ == "__main__":
    procesar_todo()