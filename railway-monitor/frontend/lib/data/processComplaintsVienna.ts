// Process complaints data from Vienna JSON
import { categorySeverityVienna } from "./categorySeverityMaps";
import complaintsData from "./complaints_vienna.json";

interface Complaint {
  "Absender-Name": string;
  "Absender-E-Mail": string;
  "Empfänger-Name": string;
  "Empfänger-E-Mail": string;
  Betreff: string;
  Contenido: string;
  Fecha: string;
  "Message-ID": string;
  NombredeEstacion: string;
  IdEstacion: string;
  Linea: string;
  Asunto: string; // Esta es la categoría
}

interface StationData {
  reportCount: number;
  severity: number;
  recentIssue: string;
  lastReportDate: string;
  complaintIndex: number; // Índice de quejas en porcentaje (0-100%)
  topKeywords: string[]; // Palabras más frecuentes en los comentarios
  recentComments: Array<{
    content: string;
    date: string;
    subject: string;
  }>; // Últimos 5 comentarios
}

interface LineData {
  lineName: string;
  recentComments: Array<{
    station: string;
    content: string;
    date: string;
    subject: string;
  }>; // Últimos 5 comentarios de la línea
}

// Palabras comunes a ignorar (stopwords en alemán)
const STOPWORDS_GERMAN = new Set([
  // Artículos
  "der",
  "die",
  "das",
  "des",
  "dem",
  "den",
  "ein",
  "eine",
  "einer",
  "einen",
  "einem",
  "eines",
  // Pronombres
  "ich",
  "du",
  "er",
  "sie",
  "es",
  "wir",
  "ihr",
  "sich",
  "mich",
  "dich",
  "mir",
  "dir",
  "ihm",
  "ihr",
  "ihn",
  "uns",
  "euch",
  "ihnen",
  // Preposiciones
  "in",
  "an",
  "auf",
  "aus",
  "bei",
  "mit",
  "nach",
  "von",
  "zu",
  "über",
  "unter",
  "vor",
  "hinter",
  "neben",
  "zwischen",
  "durch",
  "für",
  "gegen",
  "ohne",
  "um",
  // Conjunciones
  "und",
  "oder",
  "aber",
  "denn",
  "sondern",
  "wenn",
  "weil",
  "dass",
  "ob",
  "als",
  "wie",
  "da",
  "bis",
  // Verbos auxiliares y comunes
  "sein",
  "haben",
  "werden",
  "können",
  "müssen",
  "sollen",
  "wollen",
  "dürfen",
  "mögen",
  "ist",
  "sind",
  "war",
  "waren",
  "hat",
  "haben",
  "wird",
  "wurde",
  "wurden",
  // Adverbios
  "auch",
  "nicht",
  "nur",
  "sehr",
  "noch",
  "schon",
  "mehr",
  "dann",
  "hier",
  "dort",
  "heute",
  "jetzt",
  "immer",
  "nie",
  "oft",
  "manchmal",
  "wieder",
  "etwa",
  // Otros
  "man",
  "alle",
  "viel",
  "viele",
  "einige",
  "manche",
  "jeder",
  "jede",
  "jedes",
  "dieser",
  "diese",
  "dieses",
  "welcher",
  "welche",
  "welches",
  "kein",
  "keine",
  "keiner",
  "etwas",
  "nichts",
  "alles",
  "was",
  "wer",
  "wo",
  "wann",
  "warum",
  "wie",
  // Palabras adicionales comunes en quejas
  "hatte",
  "gibt",
  "kam",
  "kam",
  "gab",
  "ging",
  "muss",
  "soll",
  "kann",
  "möchte",
  "während",
  "beim",
  "beim",
  "zur",
  "zum",
  "habe",
]);

// Función para extraer palabras clave del contenido en alemán
function extractKeywords(complaints: Complaint[], topN: number = 5): string[] {
  const wordFrequency = new Map<string, number>();

  complaints.forEach((complaint) => {
    // Combinar asunto y contenido
    const text = `${complaint.Asunto} ${complaint.Contenido}`.toLowerCase();

    // Extraer palabras (incluye letras alemanas: ä, ö, ü, ß, mínimo 4 caracteres)
    const words = text.match(/[a-zäöüß]{4,}/g) || [];

    words.forEach((word) => {
      if (!STOPWORDS_GERMAN.has(word)) {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      }
    });
  });

  // Ordenar por frecuencia y tomar las top N
  return Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

export function processComplaintsDataVienna(): Record<string, StationData> {
  const stationMap = new Map<
    string,
    {
      count: number;
      complaints: Complaint[];
      totalSeverity: number;
    }
  >();

  // Agrupar quejas por estación
  (complaintsData as Complaint[]).forEach((complaint) => {
    const stationName = complaint.NombredeEstacion;

    if (!stationMap.has(stationName)) {
      stationMap.set(stationName, {
        count: 0,
        complaints: [],
        totalSeverity: 0,
      });
    }

    const station = stationMap.get(stationName)!;
    station.count++;
    station.complaints.push(complaint);

    // Calcular severidad basada en el asunto
    const severity = categorySeverityVienna[complaint.Asunto] || 0.5;
    station.totalSeverity += severity;
  });

  // Convertir a formato final
  const result: Record<string, StationData> = {};

  stationMap.forEach((data, stationName) => {
    // Ordenar por fecha para obtener el reporte más reciente
    const sortedComplaints = data.complaints.sort((a, b) => {
      return new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime();
    });

    const latestComplaint = sortedComplaints[0];
    const avgSeverity = data.totalSeverity / data.count;

    // Calcular índice de quejas: (suma total de pesos / máximo posible) * 100
    // Máximo posible = número de quejas * 1.0 (severidad máxima)
    const complaintIndex = (data.totalSeverity / data.count) * 100;

    // Extraer palabras clave predominantes
    const topKeywords = extractKeywords(data.complaints, 5);

    // Obtener últimos 5 comentarios
    const recentComments = sortedComplaints.slice(0, 5).map((c) => ({
      content: c.Contenido.substring(0, 150) + "...", // Truncar a 150 caracteres
      date: c.Fecha,
      subject: c.Asunto,
    }));

    // Usar el nombre original de la estación como key (sin normalizar)
    // Esto permite buscar por nombre completo
    result[stationName] = {
      reportCount: data.count,
      severity: Math.min(avgSeverity, 1.0),
      recentIssue: latestComplaint.Asunto,
      lastReportDate: latestComplaint.Fecha,
      complaintIndex: Math.round(complaintIndex), // Redondear a entero
      topKeywords,
      recentComments,
    };
  });

  // Debug: Mostrar primeras estaciones procesadas
  console.log("=== STATION_COMPLAINT_DATA_VIENNA ===");
  console.log("Total estaciones:", Object.keys(result).length);
  console.log("Primeras 10 estaciones:", Object.keys(result).slice(0, 10));
  console.log("Ejemplo de datos:", result[Object.keys(result)[0]]);

  return result;
}

// Función para procesar comentarios por línea
export function processComplaintsByLineVienna(): Record<string, LineData> {
  const lineMap = new Map<
    string,
    {
      complaints: Complaint[];
    }
  >();

  // Agrupar quejas por línea
  (complaintsData as Complaint[]).forEach((complaint) => {
    const lineName = complaint.Linea;

    if (!lineMap.has(lineName)) {
      lineMap.set(lineName, {
        complaints: [],
      });
    }

    const line = lineMap.get(lineName)!;
    line.complaints.push(complaint);
  });

  // Convertir a formato final
  const result: Record<string, LineData> = {};

  lineMap.forEach((data, lineName) => {
    // Ordenar por fecha para obtener los reportes más recientes
    const sortedComplaints = data.complaints.sort((a, b) => {
      return new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime();
    });

    // Obtener últimos 5 comentarios de la línea
    const recentComments = sortedComplaints.slice(0, 5).map((c) => ({
      station: c.NombredeEstacion,
      content: c.Contenido.substring(0, 150) + "...", // Truncar a 150 caracteres
      date: c.Fecha,
      subject: c.Asunto,
    }));

    result[lineName] = {
      lineName,
      recentComments,
    };
  });

  console.log("=== LINE_COMPLAINT_DATA_VIENNA ===");
  console.log("Total líneas:", Object.keys(result).length);
  console.log("Líneas:", Object.keys(result));

  return result;
}

// Export processed data
console.log(
  "[processComplaintsVienna] ========== INICIO PROCESAMIENTO =========="
);
console.log(
  "[processComplaintsVienna] Total quejas en JSON:",
  (complaintsData as Complaint[]).length
);
console.log(
  "[processComplaintsVienna] Primera queja:",
  (complaintsData as Complaint[])[0]
);

export const STATION_COMPLAINT_DATA_VIENNA = processComplaintsDataVienna();
export const LINE_COMPLAINT_DATA_VIENNA = processComplaintsByLineVienna();

console.log("[processComplaintsVienna] ========== DATOS EXPORTADOS ==========");
console.log(
  "[processComplaintsVienna] Estaciones procesadas:",
  Object.keys(STATION_COMPLAINT_DATA_VIENNA).length
);
console.log(
  "[processComplaintsVienna] Líneas procesadas:",
  Object.keys(LINE_COMPLAINT_DATA_VIENNA).length
);
console.log(
  "[processComplaintsVienna] Primeras 10 estaciones:",
  Object.keys(STATION_COMPLAINT_DATA_VIENNA).slice(0, 10)
);
console.log(
  "[processComplaintsVienna] Ejemplo de datos de estación:",
  STATION_COMPLAINT_DATA_VIENNA[Object.keys(STATION_COMPLAINT_DATA_VIENNA)[0]]
);
console.log(
  "[processComplaintsVienna] =========================================="
);
