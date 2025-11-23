import pandas as pd
import random

# ================= CONFIGURACIÓN DE ARCHIVOS =================
archivo_entrada = 'datasets/Kundenemails-deutsch_5000.xlsx'
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
    "Diebstahl (Robo)": [
        "diebstahl", "raub", "überfall", "brieftasche", "geldbörse", "portemonnaie", 
        "handy", "smartphone", "dieb", "weggenommen", "bestohlen", "entwendet", 
        "taschendieb", "gestohlen", "geklaut"
    ],
    "Belästigung (Acoso)": [
        "belästigung", "anfassen", "berührung", "angrabschen", "anstarren", "gaffen", 
        "lüstern", "obszön", "frau", "unsicher", "verfolgen", "verfolgt", "aggressiv", 
        "anmache", "aufdringlich"
    ],
    "Vandalismus (Vandalismo)": [
        "vandalismus", "graffiti", "geschmiere", "zerkratzt", "glasbruch", "scheibe kaputt", 
        "zerstörung", "schaden", "beschädigung", "zerstört", "randale"
    ],
    "Mangelnde Sicherheit (Seguridad)": [
        "überwachung", "polizei", "wachmann", "sicherheitsdienst", "sicherheit", "alleine", 
        "unbewacht", "niemand da", "reserviert", "behinderung", "verdächtig", 
        "reaktion", "hilfe", "schutz"
    ],
    "Defekte Aufzüge/Rolltreppen": [
        "rolltreppe", "aufzug", "fahrstuhl", "lift", "funktioniert nicht", "außer betrieb", 
        "hochfahren", "runterfahren", "kaputt", "rampe", "defekt", "störung"
    ],
    "Verschmutzung (Suciedad)": [
        "abfall", "müll", "schmutzig", "dreckig", "sauberkeit", "reinigung", 
        "verschwendung", "fleck", "dreck", "verunreinigung", "eklig"
    ],
    "Wasserschaden (Fugas)": [
        "leck", "wasser", "tropfen", "pfütze", "nass", "überschwemmung", 
        "überflutet", "regen", "undicht", "feucht", "rohrbruch"
    ],
    "Beleuchtungsausfall (Iluminación)": [
        "beleuchtung", "licht", "dunkel", "birne", "glühbirne", "lampe", 
        "laterne", "ausgeschaltet", "aus", "dunkelheit", "finsternis"
    ],
    "Entwerter Probleme (Validadores)": [
        "drehkreuz", "sperre", "zugang", "karte", "ticket", "fahrschein", 
        "entwerter", "lesegerät", "eingang", "liest nicht", "lesefehler", "ungültig"
    ],
    "Verspätung (Retrasos)": [
        "verspätung", "zu spät", "uhrzeit", "verzögerung", "dauer", "zeit", 
        "wartezeit", "ankunft", "ausfall", "stornierung", "wetter", "warten"
    ],
    "Langsame Fahrt (Tren lento)": [
        "langsam", "steht", "bewegt sich nicht", "schneckentempo", "angehalten", 
        "geschwindigkeit", "bummelzug", "stau", "stockend"
    ],
    "Überfüllung (Saturación)": [
        "überfüllung", "saturierung", "voll", "menschen", "leute", "gedränge", 
        "schubsen", "reinpassen", "eingequetscht", "kein platz", "überfüllt"
    ],
    "Ruppige Fahrweise (Conducción)": [
        "ruppig", "bremsen", "vollbremsung", "stoß", "ruck", "fahrer", 
        "fährt schlecht", "schlechter fahrstil", "wackelig"
    ],
    "Hitze (Calor)": [
        "hitze", "heiß", "warm", "backofen", "schweiß", "schwitzen", 
        "temperatur", "hölle", "sauna", "klima"
    ],
    "Schlechte Belüftung (Aire)": [
        "luft", "ersticken", "atmen", "lüftung", "ventilation", "atemnot", 
        "erstickt", "stickig", "schlechte luft"
    ],
    "Geruchsbelästigung (Mal olor)": [
        "geruch", "gestank", "stinkt", "riecht", "mief", "verfault", 
        "übel", "mülleimer", "abfalleimer"
    ],
    "Lärm (Ruido)": [
        "lärm", "ruido", "hupe", "geschrei", "schreie", "laut", 
        "skandal", "krach", "geräusch", "lautsprecher"
    ],
    "Unfreundliches Personal": [
        "unfreundlich", "grob", "unhöflich", "einstellung", "verhalten", "herrisch", 
        "behandlung", "schlecht", "geschrien", "erziehung", "rückerstattung", "mitarbeiter", "personal"
    ],
    "Geschlossene Schalter": [
        "schalter", "kasse", "geschlossen", "zu", "ticketverkauf", "niemand bedient", 
        "verkauf", "fahrkarte", "nicht besetzt"
    ],
    "Automaten defekt": [
        "automat", "fahrkartenautomat", "aufladung", "schluckt", "münze", 
        "geld", "service", "kaputt", "funktioniert nicht", "außer betrieb"
    ],
    "Fehlende Beschilderung": [
        "beschilderung", "schild", "netzplan", "karte", "verlaufen", "orientierung", 
        "hinweis", "information", "durchsage", "ansage", "wegweiser", "anzeige"
    ],
    "Allgemeine Beschwerde": [
        "gekauft", "verloren", "versehentlich", "unfall", "beschwerde", 
        "reklamation", "problem", "allgemein"
    ]
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