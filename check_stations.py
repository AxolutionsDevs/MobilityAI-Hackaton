import json
from collections import Counter

# Cargar datos
with open('railway-monitor/frontend/lib/data/complaints_vienna.json', encoding='utf-8') as f:
    complaints = json.load(f)

with open('railway-monitor/frontend/lib/data/estacionesvienna.json', encoding='utf-8') as f:
    stations = json.load(f)

# Contar quejas por estación
station_counts = Counter(c['NombredeEstacion'] for c in complaints)

# Estaciones con coordenadas
coord_names = set(s['nombre'] for s in stations if not s['nombre'].startswith('Estacion_'))

print('=' * 60)
print('TOP 10 ESTACIONES CON MÁS QUEJAS')
print('=' * 60)
for name, count in station_counts.most_common(10):
    has_coord = '✓' if name in coord_names else '✗'
    print(f'{has_coord} {name}: {count} quejas')

print(f'\n' + '=' * 60)
print(f'RESUMEN')
print('=' * 60)
print(f'Total estaciones únicas: {len(station_counts)}')
print(f'Estaciones con coordenadas: {len(coord_names)}')
matches = sum(1 for name in station_counts if name in coord_names)
print(f'Estaciones que coinciden: {matches}')
print(f'Cobertura: {matches/len(station_counts)*100:.1f}%')

# Contar quejas cubiertas
covered_complaints = sum(count for name, count in station_counts.items() if name in coord_names)
print(f'\nQuejas totales: {len(complaints)}')
print(f'Quejas con coordenadas: {covered_complaints}')
print(f'Cobertura de quejas: {covered_complaints/len(complaints)*100:.1f}%')
