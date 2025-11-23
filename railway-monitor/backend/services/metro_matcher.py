from difflib import SequenceMatcher
from typing import Dict, List, Optional, Tuple


# Mapa de estaciones del Metro CDMX
METRO_CDMX_MAP = {
    "Línea 1": ["Observatorio", "Tacubaya", "Juanacatlán", "Chapultepec", "Sevilla", "Insurgentes", 
                "Cuauhtémoc", "Balderas", "Salto del Agua", "Isabel la Católica", "Pino Suárez", 
                "Merced", "Candelaria", "San Lázaro", "Moctezuma", "Balbuena", "Boulevard Puerto Aéreo", 
                "Gómez Farías", "Zaragoza", "Pantitlán"],
    
    "Línea 2": ["Cuatro Caminos", "Panteones", "Tacuba", "Cuitláhuac", "Popotla", "Colegio Militar", 
                "Normal", "San Cosme", "Revolución", "Hidalgo", "Bellas Artes", "Allende", "Zócalo", 
                "Pino Suárez", "San Antonio Abad", "Chabacano", "Viaducto", "Xola", "Villa de Cortés", 
                "Nativitas", "Portales", "Ermita", "General Anaya", "Tasqueña"],
    
    "Línea 3": ["Indios Verdes", "Deportivo 18 de Marzo", "Potrero", "La Raza", "Tlatelolco", "Guerrero", 
                "Hidalgo", "Juárez", "Balderas", "Niños Héroes", "Hospital General", "Centro Médico", 
                "Etiopía", "Eugenia", "División del Norte", "Zapata", "Coyoacán", "Viveros", 
                "Miguel Ángel de Quevedo", "Copilco", "Universidad"],
    
    "Línea 4": ["Martín Carrera", "Talismán", "Bondojito", "Consulado", "Canal del Norte", "Morelos", 
                "Candelaria", "Fray Servando", "Jamaica", "Santa Anita"],
    
    "Línea 5": ["Politécnico", "Instituto del Petróleo", "Autobuses del Norte", "La Raza", "Misterios", 
                "Valle Gómez", "Consulado", "Eduardo Molina", "Aragón", "Oceanía", "Terminal Aérea", 
                "Hangares", "Pantitlán"],
    
    "Línea 6": ["El Rosario", "Tezozómoc", "Azcapotzalco", "Ferrería", "Norte 45", "Vallejo", 
                "Instituto del Petróleo", "Lindavista", "Deportivo 18 de Marzo", "La Villa-Basílica", 
                "Martín Carrera"],
    
    "Línea 7": ["El Rosario", "Aquiles Serdán", "Camarones", "Refinería", "Tacuba", "San Joaquín", 
                "Polanco", "Auditorio", "Constituyentes", "Tacubaya", "San Pedro de los Pinos", 
                "San Antonio", "Mixcoac", "Barranca del Muerto"],
    
    "Línea 8": ["Garibaldi", "Bellas Artes", "San Juan de Letrán", "Salto del Agua", "Doctores", 
                "Obrera", "Chabacano", "La Viga", "Santa Anita", "Coyuya", "Iztacalco", "Apatlaco", 
                "Aculco", "Escuadrón 201", "Atlalilco", "Iztapalapa", "Cerro de la Estrella", 
                "UAM-I", "Constitución de 1917"],
    
    "Línea 9": ["Tacubaya", "Patriotismo", "Chilpancingo", "Centro Médico", "Lázaro Cárdenas", 
                "Chabacano", "Jamaica", "Mixiuhca", "Velódromo", "Ciudad Deportiva", "Puebla", 
                "Pantitlán"],
    
    "Línea A": ["Pantitlán", "Agrícola Oriental", "Canal de San Juan", "Tepalcates", "Guelatao", 
                "Peñón Viejo", "Acatitla", "Santa Marta", "Los Reyes", "La Paz"],
    
    "Línea B": ["Ciudad Azteca", "Plaza Aragón", "Olímpica", "Ecatepec", "Múzquiz", "Río de los Remedios", 
                "Impulsora", "Nezahualcóyotl", "Villa de Aragón", "Bosque de Aragón", "Deportivo Oceanía", 
                "Oceanía", "Romero Rubio", "Ricardo Flores Magón", "San Lázaro", "Morelos", "Tepito", 
                "Lagunilla", "Garibaldi", "Guerrero", "Buenavista"],
    
    "Línea 12": ["Mixcoac", "Insurgentes Sur", "Hospital 20 de Noviembre", "Zapata", "Parque de los Venados", 
                 "Eje Central", "Ermita", "Mexicaltzingo", "Atlalilco", "Culhuacán", "San Andrés Tomatlán", 
                 "Lomas Estrella", "Calle 11", "Periférico Oriente", "Tezonco", "Olivos", "Nopalera", 
                 "Zapotitlán", "Tlaltenco", "Tláhuac"]
}

# Colores de las líneas del Metro CDMX
LINE_COLORS = {
    "Línea 1": "#F54EA2",
    "Línea 2": "#0065B3",
    "Línea 3": "#AF9800",
    "Línea 4": "#6CBDB5",
    "Línea 5": "#FFD200",
    "Línea 6": "#E52713",
    "Línea 7": "#FF6B00",
    "Línea 8": "#00A650",
    "Línea 9": "#5B2E00",
    "Línea A": "#A02C7D",
    "Línea B": "#B7B8B9",
    "Línea 12": "#B09D5B"
}

METRO_VIENNA_MAP = {
    "U1": ["Leopoldau", "Kagran", "Praterstern", "Stephansplatz", "Karlsplatz", "Oberlaa"],
    "U2": ["Seestadt", "Stadion", "Praterstern", "Schottenring", "Volkstheater", "Karlsplatz"],
    "U3": ["Ottakring", "Westbahnhof", "Volkstheater", "Stephansplatz", "Landstraße", "Simmering"],
    "U4": ["Hütteldorf", "Schönbrunn", "Karlsplatz", "Landstraße", "Schwedenplatz", "Heiligenstadt"]
}

COLORS_VIENNA = {
    "U1": "#E2021B", # Rojo
    "U2": "#A368A3", # Morado
    "U3": "#F58220", # Naranja
    "U4": "#00A54F"  # Verde
}
def similarity_ratio(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def find_best_match(detected_name: str, station_map: dict, threshold: float = 0.6) -> Optional[Tuple[str, str, float]]:
    """
    Ahora recibe 'station_map' para saber en qué ciudad buscar.
    """
    best_match = None
    best_score = 0.0
    best_line = None
    
    # Iteramos sobre el mapa dinámico que recibimos
    for line, stations in station_map.items():
        for station in stations:
            score = similarity_ratio(detected_name, station)
            
            if detected_name.lower() in station.lower() or station.lower() in detected_name.lower():
                score = max(score, 0.8)
            
            if score > best_score:
                best_score = score
                best_match = station
                best_line = line
from difflib import SequenceMatcher
from typing import Dict, List, Optional, Tuple


# Mapa de estaciones del Metro CDMX
METRO_CDMX_MAP = {
    "Línea 1": ["Observatorio", "Tacubaya", "Juanacatlán", "Chapultepec", "Sevilla", "Insurgentes", 
                "Cuauhtémoc", "Balderas", "Salto del Agua", "Isabel la Católica", "Pino Suárez", 
                "Merced", "Candelaria", "San Lázaro", "Moctezuma", "Balbuena", "Boulevard Puerto Aéreo", 
                "Gómez Farías", "Zaragoza", "Pantitlán"],
    
    "Línea 2": ["Cuatro Caminos", "Panteones", "Tacuba", "Cuitláhuac", "Popotla", "Colegio Militar", 
                "Normal", "San Cosme", "Revolución", "Hidalgo", "Bellas Artes", "Allende", "Zócalo", 
                "Pino Suárez", "San Antonio Abad", "Chabacano", "Viaducto", "Xola", "Villa de Cortés", 
                "Nativitas", "Portales", "Ermita", "General Anaya", "Tasqueña"],
    
    "Línea 3": ["Indios Verdes", "Deportivo 18 de Marzo", "Potrero", "La Raza", "Tlatelolco", "Guerrero", 
                "Hidalgo", "Juárez", "Balderas", "Niños Héroes", "Hospital General", "Centro Médico", 
                "Etiopía", "Eugenia", "División del Norte", "Zapata", "Coyoacán", "Viveros", 
                "Miguel Ángel de Quevedo", "Copilco", "Universidad"],
    
    "Línea 4": ["Martín Carrera", "Talismán", "Bondojito", "Consulado", "Canal del Norte", "Morelos", 
                "Candelaria", "Fray Servando", "Jamaica", "Santa Anita"],
    
    "Línea 5": ["Politécnico", "Instituto del Petróleo", "Autobuses del Norte", "La Raza", "Misterios", 
                "Valle Gómez", "Consulado", "Eduardo Molina", "Aragón", "Oceanía", "Terminal Aérea", 
                "Hangares", "Pantitlán"],
    
    "Línea 6": ["El Rosario", "Tezozómoc", "Azcapotzalco", "Ferrería", "Norte 45", "Vallejo", 
                "Instituto del Petróleo", "Lindavista", "Deportivo 18 de Marzo", "La Villa-Basílica", 
                "Martín Carrera"],
    
    "Línea 7": ["El Rosario", "Aquiles Serdán", "Camarones", "Refinería", "Tacuba", "San Joaquín", 
                "Polanco", "Auditorio", "Constituyentes", "Tacubaya", "San Pedro de los Pinos", 
                "San Antonio", "Mixcoac", "Barranca del Muerto"],
    
    "Línea 8": ["Garibaldi", "Bellas Artes", "San Juan de Letrán", "Salto del Agua", "Doctores", 
                "Obrera", "Chabacano", "La Viga", "Santa Anita", "Coyuya", "Iztacalco", "Apatlaco", 
                "Aculco", "Escuadrón 201", "Atlalilco", "Iztapalapa", "Cerro de la Estrella", 
                "UAM-I", "Constitución de 1917"],
    
    "Línea 9": ["Tacubaya", "Patriotismo", "Chilpancingo", "Centro Médico", "Lázaro Cárdenas", 
                "Chabacano", "Jamaica", "Mixiuhca", "Velódromo", "Ciudad Deportiva", "Puebla", 
                "Pantitlán"],
    
    "Línea A": ["Pantitlán", "Agrícola Oriental", "Canal de San Juan", "Tepalcates", "Guelatao", 
                "Peñón Viejo", "Acatitla", "Santa Marta", "Los Reyes", "La Paz"],
    
    "Línea B": ["Ciudad Azteca", "Plaza Aragón", "Olímpica", "Ecatepec", "Múzquiz", "Río de los Remedios", 
                "Impulsora", "Nezahualcóyotl", "Villa de Aragón", "Bosque de Aragón", "Deportivo Oceanía", 
                "Oceanía", "Romero Rubio", "Ricardo Flores Magón", "San Lázaro", "Morelos", "Tepito", 
                "Lagunilla", "Garibaldi", "Guerrero", "Buenavista"],
    
    "Línea 12": ["Mixcoac", "Insurgentes Sur", "Hospital 20 de Noviembre", "Zapata", "Parque de los Venados", 
                 "Eje Central", "Ermita", "Mexicaltzingo", "Atlalilco", "Culhuacán", "San Andrés Tomatlán", 
                 "Lomas Estrella", "Calle 11", "Periférico Oriente", "Tezonco", "Olivos", "Nopalera", 
                 "Zapotitlán", "Tlaltenco", "Tláhuac"]
}

# Colores de las líneas del Metro CDMX
LINE_COLORS = {
    "Línea 1": "#F54EA2",
    "Línea 2": "#0065B3",
    "Línea 3": "#AF9800",
    "Línea 4": "#6CBDB5",
    "Línea 5": "#FFD200",
    "Línea 6": "#E52713",
    "Línea 7": "#FF6B00",
    "Línea 8": "#00A650",
    "Línea 9": "#5B2E00",
    "Línea A": "#A02C7D",
    "Línea B": "#B7B8B9",
    "Línea 12": "#B09D5B"
}

METRO_VIENNA_MAP = {
    "U1": ["Leopoldau", "Kagran", "Praterstern", "Stephansplatz", "Karlsplatz", "Oberlaa"],
    "U2": ["Seestadt", "Stadion", "Praterstern", "Schottenring", "Volkstheater", "Karlsplatz"],
    "U3": ["Ottakring", "Westbahnhof", "Volkstheater", "Stephansplatz", "Landstraße", "Simmering"],
    "U4": ["Hütteldorf", "Schönbrunn", "Karlsplatz", "Landstraße", "Schwedenplatz", "Heiligenstadt"]
}

COLORS_VIENNA = {
    "U1": "#E2021B", # Rojo
    "U2": "#A368A3", # Morado
    "U3": "#F58220", # Naranja
    "U4": "#00A54F"  # Verde
}
def similarity_ratio(a: str, b: str) -> float:
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def find_best_match(detected_name: str, station_map: dict, threshold: float = 0.6) -> Optional[Tuple[str, str, float]]:
    """
    Ahora recibe 'station_map' para saber en qué ciudad buscar.
    """
    best_match = None
    best_score = 0.0
    best_line = None
    
    # Iteramos sobre el mapa dinámico que recibimos
    for line, stations in station_map.items():
        for station in stations:
            score = similarity_ratio(detected_name, station)
            
            if detected_name.lower() in station.lower() or station.lower() in detected_name.lower():
                score = max(score, 0.8)
            
            if score > best_score:
                best_score = score
                best_match = station
                best_line = line
    
    if best_score >= threshold:
        return (best_match, best_line, best_score)
    
    return None

def get_line_color(line_name: str, color_map: dict) -> str:
    return color_map.get(line_name, "#808080")

# Exportar para uso en main.py
__all__ = [
    'METRO_CDMX_MAP',
    'METRO_VIENNA_MAP', 
    'LINE_COLORS',
    'COLORS_VIENNA',
    'find_best_match',
    'get_line_color'
]