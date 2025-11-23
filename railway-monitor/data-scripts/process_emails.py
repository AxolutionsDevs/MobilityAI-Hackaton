import pandas as pd
import re
import os
import random
from datetime import datetime, timedelta

# Configuración de rutas
INPUT_FILE = 'railway-monitor/data-scripts/raw_emails.xlsx'
OUTPUT_FILE = 'railway-monitor/data-scripts/processed_complaints_v2.xlsx'
MASTER_FILE = 'railway-monitor/data-scripts/datasets/Dataset_Final_Asuntos_Especificos.xlsx'

# -----------------------------------------------------------------------------
# 1. DICCIONARIOS DE REGLAS (Categorías)
# -----------------------------------------------------------------------------

reglas_detalle = {
    "Robo": ["robo", "asalto", "cartera", "celular", "ladrón", "quitaron", "bolsearon", "sustrajeron"],
    "Acoso": ["acoso", "tocamiento", "mirbos", "morboso", "mujer", "insegura", "perseguir","agresivo","piropos"],
    "Vandalismo": ["vandalismo", "graffiti", "rayado", "vidrio roto", "destrucción", "daño"],
    "Falta de vigilancia": ["vigilancia", "policia", "guardia", "seguridad", "solos", "nadie cuida","reservado","discapacidad","sospechoso","respuesta"],
    "Escaleras/Rampas rotas": ["escalera", "electrica", "no sirve", "subir", "bajar", "descompuesta", "rampa"],
    "Basura": ["basura", "sucio", "cochino", "limpieza", "desperdicio", "mancha", "mugre"],
    "Fugas de agua": ["fuga", "agua", "goteo", "charco", "mojado", "inundado", "lluvia"],
    "Iluminación fallida": ["iluminacion", "luz", "oscuro", "foco", "lampara", "alumbrado", "apagado"],
    "Torniquetes rotos": ["torniquete", "acceso", "tarjeta", "validador", "entrada", "no lee"],
    "Retrasos": ["retraso", "tarde", "hora", "demora", "tiempo", "espera", "llegar", "cancelación", "meteorológicas"],
    "Tren lento": ["lento", "parado", "no avanza", "tortuga", "detenido", "velocidad","climático"],
    "Saturación": ["saturación", "lleno", "gente", "empujones", "caber", "apretados", "full"],
    "Conducción brusca": ["brusca", "frenón", "golpe", "jalón", "conductor", "maneja mal"],
    "Calor extremo": ["calor", "horno", "sudor", "temperatura", "infierno", "caliente"],
    "Falta de aire": ["aire", "asfixia", "respirar", "ventilación", "ahogo", "sofocado"],
    "Mal olor": ["olor", "peste", "huele", "apesta", "podrido", "hedor","suciedad","papeleras"],
    "Ruido": ["ruido", "bocina", "gritos", "fuerte", "escándalo", "sonido"],
    "Vagones sin luz": ["vagon", "sin luz", "oscuridad", "adentro", "tinieblas"],
    "Personal grosero": ["grosero", "actitud", "déspota", "trato", "malo", "gritó", "educación","reembolso"],
    "Taquillas cerradas": ["taquilla", "cerrada", "boleto", "nadie atiende", "venta","billete"],
    "Máquinas fuera de servicio": ["máquina", "recarga", "traga", "moneda", "dinero", "servicio"],
    "Falta de señalización": ["señalización", "letrero", "mapa", "perderse", "indicación","asignado","informacion","informativos","anuncios","guías"],
    "Falta de solucion a errores de usuarios": ["comprado", "perdido","accidental"]
}

metro_cdmx_map = {
    "Línea 1": ["Observatorio", "Tacubaya", "Chapultepec", "Insurgentes", "Pino Suárez", "San Lázaro", "Pantitlán", "Balderas"],
    "Línea 2": ["Cuatro Caminos", "Tacuba", "Hidalgo", "Bellas Artes", "Zócalo", "Zócalo/Tenochtitlan", "Chabacano", "Tasqueña", "Ermita"],
    "Línea 3": ["Indios Verdes", "La Raza", "Guerrero", "Hidalgo", "Balderas", "Centro Médico", "Zapata", "Coyoacán", "Universidad"],
    "Línea 4": ["Martín Carrera", "Consulado", "Morelos", "Candelaria", "Fray Servando", "Jamaica", "Santa Anita"],
    "Línea 5": ["Politécnico", "Instituto del Petróleo", "La Raza", "Consulado", "Oceanía", "Terminal Aérea", "Pantitlán"],
    "Línea 6": ["El Rosario", "Instituto del Petróleo", "Deportivo 18 de Marzo", "Martín Carrera", "Lindavista"],
    "Línea 7": ["El Rosario", "Tacuba", "Tacubaya", "Mixcoac", "Barranca del Muerto", "Polanco", "Auditorio"],
    "Línea 8": ["Garibaldi", "Bellas Artes", "Salto del Agua", "Chabacano", "Santa Anita", "Iztapalapa", "Constitución de 1917"],
    "Línea 9": ["Tacubaya", "Chilpancingo", "Centro Médico", "Chabacano", "Jamaica", "Pantitlán", "Velódromo"],
    "Línea A": ["Pantitlán", "Agrícola Oriental", "Tepalcates", "Santa Marta", "La Paz"],
    "Línea B": ["Ciudad Azteca", "Ecatepec", "Oceanía", "San Lázaro", "Guerrero", "Buenavista", "Tepito"],
    "Línea 12": ["Mixcoac", "Zapata", "Ermita", "Atlalilco", "Periférico Oriente", "Tezonco", "Olivos", "Tláhuac"]
}

# -----------------------------------------------------------------------------
# 2. FUNCIONES AUXILIARES
# -----------------------------------------------------------------------------

def detectar_categoria(texto):
    if not isinstance(texto, str):
        return "Queja General"
    
    texto_lower = texto.lower()
    
    for categoria, keywords in reglas_detalle.items():
        for word in keywords:
            if word in texto_lower:
                return categoria
                
    return "Queja General"

# Aplanar el mapa de estaciones para búsqueda rápida
estacion_a_linea = {}
listado_estaciones = []

for linea, estaciones in metro_cdmx_map.items():
    for estacion in estaciones:
        estacion_limpia = estacion.strip()
        if estacion_limpia not in estacion_a_linea: 
            estacion_a_linea[estacion_limpia] = linea
            listado_estaciones.append(estacion_limpia)

listado_estaciones.sort(key=len, reverse=True)

# Cache para IDs reales
mapa_ids_reales = {} # { "NombreEstacion": "ID_REAL" }

def cargar_datos_maestros():
    """
    Carga la fecha más reciente y el mapeo de IDs desde el dataset maestro.
    """
    print(f"Cargando dataset maestro: {MASTER_FILE}")
    if not os.path.exists(MASTER_FILE):
        print("Advertencia: No se encontró dataset maestro. Se usarán IDs sintéticos y fechas actuales.")
        return datetime.now()
    
    try:
        df_master = pd.read_excel(MASTER_FILE)
        
        # 1. Extraer Mapeo de IDs
        # Filtrar filas con NombredeEstacion y IdEstacion válidos
        subset = df_master[['NombredeEstacion', 'IdEstacion']].dropna().drop_duplicates('NombredeEstacion')
        for _, row in subset.iterrows():
            nombre = str(row['NombredeEstacion']).strip()
            id_real = str(row['IdEstacion']).strip()
            mapa_ids_reales[nombre] = id_real
            
        print(f"IDs reales cargados: {len(mapa_ids_reales)} estaciones.")

        # 2. Extraer Fecha Máxima
        if 'Fecha' in df_master.columns:
            # Intentar convertir a datetime, manejando errores
            fechas = pd.to_datetime(df_master['Fecha'], errors='coerce').dropna()
            if not fechas.empty:
                max_fecha = fechas.max()
                print(f"Fecha más reciente encontrada: {max_fecha}")
                return max_fecha
                
    except Exception as e:
        print(f"Error leyendo maestro: {e}")
    
    return datetime.now()

def detectar_ubicacion(texto):
    if not isinstance(texto, str):
        return None, None, None
        
    texto_original = texto
    
    for estacion in listado_estaciones:
        if re.search(r'\b' + re.escape(estacion) + r'\b', texto_original, re.IGNORECASE):
            linea = estacion_a_linea[estacion]
            
            # USAR ID REAL SI EXISTE, SINO SINTÉTICO
            if estacion in mapa_ids_reales:
                id_estacion = mapa_ids_reales[estacion]
            else:
                id_estacion = f"MX-{linea.replace('Línea ', 'L')}-{estacion[:3].upper()}"
                
            return estacion, linea, id_estacion
            
    return None, None, None

# -----------------------------------------------------------------------------
# 3. PIPELINE DE PROCESAMIENTO
# -----------------------------------------------------------------------------

def procesar_quejas():
    print(f"Cargando datos crudos desde {INPUT_FILE}...")
    
    if not os.path.exists(INPUT_FILE):
        print(f"Error: No se encuentra el archivo {INPUT_FILE}")
        return

    # Cargar Maestro primero
    fecha_inicio = cargar_datos_maestros()
    
    # Retroceder un poco (ej. 1 hora) para que los nuevos registros parezcan continuación inmediata
    fecha_actual = fecha_inicio - timedelta(hours=1)

    try:
        df = pd.read_excel(INPUT_FILE)
    except Exception as e:
        print(f"Error al leer Excel: {e}")
        return

    print(f"Procesando {len(df)} registros...")

    # A. Detección de Categoría
    df['Asunto'] = df['Contenido'].apply(detectar_categoria)

    # B. Detección de Ubicación
    ubicacion_data = df['Contenido'].apply(detectar_ubicacion)
    df_ubicacion = pd.DataFrame(ubicacion_data.tolist(), columns=['NombredeEstacion', 'Linea', 'IdEstacion'], index=df.index)
    
    df['NombredeEstacion'] = df_ubicacion['NombredeEstacion']
    df['Linea'] = df_ubicacion['Linea']
    df['IdEstacion'] = df_ubicacion['IdEstacion']

    df['NombredeEstacion'] = df['NombredeEstacion'].fillna("Desconocida")
    df['Linea'] = df['Linea'].fillna("N/A")
    df['IdEstacion'] = df['IdEstacion'].fillna("N/A")

    # C. GENERACIÓN DE FECHAS SECUENCIALES HACIA ATRÁS
    # Queremos que el registro 0 sea el más reciente (cerca de fecha_inicio)
    # y el registro N sea el más antiguo.
    nuevas_fechas = []
    for _ in range(len(df)):
        # Restar entre 10 min y 4 horas por registro para dar variedad
        delta_minutos = timedelta(minutes=random.randint(10, 240))
        fecha_actual -= delta_minutos
        nuevas_fechas.append(fecha_actual)
    
    df['Fecha'] = nuevas_fechas

    # Selección final
    columnas_requeridas = [
        'Nombre_remitente', 'Email_remitente', 'Nombre_destinatario', 
        'Email_destinatario', 'Asunto', 'Contenido', 'Fecha', 
        'Message-ID', 'NombredeEstacion', 'IdEstacion', 'Linea'
    ]
    
    for col in columnas_requeridas:
        if col not in df.columns:
            df[col] = ""

    df_final = df[columnas_requeridas]

    # Guardar
    df_final.to_excel(OUTPUT_FILE, index=False)
    print(f"Procesamiento completado. Archivo guardado en: {OUTPUT_FILE}")
    print("-" * 30)
    print(df_final[['Fecha', 'Asunto', 'NombredeEstacion', 'IdEstacion']].head())

if __name__ == "__main__":
    procesar_quejas()
