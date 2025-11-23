import xml.etree.ElementTree as ET

SVG_PATH = "Mexico_City_metro.svg"   # aquí pon la ruta de tu svg

def clean_tag(tag):
    """Elimina el namespace del tag."""
    return tag.split("}", 1)[1] if "}" in tag else tag

def es_nombre_estacion(texto):
    """Filtra nombres reales de estaciones."""
    t = texto.strip()

    # descartar textos vacíos
    if not t:
        return False

    # descartar números (1, 2, 8, 12)
    if t.isdigit():
        return False

    # descartar letras aisladas (A, B)
    if len(t) == 1:
        return False

    # descartar textos muy cortos como 'N', 'S', etc.
    if len(t) < 3:
        return False

    return True

# ===============================
#     PARSING DEL SVG
# ===============================
tree = ET.parse(SVG_PATH)
root = tree.getroot()

estaciones = []

for el in root.iter():
    if clean_tag(el.tag) == "text":
        # obtener texto completo del nodo
        nombre = "".join(el.itertext()).strip()

        if not es_nombre_estacion(nombre):
            continue

        # obtener coordenadas
        x = el.get("x")
        y = el.get("y")

        # algunos <text> no tienen x,y directo
        if x is None or y is None:
            continue

        estaciones.append({
            "nombre": nombre,
            "x": float(x),
            "y": float(y)
        })

# imprimir resultados
for est in estaciones:
    print(f"{est['nombre']}: x={est['x']}, y={est['y']}")
