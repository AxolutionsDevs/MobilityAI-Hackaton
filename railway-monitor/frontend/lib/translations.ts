export type City = "cdmx" | "vienna";
export type Language = "es" | "de";

export interface Translations {
  // Header
  headerTitle: string;
  headerSubtitle: string;
  cityName: string;

  // KPIs
  globalPHI: string;
  positives: string;
  alerts: string;
  response: string;
  comments: string;
  critical: string;
  average: string;

  // Navigation Tabs
  heatmap: string;
  importSVG: string;
  indicators: string;
  predictive: string;
  comparison: string;

  // Heatmap
  heatmapTitle: string;
  allLines: string;
  line: string;
  intensity: string;

  // Import
  importedLines: string;
  stations: string;
  active: string;

  // Indicators
  weeklyTrends: string;
  security: string;
  punctuality: string;
  cleanliness: string;

  // Days of week
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;

  // Predictive
  predictiveTitle: string;
  projectedConflicts: string;
  riskLevel: string;
  aiRecommendations: string;
  recommendation1: string;
  recommendation2: string;
  recommendation3: string;

  // Comparison
  internationalComparison: string;
  metroCDMX: string;
  metroVienna: string;
  globalAveragePHI: string;

  // Station Info
  stationInfo: string;
  predominantWord: string;
  mentions: string;

  // Category Weights
  categoryWeights: string;
  nlpWeights: string;

  // Live Feed
  liveFeed: string;
  liveFeedTitle: string;
  live: string;

  // Global PHI
  globalPHITitle: string;
  good: string;
  system: string;
  positive: string;
  neutral: string;
  negative: string;

  // SVG Importer
  importTransportLine: string;
  lineName: string;
  lineNamePlaceholder: string;
  lineColor: string;
  dragSVGFile: string;
  autoDetectNodes: string;
  or: string;
  simulateLoadExample: string;
  processingSVG: string;
  editStations: string;
  station: string;
  actions: string;
  save: string;
  export: string;
  clean: string;
  preview: string;
  dragStationsToMove: string;
  instructions: string;
  instruction1: string;
  instruction2: string;
  instruction3: string;
  instruction4: string;
  instruction5: string;
  instruction6: string;
  tip: string;
  tipText: string;

  // Category names
  categorySeguridad: string;
  categoryPuntualidad: string;
  categoryLimpieza: string;
  categoryComodidad: string;
  categoryComunicacion: string;
  categoryFallas: string;
  categorySaturacion: string;

  // Heatmap Legend
  intensityPHI: string;
  criticalLevel: string;
  alertLevel: string;
  optimalLevel: string;
  editMode: string;
  editNodes: string;

  // Footer
  footer: string;
}

export const translations: Record<City, Translations> = {
  cdmx: {
    // Header
    headerTitle: "🚇 Dashboard PHI - Metro CDMX",
    headerSubtitle: "Sistema de Análisis con NLP",
    cityName: "Ciudad de México",

    // KPIs
    globalPHI: "PHI Global",
    positives: "Positivos",
    alerts: "Alertas",
    response: "Respuesta",
    comments: "comentarios",
    critical: "críticas",
    average: "Promedio",

    // Navigation Tabs
    heatmap: "Mapa de Calor",
    importSVG: "Importar",
    indicators: "Indicadores",
    predictive: "Predictivo",
    comparison: "Comparación",

    // Heatmap
    heatmapTitle: "Mapa de Calor PHI",
    allLines: "Todas las líneas",
    line: "Línea",
    intensity: "Intensidad",

    // Import
    importedLines: "🚇 Líneas Importadas",
    stations: "estaciones",
    active: "Activa",

    // Indicators
    weeklyTrends: "Tendencias Semanales",
    security: "Seguridad",
    punctuality: "Puntualidad",
    cleanliness: "Limpieza",

    // Days of week
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mié",
    thursday: "Jue",
    friday: "Vie",
    saturday: "Sáb",
    sunday: "Dom",

    // Predictive
    predictiveTitle: "Análisis Predictivo de Conflictos (24h)",
    projectedConflicts: "Conflictos Proyectados",
    riskLevel: "Nivel de Riesgo",
    aiRecommendations: "🔴 Recomendaciones de IA",
    recommendation1: "• Reforzar vigilancia en hora pico (17:00 - 20:00)",
    recommendation2:
      "• Aumentar frecuencia de trenes en Línea 1 durante mañana",
    recommendation3: "• Revisar iluminación en estaciones con bajo PHI",

    // Comparison
    internationalComparison: "Comparación Internacional",
    metroCDMX: "Metro CDMX",
    metroVienna: "Metro Viena",
    globalAveragePHI: "PHI Promedio Global",

    // Station Info
    stationInfo: "Información de Estación",
    predominantWord: "🔥 PALABRA PREDOMINANTE",
    mentions: "menciones",

    // Category Weights
    categoryWeights: "Pesos de Categorías",
    nlpWeights: "⚖️ Pesos NLP",

    // Live Feed
    liveFeed: "Feed en Vivo",
    liveFeedTitle: "💬 Feed en Vivo",
    live: "Live",

    // Global PHI
    globalPHITitle: "PHI Global",
    good: "Bueno",
    system: "Sistema",
    positive: "Positivo",
    neutral: "Neutral",
    negative: "Negativo",

    // SVG Importer
    importTransportLine: "Importar Línea de Transporte",
    lineName: "Nombre de la línea",
    lineNamePlaceholder: "Ej: Línea A - Metrobús",
    lineColor: "Color de la línea",
    dragSVGFile: "Arrastra un archivo o haz clic",
    autoDetectNodes: "El sistema detectará automáticamente los nodos",
    or: "o",
    simulateLoadExample: "Simular Carga de Ejemplo",
    processingSVG: "Procesando SVG...",
    editStations: "📝 Editar Estaciones",
    station: "Estación",
    actions: "⚡ Acciones",
    save: "Guardar",
    export: "Exportar",
    clean: "Limpiar",
    preview: "Vista Previa - Arrastra estaciones para moverlas",
    dragStationsToMove: "Arrastra estaciones para moverlas",
    instructions: "📖 Instrucciones",
    instruction1: "Sube un archivo SVG con el trazo de tu línea",
    instruction2: "El sistema detectará automáticamente los nodos",
    instruction3: "Arrastra las estaciones para reposicionarlas",
    instruction4: "Edita los nombres haciendo clic en cada estación",
    instruction5: "Guarda en el dashboard o exporta como JSON",
    instruction6: "El sistema asignará PHI automáticamente",
    tip: "💡 Tip:",
    tipText:
      "Funciona con cualquier sistema de transporte de cualquier ciudad del mundo.",

    // Category names
    categorySeguridad: "Seguridad",
    categoryPuntualidad: "Puntualidad",
    categoryLimpieza: "Limpieza",
    categoryComodidad: "Comodidad",
    categoryComunicacion: "Comunicación",
    categoryFallas: "Fallas Técnicas",
    categorySaturacion: "Saturación",

    // Heatmap Legend
    intensityPHI: "Intensidad PHI",
    criticalLevel: "Crítico",
    alertLevel: "Alerta",
    optimalLevel: "Óptimo",
    editMode: "Modo Edición",
    editNodes: "Editar Nodos",

    // Footer
    footer:
      "Dashboard PHI v3.0 • Análisis Predictivo • Comparación Internacional • NLP en tiempo real",
  },

  vienna: {
    // Header
    headerTitle: "🚇 PHI Dashboard - U-Bahn Wien",
    headerSubtitle: "NLP-Analysesystem",
    cityName: "Wien",

    // KPIs
    globalPHI: "Globaler PHI",
    positives: "Positiv",
    alerts: "Warnungen",
    response: "Antwort",
    comments: "Kommentare",
    critical: "kritisch",
    average: "Durchschnitt",

    // Navigation Tabs
    heatmap: "Heatmap",
    importSVG: "SVG Importieren",
    indicators: "Indikatoren",
    predictive: "Prädiktiv",
    comparison: "Vergleich",

    // Heatmap
    heatmapTitle: "PHI Heatmap",
    allLines: "Alle Linien",
    line: "Linie",
    intensity: "Intensität",

    // Import
    importedLines: "🚇 Importierte Linien",
    stations: "Stationen",
    active: "Aktiv",

    // Indicators
    weeklyTrends: "Wöchentliche Trends",
    security: "Sicherheit",
    punctuality: "Pünktlichkeit",
    cleanliness: "Sauberkeit",

    // Days of week
    monday: "Mon",
    tuesday: "Die",
    wednesday: "Mit",
    thursday: "Don",
    friday: "Fre",
    saturday: "Sam",
    sunday: "Son",

    // Predictive
    predictiveTitle: "Prädiktive Konfliktanalyse (24h)",
    projectedConflicts: "Prognostizierte Konflikte",
    riskLevel: "Risikoniveau",
    aiRecommendations: "🔴 KI-Empfehlungen",
    recommendation1: "• Überwachung in Stoßzeiten verstärken (17:00 - 20:00)",
    recommendation2: "• Zugfrequenz auf Linie U1 am Morgen erhöhen",
    recommendation3: "• Beleuchtung in Stationen mit niedrigem PHI überprüfen",

    // Comparison
    internationalComparison: "Internationaler Vergleich",
    metroCDMX: "Metro CDMX",
    metroVienna: "U-Bahn Wien",
    globalAveragePHI: "Globaler Durchschnitts-PHI",

    // Station Info
    stationInfo: "Stationsinformationen",
    predominantWord: "🔥 VORHERRSCHENDES WORT",
    mentions: "Erwähnungen",

    // Category Weights
    categoryWeights: "Kategoriegewichte",
    nlpWeights: "⚖️ NLP-Gewichte",

    // Live Feed
    liveFeed: "Live-Feed",
    liveFeedTitle: "💬 Live-Feed",
    live: "Live",

    // Global PHI
    globalPHITitle: "Globaler PHI",
    good: "Gut",
    system: "System",
    positive: "Positiv",
    neutral: "Neutral",
    negative: "Negativ",

    // SVG Importer
    importTransportLine: "Transportlinie Importieren",
    lineName: "Linienname",
    lineNamePlaceholder: "z.B.: Linie A - Metrobus",
    lineColor: "Linienfarbe",
    dragSVGFile: "Datei hierher ziehen oder klicken",
    autoDetectNodes: "Das System erkennt automatisch die Knoten",
    or: "oder",
    simulateLoadExample: "Beispiel-Laden Simulieren",
    processingSVG: "SVG wird verarbeitet...",
    editStations: "📝 Stationen Bearbeiten",
    station: "Station",
    actions: "⚡ Aktionen",
    save: "Speichern",
    export: "Exportieren",
    clean: "Löschen",
    preview: "Vorschau - Stationen zum Verschieben ziehen",
    dragStationsToMove: "Stationen zum Verschieben ziehen",
    instructions: "📖 Anleitung",
    instruction1: "Laden Sie eine SVG-Datei mit Ihrer Linienstrecke hoch",
    instruction2: "Das System erkennt automatisch die Knoten",
    instruction3: "Ziehen Sie die Stationen, um sie neu zu positionieren",
    instruction4: "Bearbeiten Sie die Namen durch Klicken auf jede Station",
    instruction5: "Speichern Sie im Dashboard oder exportieren Sie als JSON",
    instruction6: "Das System weist automatisch PHI zu",
    tip: "💡 Tipp:",
    tipText: "Funktioniert mit jedem Transportsystem in jeder Stadt der Welt.",

    // Category names
    categorySeguridad: "Sicherheit",
    categoryPuntualidad: "Pünktlichkeit",
    categoryLimpieza: "Sauberkeit",
    categoryComodidad: "Komfort",
    categoryComunicacion: "Kommunikation",
    categoryFallas: "Technische Störungen",
    categorySaturacion: "Sättigung",

    // Heatmap Legend
    intensityPHI: "PHI-Intensität",
    criticalLevel: "Kritisch",
    alertLevel: "Warnung",
    optimalLevel: "Optimal",
    editMode: "Bearbeitungsmodus",
    editNodes: "Knoten Bearbeiten",

    // Footer
    footer:
      "PHI Dashboard v3.0 • Prädiktive Analyse • Internationaler Vergleich • Echtzeit-NLP",
  },
};

export const getTranslations = (city: City): Translations => {
  return translations[city];
};
