import pandas as pd
import random
import uuid
from datetime import datetime, timedelta
from faker import Faker

# Configuración de Faker en español de México
fake = Faker('es_MX')

# -----------------------------------------------------------------------------
# 1. DICCIONARIOS Y REGLAS DE NEGOCIO
# -----------------------------------------------------------------------------

reglas_detalle = {
    "Robo": ["robo", "asalto", "cartera", "celular", "ladrón", "quitaron", "bolsearon"],
    "Acoso": ["acoso", "tocamiento", "mirbos", "morboso", "mujer", "insegura"],
    "Vandalismo": ["vandalismo", "graffiti", "rayado", "vidrio roto"],
    "Falta de vigilancia": ["vigilancia", "policia", "guardia", "seguridad", "solos"],
    "Escaleras/Rampas rotas": ["escalera", "electrica", "no sirve", "descompuesta"],
    "Basura": ["basura", "sucio", "cochino", "limpieza"],
    "Retrasos": ["retraso", "tarde", "hora", "demora", "tiempo", "espera"],
    "Saturación": ["saturación", "lleno", "gente", "empujones", "apretados"],
    "Calor extremo": ["calor", "horno", "sudor", "temperatura", "infierno"],
    "Vagones sin luz": ["vagon", "sin luz", "oscuridad", "tinieblas"],
    "Personal grosero": ["grosero", "actitud", "déspota", "trato"],
    "Taquillas cerradas": ["taquilla", "cerrada", "boleto", "nadie atiende"]
}

estaciones_lista = [
    "Observatorio", "Tacubaya", "Balderas", "Pino Suárez", "Pantitlán", 
    "Hidalgo", "Bellas Artes", "Zócalo", "Tasqueña", "Indios Verdes", 
    "Guerrero", "Zapata", "Universidad", "Polanco", "Auditorio", 
    "Mixcoac", "Chabacano", "Buenavista", "Oceanía", "San Lázaro"
]

asuntos_sucios = [
    "Queja", "Ayuda", "Reporte", "Incidente", "Hola", "Urgente", 
    "Pésimo servicio", "Atención", "Duda", "Reclamo", "Inconformidad", 
    "Suceso", "Aviso", "Comentario", "Metro", "Estación"
]

templates = [
    "Hola, quiero reportar un {keyword} que ocurrió hoy en la estación {estacion}.",
    "Es increíble que en {estacion} siempre haya {keyword}, hagan algo por favor.",
    "Estaba en {estacion} y sufrí de {keyword}, pésimo servicio.",
    "Auxilio, tema de {keyword} cerca de {estacion}, necesito atención.",
    "Hoy en la mañana vi mucho {keyword} al transbordar en {estacion}.",
    "¿Hasta cuándo van a arreglar el problema de {keyword} en {estacion}?",
    "Reporto {keyword} en las instalaciones de {estacion}.",
    "Terrible experiencia en {estacion} debido a {keyword}.",
    "Oigan, hay {keyword} en los andenes de {estacion}.",
    "Me gustaría poner una queja sobre {keyword} que vi en {estacion}."
]

# -----------------------------------------------------------------------------
# 2. LÓGICA DE GENERACIÓN
# -----------------------------------------------------------------------------

def generar_fecha_aleatoria():
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    random_date = start_date + (end_date - start_date) * random.random()
    return random_date.strftime("%Y-%m-%d %H:%M:%S")

data = []

print("Generando 500 registros sintéticos...")

for _ in range(500):
    # 1. Seleccionar Categoría y Keyword
    categoria = random.choice(list(reglas_detalle.keys()))
    keyword = random.choice(reglas_detalle[categoria])
    
    # 2. Seleccionar Estación
    estacion = random.choice(estaciones_lista)
    
    # 3. Generar Contenido usando Template
    template = random.choice(templates)
    contenido = template.format(keyword=keyword, estacion=estacion)
    
    # 4. Datos del Remitente
    nombre_remitente = fake.name()
    email_remitente = fake.email()
    
    # 5. Armar fila
    row = {
        "Nombre_remitente": nombre_remitente,
        "Email_remitente": email_remitente,
        "Nombre_destinatario": "Atención a Clientes Metro",
        "Email_destinatario": "quejas@metro.cdmx.gob.mx",
        "Asunto": random.choice(asuntos_sucios),
        "Contenido": contenido,
        "Fecha": generar_fecha_aleatoria(),
        "Message-ID": f"MSG-{uuid.uuid4().hex[:8].upper()}",
        "NombredeEstacion": "", # A ser llenado por script de procesamiento
        "IdEstacion": "",       # A ser llenado por script de procesamiento
        "Linea": ""             # A ser llenado por script de procesamiento
    }
    data.append(row)

# -----------------------------------------------------------------------------
# 3. GUARDADO
# -----------------------------------------------------------------------------

df = pd.DataFrame(data)
output_path = "railway-monitor/data-scripts/raw_emails.xlsx"

try:
    df.to_excel(output_path, index=False)
    print(f"Archivo generado exitosamente: {output_path}")
    print(f"   Total de filas: {len(df)}")
    print("   Columnas vacias listas para procesamiento: NombredeEstacion, IdEstacion, Linea")
except Exception as e:
    print(f"Error al guardar el archivo: {e}")

