import pandas as pd
import os

# Rutas de archivos
FILE_MAESTRO = 'railway-monitor/data-scripts/datasets/Dataset_Final_Asuntos_Especificos.xlsx'
FILE_NUEVOS = 'railway-monitor/data-scripts/processed_complaints_v2.xlsx'
FILE_OUTPUT = 'railway-monitor/data-scripts/datasets/Dataset_Completo_Final.xlsx'

def merge_datasets():
    print("--- Iniciando Fusión de Datasets ---")
    
    # 1. Cargar Maestro
    if os.path.exists(FILE_MAESTRO):
        print(f"Leyendo Maestro: {FILE_MAESTRO}")
        df_maestro = pd.read_excel(FILE_MAESTRO)
        print(f"   -> Filas: {len(df_maestro)}")
    else:
        print(f"Error: No se encuentra el maestro {FILE_MAESTRO}")
        return

    # 2. Cargar Nuevos
    if os.path.exists(FILE_NUEVOS):
        print(f"Leyendo Nuevos: {FILE_NUEVOS}")
        df_nuevos = pd.read_excel(FILE_NUEVOS)
        print(f"   -> Filas: {len(df_nuevos)}")
    else:
        print(f"Error: No se encuentran los nuevos datos {FILE_NUEVOS}")
        return

    # 3. Concatenar
    print("Fusionando...")
    # ensure=True para alinear columnas si hubiera diferencias mínimas, aunque el esquema es idéntico
    df_completo = pd.concat([df_maestro, df_nuevos], ignore_index=True)
    
    # 4. Ordenar por fecha (opcional pero recomendado)
    if 'Fecha' in df_completo.columns:
        print("Ordenando por fecha descendente...")
        df_completo['Fecha'] = pd.to_datetime(df_completo['Fecha'], errors='coerce')
        df_completo = df_completo.sort_values(by='Fecha', ascending=False)

    # 5. Guardar
    print(f"Guardando resultado en: {FILE_OUTPUT}")
    df_completo.to_excel(FILE_OUTPUT, index=False)
    
    print("-" * 30)
    print(f"¡ÉXITO! Dataset unificado generado.")
    print(f"Total de filas: {len(df_completo)}")
    print("-" * 30)

if __name__ == "__main__":
    merge_datasets()

