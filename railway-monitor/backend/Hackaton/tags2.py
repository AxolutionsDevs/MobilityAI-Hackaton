import xml.etree.ElementTree as ET
import cairosvg
import cv2
import numpy as np
import matplotlib.pyplot as plt

SVG_PATH = "Mexico_City_metro.svg"
PNG_PATH = "mapa_raster.png"
OUT_PATH = "nodos_pegados.png"

# ===============================
# 1. Convertir SVG → PNG
# ===============================
print("Convirtiendo SVG a PNG...")
cairosvg.svg2png(url=SVG_PATH, write_to=PNG_PATH, scale=3.0)

img = cv2.imread(PNG_PATH)
h, w, _ = img.shape
print(f"Imagen cargada: {w}x{h}")

# ===============================
# 2. DETECTAR LÍNEAS DE COLORES
# ===============================
print("Detectando líneas de colores del metro...")

hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
h_channel, s_channel, v_channel = cv2.split(hsv)

# Máscara de colores saturados (líneas de metro)
mask_colores = np.zeros((h, w), dtype=np.uint8)

for y in range(h):
    for x in range(w):
        s = s_channel[y, x]
        v = v_channel[y, x]
        b, g, r = img[y, x]
        
        # Color saturado y NO gris/blanco/negro
        if s > 80 and v > 50 and v < 250:
            if not (abs(int(r) - int(g)) < 30 and abs(int(g) - int(b)) < 30):
                mask_colores[y, x] = 255

# Morfología para limpiar
kernel = np.ones((7, 7), np.uint8)
mask_colores = cv2.morphologyEx(mask_colores, cv2.MORPH_CLOSE, kernel)
mask_colores = cv2.dilate(mask_colores, np.ones((5, 5), np.uint8), iterations=1)

cv2.imwrite("mask_colores.png", mask_colores)
print("✓ Máscara guardada: mask_colores.png")

# ===============================
# 3. Leer estaciones del SVG
# ===============================
def clean(tag):
    return tag.split("}", 1)[1] if "}" in tag else tag

def es_estacion(t):
    t = t.strip()
    if len(t) < 3: return False
    if t.isdigit(): return False
    if len(t) == 1: return False
    return True

tree = ET.parse(SVG_PATH)
root = tree.getroot()

viewBox = root.get('viewBox')
if viewBox:
    vb = [float(x) for x in viewBox.split()]
    svg_w, svg_h = vb[2], vb[3]
else:
    svg_w = float(root.get('width', '1000').replace('px', ''))
    svg_h = float(root.get('height', '1000').replace('px', ''))

scale_x = w / svg_w
scale_y = h / svg_h
print(f"Escala: {scale_x:.2f}x, {scale_y:.2f}y")

estaciones = []
for el in root.iter():
    if clean(el.tag) == "text":
        nombre = "".join(el.itertext()).strip()
        if not es_estacion(nombre):
            continue
        x = el.get("x")
        y = el.get("y")
        if x and y:
            x_png = int(float(x) * scale_x)
            y_png = int(float(y) * scale_y)
            estaciones.append({
                "nombre": nombre,
                "x": x_png,
                "y": y_png
            })

print(f"✓ {len(estaciones)} estaciones detectadas")

# ===============================
# 4. COLOCAR NODO EN EL BORDE DEL TEXTO MÁS CERCANO A LA LÍNEA
# ===============================
def encontrar_linea_mas_cercana(x, y, radio_max=300):
    """
    Encuentra la posición de la línea de color más cercana.
    Retorna (x, y, direccion) donde direccion es el ángulo hacia la línea.
    """
    mejor = None
    mejor_dist = float('inf')
    
    for radio in range(10, radio_max, 5):
        n_puntos = max(20, radio * 2)
        
        for i in range(n_puntos):
            angulo = 2 * np.pi * i / n_puntos
            xx = int(x + radio * np.cos(angulo))
            yy = int(y + radio * np.sin(angulo))
            
            if 0 <= xx < w and 0 <= yy < h:
                if mask_colores[yy, xx] > 0:
                    dist = (xx - x)**2 + (yy - y)**2
                    if dist < mejor_dist:
                        mejor_dist = dist
                        mejor = (xx, yy, angulo)
        
        if mejor and mejor_dist < (radio * 1.5)**2:
            break
    
    return mejor

def colocar_nodo_en_borde_texto(x_texto, y_texto, nombre_texto):
    """
    Encuentra dónde está la línea y coloca el nodo en el borde del texto
    usando el tamaño REAL del texto.
    """
    # Buscar línea más cercana
    resultado = encontrar_linea_mas_cercana(x_texto, y_texto, radio_max=300)
    
    if resultado is None:
        return x_texto, y_texto, 0
    
    x_linea, y_linea, angulo = resultado
    
    # Calcular vector hacia la línea
    dx = x_linea - x_texto
    dy = y_linea - y_texto
    distancia_linea = np.sqrt(dx**2 + dy**2)
    
    if distancia_linea == 0:
        return x_texto, y_texto, 0
    
    # Normalizar vector
    dx_norm = dx / distancia_linea
    dy_norm = dy / distancia_linea
    
    # Calcular tamaño REAL del texto
    ancho_texto = len(nombre_texto) * 12
    alto_texto = 30
    
    # MULTIPLICADOR GRANDE para mover MUCHO más lejos
    MULTIPLICADOR = 1
    
    # Decidir desplazamiento según dirección predominante
    # Usar el componente direccional para mantener la dirección correcta
    if abs(dx_norm) > abs(dy_norm):
        # Movimiento HORIZONTAL predominante
        # Usar el ancho del texto y MANTENER el signo de dx_norm
        desplazamiento = ancho_texto * 0.5 * MULTIPLICADOR * np.sign(dx_norm)
        x_nodo = int(x_texto + desplazamiento)
        y_nodo = int(y_texto + dy_norm * abs(desplazamiento) * 0.3)  # Pequeño ajuste vertical
    else:
        # Movimiento VERTICAL predominante
        # Usar la altura del texto y MANTENER el signo de dy_norm
        desplazamiento = alto_texto * 1.0 * MULTIPLICADOR * np.sign(dy_norm)
        x_nodo = int(x_texto + dx_norm * abs(desplazamiento) * 0.3)  # Pequeño ajuste horizontal
        y_nodo = int(y_texto + desplazamiento)
    
    return x_nodo, y_nodo, distancia_linea

print("Colocando nodos en bordes de texto cercanos a líneas...")
nodos_pegados = []

for i, e in enumerate(estaciones):
    x_nodo, y_nodo, dist = colocar_nodo_en_borde_texto(
        e["x"], e["y"], 
        e["nombre"]  # Pasar el nombre del texto
    )
    
    nodos_pegados.append({
        "nombre": e["nombre"],
        "x_orig": e["x"],
        "y_orig": e["y"],
        "x": x_nodo,
        "y": y_nodo,
        "dist": dist
    })
    
    if (i + 1) % 50 == 0:
        print(f"  {i+1}/{len(estaciones)} procesados...")

print(f"✓ {len(nodos_pegados)} nodos colocados")

# ===============================
# 5. VISUALIZACIÓN
# ===============================
print("Generando visualización...")

fig = plt.figure(figsize=(28, 10))

# Panel 1: Máscara de líneas
ax1 = plt.subplot(1, 3, 1)
ax1.imshow(mask_colores, cmap='hot')
ax1.set_title("LÍNEAS DE COLORES DETECTADAS", fontsize=16, fontweight='bold')
ax1.axis('off')

# Panel 2: Nodos originales (centro del texto)
ax2 = plt.subplot(1, 3, 2)
ax2.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
for e in estaciones:
    ax2.scatter(e["x"], e["y"], s=80, c='blue', alpha=0.7, 
                edgecolors='white', linewidth=2, marker='o', zorder=10)
ax2.set_title("POSICIONES ORIGINALES (centro texto)", fontsize=16, fontweight='bold')
ax2.axis('off')

# Panel 3: Nodos en borde del texto
ax3 = plt.subplot(1, 3, 3)
ax3.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

# Dibujar vectores mostrando el desplazamiento
for n in nodos_pegados:
    if n["dist"] > 0:
        # Línea del centro del texto al borde
        ax3.arrow(n["x_orig"], n["y_orig"], 
                 n["x"] - n["x_orig"], n["y"] - n["y_orig"],
                 head_width=10, head_length=10, fc='yellow', ec='orange', 
                 alpha=0.7, linewidth=2, zorder=5)

# Dibujar nodos en el borde del texto
for n in nodos_pegados:
    ax3.scatter(n["x"], n["y"], s=80, c='lime', alpha=0.95, 
                edgecolors='black', linewidth=2.5, marker='o', zorder=10)

ax3.set_title("NODOS EN BORDE DEL TEXTO (hacia línea)", fontsize=16, fontweight='bold')
ax3.axis('off')

plt.tight_layout()
plt.savefig(OUT_PATH, dpi=150, bbox_inches='tight')
print(f"✓ Imagen guardada: {OUT_PATH}")

# ===============================
# 6. Guardar coordenadas
# ===============================
with open("coordenadas_finales.csv", "w", encoding="utf-8") as f:
    f.write("nombre,x_nodo,y_nodo,x_texto,y_texto,distancia_a_linea\n")
    for n in nodos_pegados:
        f.write(f'"{n["nombre"]}",{n["x"]},{n["y"]},{n["x_orig"]},{n["y_orig"]},{n["dist"]:.1f}\n')

print("✓ Coordenadas guardadas: coordenadas_finales.csv")

# Estadísticas
distancias = [n["dist"] for n in nodos_pegados]
sin_linea = sum(1 for d in distancias if d == 0)

print(f"\n📊 ESTADÍSTICAS:")
print(f"   Total de nodos: {len(nodos_pegados)}")
print(f"   Nodos con línea detectada: {len(nodos_pegados) - sin_linea}")
print(f"   Nodos sin línea cercana: {sin_linea}")
print(f"   Distancia promedio a línea: {np.mean([d for d in distancias if d > 0]):.1f} px")
print(f"\n✅ LISTO - Los nodos están en el BORDE del texto hacia la línea más cercana")