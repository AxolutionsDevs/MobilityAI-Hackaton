import pandas as pd
import random


archivo_entrada = 'SENOROBB/customer-Emails_Espanol_5000.xlsx'
archivo_salida = 'SENOROBB/Dataset_Final_Asuntos_Especificos.xlsx'

print(f"--- Iniciando proceso ---")
try:
    df = pd.read_excel(archivo_entrada)
    print(f"Archivo cargado. Total de filas: {len(df)}")
except FileNotFoundError:
    print(f"ERROR: No se encontró '{archivo_entrada}'. Verifica la carpeta y el nombre.")
    exit()

metro_cdmx_map = {
    "Línea 1": ["Observatorio", "Tacubaya", "Chapultepec", "Insurgentes", "Pino Suárez", "San Lázaro", "Pantitlán", "Balderas"],
    "Línea 2": ["Cuatro Caminos", "Tacuba", "Hidalgo", "Bellas Artes", "Zócalo/Tenochtitlan", "Chabacano", "Tasqueña", "Ermita"],
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

tren_maya_map = {
    "Tramo 1 (Selva Uno)": ["Palenque", "Boca del Cerro", "Tenosique", "El Triunfo", "Candelaria", "Escárcega"],
    "Tramo 2 (Golfo Uno)": ["Escárcega", "Carrillo Puerto", "Edzná", "San Francisco de Campeche", "Tenabo", "Hecelchakán"],
    "Tramo 3 (Golfo Dos)": ["Calkiní", "Maxcanú", "Umán", "Teya Mérida", "Tixkokob", "Izamal"],
    "Tramo 4 (Caribe Uno)": ["Izamal", "Chichén Itzá", "Valladolid", "Nuevo Xcan", "Leona Vicario", "Cancún Aeropuerto"],
    "Tramo 5 Norte (Caribe Dos)": ["Cancún Aeropuerto", "Puerto Morelos", "Playa del Carmen"],
    "Tramo 5 Sur (Caribe Dos)": ["Playa del Carmen", "Tulum", "Tulum Aeropuerto"],
    "Tramo 6 (Caribe Tres)": ["Tulum Aeropuerto", "Felipe Carrillo Puerto", "Limones-Chacchoben", "Bacalar", "Chetumal Aeropuerto"],
    "Tramo 7 (Selva Dos)": ["Chetumal Aeropuerto", "Nicolás Bravo", "Xpujil", "Calakmul", "Centenario", "Escárcega"]
}


reglas_detalle = {
    "Robo": ["robo", "asalto", "cartera", "celular", "ladrón", "quitaron", "bolsearon", "sustrajeron"],
    "Acoso": ["acoso", "tocamiento", "mirbos", "morboso", "mujer", "insegura", "perseguir","agresivo","piropos"],
    "Vandalismo": ["vandalismo", "graffiti", "rayado", "vidrio roto", "destrucción", "daño"],
    "Falta de vigilancia": ["vigilancia", "policia", "guardia", "seguridad", "solos", "nadie cuida","reservado","discapacidad","sospechoso","respuesta"],
    
    "Escaleras/Rampas rotas": ["escalera", "electrica", "no sirve", "subir", "bajar", "descompuesta", "descompuesta","rampa"],
    "Basura": ["basura", "sucio", "cochino", "limpieza", "desperdicio", "mancha", "mugre"],
    "Fugas de agua": ["fuga", "agua", "goteo", "charco", "mojado", "inundado", "lluvia"],
    "Iluminación fallida": ["iluminacion", "luz", "oscuro", "foco", "lampara", "alumbrado", "apagado"],
    "Torniquetes rotos": ["torniquete", "acceso", "tarjeta", "validador", "entrada", "no lee"],
    
    "Retrasos": ["retraso", "tarde", "hora", "demora", "tiempo", "espera", "llegar", "cancelación", "meteorológicas"],
    "Tren lento": ["lento", "parado", "no avanza", "tortuga", "detenido", "velocidad","climático"],
    "Saturación": ["saturación", "lleno", "gente", "empujones", "caber", "apretados", "full","cancelación"],
    "Conducción brusca": ["brusca", "frenón", "golpe", "jalón", "conductor", "maneja mal"],
    
    "Calor extremo": ["calor", "horno", "sudor", "temperatura", "infierno", "caliente","meteorológicas"],
    "Falta de aire": ["aire", "asfixia", "respirar", "ventilación", "ahogo", "sofocado","meteorológicas"],
    "Mal olor": ["olor", "peste", "huele", "apesta", "podrido", "hedor","suciedad","papeleras"],
    "Ruido": ["ruido", "bocina", "gritos", "fuerte", "escándalo", "sonido"],
    "Vagones sin luz": ["vagon", "sin luz", "oscuridad", "adentro", "tinieblas"],
    
    "Personal grosero": ["grosero", "actitud", "déspota", "trato", "malo", "gritó", "educación","reembolso"],
    "Taquillas cerradas": ["taquilla", "cerrada", "boleto", "nadie atiende", "venta","billete"],
    "Máquinas fuera de servicio": ["máquina", "recarga", "traga", "moneda", "dinero", "servicio"],
    "Falta de señalización": ["señalización", "letrero", "mapa", "perderse", "indicación","asignado","informacion","informativos","anuncios","guías"],
    "Falta de solucion a errores de usuarios": ["comprado", "perdido","accidental"]
}


print("Procesando filas (Asignando Estaciones + Analizando Asunto)...")

nombres_est = []
lineas_est = []
ids_est = []
asuntos_finales = [] # Lista única para el asunto

columna_queja = 'Contenido' 

for i in range(len(df)):
    
    # --- A. LÓGICA DE ESTACIONES (Igual) ---
    if i < 2500: # Metro CDMX
        linea = random.choice(list(metro_cdmx_map.keys()))
        estacion = random.choice(metro_cdmx_map[linea])
        id_code = f"MX-{random.randint(100, 999)}"
    elif i < 5000: # Tren Maya
        linea = random.choice(list(tren_maya_map.keys()))
        estacion = random.choice(tren_maya_map[linea])
        id_code = f"TM-{random.randint(100, 999)}"
    else: 
        linea, estacion, id_code = "N/A", "Sin Asignar", "N/A"

    nombres_est.append(estacion)
    lineas_est.append(linea)
    ids_est.append(id_code)

    queja_texto = str(df.iloc[i][columna_queja]).lower()
    
    asunto_detectado = "Queja General / Varios"

    match_found = False
    for asunto, keywords in reglas_detalle.items():
        for word in keywords:
            if word in queja_texto:
                asunto_detectado = asunto # Asigna directamente "Robo", "Basura", etc.
                match_found = True
                break
        if match_found:
            break
            
    asuntos_finales.append(asunto_detectado)


df['NombredeEstacion'] = nombres_est
df['IdEstacion'] = ids_est
df['Linea'] = lineas_est

df['Asunto'] = asuntos_finales 

if 'Clasificacion_Problema' in df.columns:
    df.drop(columns=['Clasificacion_Problema'], inplace=True)
if 'Asunto_Generado' in df.columns:
    df.drop(columns=['Asunto_Generado'], inplace=True)

df.to_excel(archivo_salida, index=False)

print(f"¡LISTO! Archivo generado: {archivo_salida}")
