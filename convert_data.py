import pandas as pd
import json
import os

# Rutas
excel_path = r'railway-monitor/data-scripts/datasets/Dataset_Final_Asuntos_Especificos.xlsx'
output_dir = r'railway-monitor/frontend/lib/data'

# Asegurar directorio de destino
os.makedirs(output_dir, exist_ok=True)

try:
    # Leer Excel
    print("Leyendo archivo Excel...")
    df = pd.read_excel(excel_path)
    
    # Convertir fechas a string ISO
    if 'Fecha' in df.columns:
        df['Fecha'] = df['Fecha'].astype(str)
    
    # FILTRADO INTELIGENTE
    # Separar por prefijo de IdEstacion
    df['IdEstacion'] = df['IdEstacion'].astype(str) # Asegurar que sea texto

    # MX -> Metro CDMX
    df_cdmx = df[df['IdEstacion'].str.startswith('MX', na=False)]
    
    # TM -> Tren Maya
    df_maya = df[df['IdEstacion'].str.startswith('TM', na=False)]

    # Convertir a diccionarios
    data_cdmx = df_cdmx.to_dict(orient='records')
    data_maya = df_maya.to_dict(orient='records')
    
    # Guardar JSONs separados
    path_cdmx = os.path.join(output_dir, 'complaints_cdmx.json')
    path_maya = os.path.join(output_dir, 'complaints_maya.json')

    with open(path_cdmx, 'w', encoding='utf-8') as f:
        json.dump(data_cdmx, f, ensure_ascii=False, indent=2)
        
    with open(path_maya, 'w', encoding='utf-8') as f:
        json.dump(data_maya, f, ensure_ascii=False, indent=2)
        
    print("-" * 30)
    print(f"PROCESO COMPLETADO")
    print(f"Metro CDMX (MX): {len(data_cdmx)} registros guardados en {path_cdmx}")
    print(f"Tren Maya (TM):  {len(data_maya)} registros guardados en {path_maya}")
    print("-" * 30)
    
except Exception as e:
    print(f"Error: {e}")
