import pandas as pd
import random

# ================= CONFIGURACIÓN DE ARCHIVOS =================
archivo_entrada = 'datasets/customer-Emails_Espanol_5000.xlsx'
archivo_salida = 'datasets/Dataset_Vienna_Final.xlsx'

print(f"--- Iniciando proceso para Metro de Viena (U-Bahn) ---")

# 1. CARGAR ARCHIVO
try:
    df = pd.read_excel(archivo_entrada)
    print(f"Archivo cargado. Total de filas: {len(df)}")
except FileNotFoundError:
    print(f"ERROR: No se encontró '{archivo_entrada}'. Verifica la carpeta y el nombre.")
    exit()

# ================= MAPA DEL METRO DE VIENA =================
metro_vienna_map = {
    "U1 (Rot)": [
        "Leopoldau", "Großfeldsiedlung", "Aderklaaer Straße", "Rennbahnweg", 
        "Kagraner Platz", "Kagran", "Alte Donau", "Kaisermühlen", "Donauinsel", 
        "Vorgartenstraße", "Praterstern", "Nestroyplatz", "Schwedenplatz", 
        "Stephansplatz", "Karlsplatz", "Taubstummengasse", "Südtiroler Platz", 
        "Keplerplatz", "Reumannplatz"
    ],
    "U2 (Violett)": [
        "Aspernstraße", "Donauspital", "Hardeggasse", "Stadlau", "Donaustadtbrücke", 
        "Donaumarina", "Stadion", "Krieau", "Messe-Prater", "Praterstern", 
        "Taborstraße", "Schottenring", "Schottentor", "Rathaus", "Volkstheater", 
        "Museumsquartier", "Karlsplatz"
    ],
    "U3 (Orange)": [
        "Ottakring", "Kendlerstraße", "Hütteldorfer Straße", "Johnstraße", 
        "Schweglerstraße", "Westbahnhof", "Zieglergasse", "Neubaugasse", 
        "Volkstheater", "Herrengasse", "Stephansplatz", "Stubentor", "Landstraße", 
        "Rochusgasse", "Kardinal-Nagl-Platz", "Schlachthausgasse", "Erdberg", 
        "Gasometer", "Zippererstraße", "Enkplatz", "Simmering"
    ],
    "U4 (Grün)": [
        "Hütteldorf", "Ober St. Veit", "Unter St. Veit", "Braunschweiggasse", 
        "Hietzing", "Schönbrunn", "Meidling Hauptstraße", "Längenfeldgasse", 
        "Margaretengürtel", "Pilgramgasse", "Kettenbrückengasse", "Karlsplatz", 
        "Stadtpark", "Landstraße", "Schwedenplatz", "Schottenring", "Roßauer Lände", 
        "Friedensbrücke", "Spittelau", "Heiligenstadt"
    ],
    "U6 (Braun)": [
        "Siebenhirten", "Perfektastraße", "Erlaaer Straße", "Alterlaa", 
        "Am Schöpfwerk", "Tscherttegasse", "Philadelphiabrücke", "Niederhofstraße", 
        "Längenfeldgasse", "Gumpendorfer Straße", "Westbahnhof", "Burggasse", 
        "Thaliastraße", "Josefstädter Straße", "Alser Straße", "Michelbeuern", 
        "Währinger Straße", "Nußdorfer Straße", "Spittelau", "Jägerstraße", 
        "Dresdner Straße", "Handelskai", "Neue Donau", "Floridsdorf"
    ]
}

# ================= REGLAS DE DETECCIÓN (TRADUCIDAS ALEMÁN/ESPAÑOL) =================
# Las CLAVES están en Alemán (para que el reporte salga en alemán).
# Los VALORES incluyen palabras en Español (para detectar en tus emails) y Alemán.
reglas_detalle = {
    "Diebstahl (Robo)": ["robo", "asalto", "cartera", "celular", "ladrón", "quitaron", "bolsearon", "sustrajeron", "diebstahl", "taschendieb", "gestohlen"],
    "Belästigung (Acoso)": ["acoso", "tocamiento", "mirbos", "morboso", "mujer", "insegura", "perseguir","agresivo","piropos", "belästigung", "verfolgt", "unsicher"],
    "Vandalismus (Vandalismo)": ["vandalismo", "graffiti", "rayado", "vidrio roto", "destrucción", "daño", "vandalismus", "beschädigung", "zerstört"],
    "Mangelnde Sicherheit (Seguridad)": ["vigilancia", "policia", "guardia", "seguridad", "solos", "nadie cuida","reservado","discapacidad","sospechoso","respuesta", "sicherheit", "polizei"],
    
    "Defekte Aufzüge/Rolltreppen": ["escalera", "electrica", "no sirve", "subir", "bajar", "descompuesta", "rampa", "aufzug", "lift", "rolltreppe", "defekt"],
    "Verschmutzung (Suciedad)": ["basura", "sucio", "cochino", "limpieza", "desperdicio", "mancha", "mugre", "schmutzig", "müll", "dreckig"],
    "Wasserschaden (Fugas)": ["fuga", "agua", "goteo", "charco", "mojado", "inundado", "lluvia", "wasser", "undicht"],
    "Beleuchtungsausfall (Iluminación)": ["iluminacion", "luz", "oscuro", "foco", "lampara", "alumbrado", "apagado", "licht", "dunkel", "beleuchtung"],
    "Entwerter Probleme (Validadores)": ["torniquete", "acceso", "tarjeta", "validador", "entrada", "no lee", "entwerter", "ticket", "fahrschein"],
    
    "Verspätung (Retrasos)": ["retraso", "tarde", "hora", "demora", "tiempo", "espera", "llegar", "cancelación", "meteorológicas", "verspätung", "spät", "warten"],
    "Langsame Fahrt (Tren lento)": ["lento", "parado", "no avanza", "tortuga", "detenido", "velocidad","climático", "langsam", "steht"],
    "Überfüllung (Saturación)": ["saturación", "lleno", "gente", "empujones", "caber", "apretados", "full","cancelación", "voll", "überfüllt", "gedränge"],
    "Ruppige Fahrweise (Conducción)": ["brusca", "frenón", "golpe", "jalón", "conductor", "maneja mal", "bremsen", "fahrer"],
    
    "Hitze (Calor)": ["calor", "horno", "sudor", "temperatura", "infierno", "caliente","meteorológicas", "heiß", "hitze", "warm"],
    "Schlechte Belüftung (Aire)": ["aire", "asfixia", "respirar", "ventilación", "ahogo", "sofocado","meteorológicas", "luft", "atmen", "stickig"],
    "Geruchsbelästigung (Mal olor)": ["olor", "peste", "huele", "apesta", "podrido", "hedor","suciedad","papeleras", "stinkt", "geruch"],
    "Lärm (Ruido)": ["ruido", "bocina", "gritos", "fuerte", "escándalo", "sonido", "laut", "lärm", "geräusch"],
    
    "Unfreundliches Personal": ["grosero", "actitud", "déspota", "trato", "malo", "gritó", "educación","reembolso", "personal", "unfreundlich", "mitarbeiter"],
    "Geschlossene Schalter": ["taquilla", "cerrada", "boleto", "nadie atiende", "venta","billete", "schalter", "geschlossen"],
    "Automaten defekt": ["máquina", "recarga", "traga", "moneda", "dinero", "servicio", "automat", "kaputt", "funktioniert nicht"],
    "Fehlende Beschilderung": ["señalización", "letrero", "mapa", "perderse", "indicación","asignado","informacion","informativos","anuncios","guías", "schild", "orientierung"],
    "Allgemeine Beschwerde": ["comprado", "perdido","accidental", "queja", "problema"]
}

print("Procesando filas (Asignando Estaciones de Viena + Analizando Asunto)...")

nombres_est = []
lineas_est = []
ids_est = []
asuntos_finales = [] 

columna_queja = 'Contenido' 

# 2. PROCESAMIENTO
for i in range(len(df)):
    
    # --- A. LÓGICA DE ESTACIONES (SOLO VIENA) ---
    linea = random.choice(list(metro_vienna_map.keys()))
    estacion = random.choice(metro_vienna_map[linea])
    id_code = f"VIE-{random.randint(1000, 9999)}"

    nombres_est.append(estacion)
    lineas_est.append(linea)
    ids_est.append(id_code)

    # --- B. ANÁLISIS DE ASUNTO ---
    queja_texto = str(df.iloc[i][columna_queja]).lower()
    
    # Valor por defecto en Alemán
    asunto_detectado = "Allgemeines / Sonstiges"

    match_found = False
    for asunto, keywords in reglas_detalle.items():
        for word in keywords:
            if word in queja_texto:
                asunto_detectado = asunto 
                match_found = True
                break
        if match_found:
            break
            
    asuntos_finales.append(asunto_detectado)

# 3. GUARDAR RESULTADOS EN DATAFRAME
df['NombredeEstacion'] = nombres_est
df['IdEstacion'] = ids_est
df['Linea'] = lineas_est
df['Asunto'] = asuntos_finales 

# Limpieza de columnas viejas si existen
if 'Clasificacion_Problema' in df.columns:
    df.drop(columns=['Clasificacion_Problema'], inplace=True)
if 'Asunto_Generado' in df.columns:
    df.drop(columns=['Asunto_Generado'], inplace=True)

# 4. EXPORTAR
df.to_excel(archivo_salida, index=False)

print(f"¡LISTO! Archivo generado para Viena: {archivo_salida}")