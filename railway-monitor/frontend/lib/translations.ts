export type City = "cdmx" | "vienna";
export type Language = "en" | "de";

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

  // Map and UI Text
  centerView: string;
  heatmapIntensity: string;
  lowSeverity: string;
  mediumSeverity: string;
  highSeverity: string;
  areaSize: string;
  largerArea: string;
  noLinesMap: string;
  startImporting: string;
  goToImport: string;
  mainCategories: string;
  trends: string;
  lastComments: string;
  noRecentComments: string;
  dominantKeywords: string;
  noData: string;
  reports: string;
  index: string;
  severity: string;
  noLinesMessage: string;
  noLinesDescription: string;

  // Import buttons
  importJSON: string;
  detectBackend: string;

  // Trends dashboard
  historical: string;
  last7Days: string;
  last30Days: string;
  unknown: string;
  top5CriticalStations: string;
  distributionByLine: string;
  complaints: string;
  complaintVolume: string;
  seismograph: string;

  // Footer
  footer: string;
}

export const translations: Record<City, Translations> = {
  cdmx: {
    // Header
    headerTitle: "🚇 PHI Dashboard - Metro CDMX",
    headerSubtitle: "NLP Analysis System",
    cityName: "Mexico City",

    // KPIs
    globalPHI: "Global PHI",
    positives: "Positive",
    alerts: "Alerts",
    response: "Response",
    comments: "comments",
    critical: "critical",
    average: "Average",

    // Navigation Tabs
    heatmap: "Heat Map",
    importSVG: "Import",
    indicators: "Indicators",
    predictive: "Predictive",
    comparison: "Comparison",

    // Heatmap
    heatmapTitle: "PHI Heat Map",
    allLines: "All Lines",
    line: "Line",
    intensity: "Intensity",

    // Import
    importedLines: "🚇 Imported Lines",
    stations: "stations",
    active: "Active",

    // Indicators
    weeklyTrends: "Weekly Trends",
    security: "Security",
    punctuality: "Punctuality",
    cleanliness: "Cleanliness",

    // Days of week
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",

    // Predictive
    predictiveTitle: "Predictive Conflict Analysis (24h)",
    projectedConflicts: "Projected Conflicts",
    riskLevel: "Risk Level",
    aiRecommendations: "🔴 AI Recommendations",
    recommendation1: "• Strengthen surveillance during peak hours (17:00 - 20:00)",
    recommendation2: "• Increase train frequency on Line 1 during morning",
    recommendation3: "• Review lighting in stations with low PHI",

    // Comparison
    internationalComparison: "International Comparison",
    metroCDMX: "Metro CDMX",
    metroVienna: "Vienna Metro",
    globalAveragePHI: "Global Average PHI",

    // Station Info
    stationInfo: "Station Information",
    predominantWord: "🔥 DOMINANT KEYWORDS",
    mentions: "mentions",

    // Category Weights
    categoryWeights: "Category Weights",
    nlpWeights: "⚖️ NLP Weights",

    // Live Feed
    liveFeed: "Live Feed",
    liveFeedTitle: "💬 Live Feed",
    live: "Live",

    // Global PHI
    globalPHITitle: "Global PHI",
    good: "Good",
    system: "System",
    positive: "Positive",
    neutral: "Neutral",
    negative: "Negative",

    // SVG Importer
    importTransportLine: "Import Transport Line",
    lineName: "Line Name",
    lineNamePlaceholder: "E.g: Line A - Metrobus",
    lineColor: "Line Color",
    dragSVGFile: "Drag file or click",
    autoDetectNodes: "System will automatically detect nodes",
    or: "or",
    simulateLoadExample: "Simulate Example Load",
    processingSVG: "Processing SVG...",
    editStations: "📝 Edit Stations",
    station: "Station",
    actions: "⚡ Actions",
    save: "Save",
    export: "Export",
    clean: "Clean",
    preview: "Preview - Drag stations to move them",
    dragStationsToMove: "Drag stations to move them",
    instructions: "📖 Instructions",
    instruction1: "Upload an SVG file with your line path",
    instruction2: "The system will automatically detect nodes",
    instruction3: "Drag stations to reposition them",
    instruction4: "Edit names by clicking on each station",
    instruction5: "Save to dashboard or export as JSON",
    instruction6: "System will automatically assign PHI",
    tip: "💡 Tip:",
    tipText:
      "Works with any transportation system from any city in the world.",

    // Category names
    categorySeguridad: "Security",
    categoryPuntualidad: "Punctuality",
    categoryLimpieza: "Cleanliness",
    categoryComodidad: "Comfort",
    categoryComunicacion: "Communication",
    categoryFallas: "Technical Failures",
    categorySaturacion: "Saturation",

    // Heatmap Legend
    intensityPHI: "PHI Intensity",
    criticalLevel: "Critical",
    alertLevel: "Alert",
    optimalLevel: "Optimal",
    editMode: "Edit Mode",
    editNodes: "Edit Nodes",

    // Map and UI Text
    centerView: "Center View",
    heatmapIntensity: "Intensity of color:",
    lowSeverity: "Low severity",
    mediumSeverity: "Medium severity",
    highSeverity: "High severity",
    areaSize: "Area size:",
    largerArea: "Larger area = more reports",
    noLinesMap: "No lines on the map",
    startImporting: "Start by importing an SVG or JSON file with metro lines",
    goToImport: "Go to Import Map",
    mainCategories: "Main Categories",
    trends: "Trends",
    lastComments: "Latest Comments (Station):",
    noRecentComments: "No recent comments",
    dominantKeywords: "Dominant Keywords",
    noData: "No data",
    reports: "Reports",
    index: "Index",
    severity: "Severity",
    noLinesMessage: "No lines on the map",
    noLinesDescription: "Start by importing an SVG or JSON file with metro lines",

    // Import buttons
    importJSON: "Import JSON",
    detectBackend: "Detect (Backend)",

    // Trends dashboard
    historical: "Historical",
    last7Days: "Last 7 days",
    last30Days: "Last 30 days",
    unknown: "Unknown",
    top5CriticalStations: "Top 5 Critical Stations",
    distributionByLine: "Distribution by Line",
    complaints: "Complaints",
    complaintVolume: "Complaint Volume (Seismograph)",
    seismograph: "Seismograph",

    // Footer
    footer:
      "PHI Dashboard v3.0 • Predictive Analysis • International Comparison • Real-time NLP",
  },

  vienna: {
    // Header
    headerTitle: "🚇 PHI-Dashboard - U-Bahn Wien",
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
    heatmap: "Wärmekarte",
    importSVG: "Importieren",
    indicators: "Indikatoren",
    predictive: "Prädiktiv",
    comparison: "Vergleich",

    // Heatmap
    heatmapTitle: "PHI Wärmekarte",
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
    monday: "Mo",
    tuesday: "Di",
    wednesday: "Mi",
    thursday: "Do",
    friday: "Fr",
    saturday: "Sa",
    sunday: "So",

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
    predominantWord: "🔥 DOMINANTE SCHLÜSSELWÖRTER",
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

    // Map and UI Text
    centerView: "Ansicht Zentrieren",
    heatmapIntensity: "Farbintensität:",
    lowSeverity: "Geringe Schweregrad",
    mediumSeverity: "Mittlerer Schweregrad",
    highSeverity: "Hoher Schweregrad",
    areaSize: "Gebietsgröße:",
    largerArea: "Größeres Gebiet = mehr Berichte",
    noLinesMap: "Keine Linien auf der Karte",
    startImporting: "Beginnen Sie mit dem Importieren einer SVG- oder JSON-Datei mit U-Bahn-Linien",
    goToImport: "Zur Karteneinfuhr gehen",
    mainCategories: "Hauptkategorien",
    trends: "Trends",
    lastComments: "Neueste Kommentare (Station):",
    noRecentComments: "Keine aktuellen Kommentare",
    dominantKeywords: "Dominante Schlüsselwörter",
    noData: "Keine Daten",
    reports: "Berichte",
    index: "Index",
    severity: "Schweregrad",
    noLinesMessage: "Keine Linien auf der Karte",
    noLinesDescription: "Beginnen Sie mit dem Importieren einer SVG- oder JSON-Datei mit U-Bahn-Linien",

    // Import buttons
    importJSON: "JSON importieren",
    detectBackend: "Erkennen (Backend)",

    // Trends dashboard
    historical: "Historisch",
    last7Days: "Letzte 7 Tage",
    last30Days: "Letzte 30 Tage",
    unknown: "Unbekannt",
    top5CriticalStations: "Top 5 kritische Stationen",
    distributionByLine: "Verteilung nach Linie",
    complaints: "Beschwerden",
    complaintVolume: "Beschwerdevolumen (Seismograph)",
    seismograph: "Seismograph",

    // Footer
    footer:
      "PHI-Dashboard v3.0 • Prädiktive Analyse • Internationaler Vergleich • Echtzeit-NLP",
  },
};

export const getTranslations = (city: City): Translations => {
  return translations[city];
};
