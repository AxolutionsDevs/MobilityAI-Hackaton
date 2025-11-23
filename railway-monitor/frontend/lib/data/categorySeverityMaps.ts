// Clasificación por categorías y pesos de gravedad (0 a 1)
// Prioriza: seguridad física > operatividad > ambiente/salud > confort

/**
 * Mapeo de categorías en español (CDMX) a pesos de severidad
 */
export const categorySeverityCDMX: Record<string, number> = {
  // 1. Seguridad (Prioridad Máxima) 0.9-1.0
  Acoso: 1.0,
  Robo: 0.95,
  "Falta de vigilancia": 0.85,
  Vandalismo: 0.6,

  // 2. Operatividad y Accesibilidad (Prioridad Alta) 0.65-0.85
  Retrasos: 0.85,
  "Tren lento": 0.8,
  "Escaleras/Rampas rotas": 0.8,
  "Taquillas cerradas": 0.7,
  "Torniquetes rotos": 0.65,
  "Máquinas fuera de servicio": 0.6,

  // 3. Ambiente y Salud (Prioridad Media) 0.55-0.75
  "Falta de aire": 0.75,
  "Calor extremo": 0.7,
  "Iluminación fallida": 0.65,
  "Fugas de agua": 0.55,

  // 4. Servicio al Cliente y Mantenimiento (Prioridad Baja) 0.10-0.45
  "Falta de solucion a errores de usuarios": 0.45,
  "Falta de señalización": 0.4,
  "Personal grosero": 0.35,
  "Mal olor": 0.3,
  Basura: 0.25,
  "Queja General / Varios": 0.1,
};

/**
 * Mapeo de categorías en alemán (Vienna) a pesos de severidad
 * Basado en las categorías reales del dataset
 */
export const categorySeverityVienna: Record<string, number> = {
  // 1. Seguridad (Prioridad Máxima) 0.9-1.0
  "Belästigung (Acoso)": 1.0,
  "Diebstahl (Robo)": 0.95,
  "Mangelnde Sicherheit (Seguridad)": 0.85,
  "Vandalismus (Vandalismo)": 0.6,

  // 2. Operatividad y Accesibilidad (Prioridad Alta) 0.65-0.85
  "Verspätung (Retrasos)": 0.85,
  "Langsame Fahrt (Tren lento)": 0.8,
  "Defekte Aufzüge/Rolltreppen": 0.8,
  "Geschlossene Schalter": 0.7,
  "Entwerter Probleme (Validadores)": 0.65,
  "Ruppige Fahrweise (Conducción)": 0.65,

  // 3. Ambiente y Salud (Prioridad Media) 0.55-0.75
  "Schlechte Belüftung (Aire)": 0.75,
  "Hitze (Calor)": 0.7,
  "Beleuchtungsausfall (Iluminación)": 0.65,
  "Überfüllung (Saturación)": 0.6,

  // 4. Servicio al Cliente y Mantenimiento (Prioridad Baja) 0.10-0.45
  "Unfreundliches Personal": 0.35,
  "Geruchsbelästigung (Mal olor)": 0.3,
  "Verschmutzung (Suciedad)": 0.25,
};

/**
 * Función helper para obtener el peso de severidad según el sistema de metro
 */
export function getCategorySeverity(
  category: string,
  metroSystem: "cdmx" | "vienna"
): number {
  const map =
    metroSystem === "cdmx" ? categorySeverityCDMX : categorySeverityVienna;
  return map[category] || 0.5; // Default si no se encuentra la categoría
}
