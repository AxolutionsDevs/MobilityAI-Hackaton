// Process complaints data from JSON
import complaintsData from "./complaints_cdmx.json";

interface Complaint {
  Nombre_remitente: string;
  Email_remitente: string;
  Nombre_destinatario: string;
  Email_destinatario: string;
  Asunto: string;
  Contenido: string;
  Fecha: string;
  "Message-ID": string;
  NombredeEstacion: string;
  IdEstacion: string;
  Linea: string;
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

// Clasificación por categorías y pesos de gravedad (0 a 1)
// Prioriza: seguridad física > operatividad > ambiente/salud > confort
const categorySeverity: Record<string, number> = {
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

// Palabras comunes a ignorar (stopwords en español)
const STOPWORDS = new Set([
  "el",
  "la",
  "de",
  "que",
  "y",
  "a",
  "en",
  "un",
  "ser",
  "se",
  "no",
  "haber",
  "por",
  "con",
  "su",
  "para",
  "como",
  "estar",
  "tener",
  "le",
  "lo",
  "todo",
  "pero",
  "más",
  "hacer",
  "o",
  "poder",
  "decir",
  "este",
  "ir",
  "otro",
  "ese",
  "si",
  "me",
  "ya",
  "ver",
  "porque",
  "dar",
  "cuando",
  "él",
  "muy",
  "sin",
  "vez",
  "mucho",
  "saber",
  "qué",
  "sobre",
  "mi",
  "alguno",
  "mismo",
  "yo",
  "también",
  "hasta",
  "año",
  "dos",
  "querer",
  "entre",
  "así",
  "primero",
  "desde",
  "grande",
  "eso",
  "ni",
  "nos",
  "llegar",
  "pasar",
  "tiempo",
  "ella",
  "sí",
  "día",
  "uno",
  "bien",
  "poco",
  "deber",
  "entonces",
  "poner",
  "cosa",
  "tanto",
  "hombre",
  "parecer",
  "nuestro",
  "tan",
  "donde",
  "ahora",
  "parte",
  "después",
  "vida",
  "quedar",
  "siempre",
  "creer",
  "hablar",
  "llevar",
  "dejar",
  "nada",
  "cada",
  "seguir",
  "menos",
  "nuevo",
  "encontrar",
  "algo",
  "solo",
  "decir",
  "casa",
  "usar",
  "uno",
  "buen",
  "saber",
  "hacer",
  "tiempo",
  "año",
  "estar",
  "mismo",
  "otro",
  "haber",
  "tener",
  "más",
  "fue",
  "era",
  "sido",
  "las",
  "los",
  "una",
  "del",
  "al",
  "es",
  "por",
  "ante",
  "bajo",
  "cabe",
  "con",
  "contra",
  "desde",
  "durante",
  "mediante",
  "para",
  "según",
  "sin",
  "sobre",
  "tras",
  "versus",
  "vía",
]);

// Función para extraer palabras clave del contenido
function extractKeywords(complaints: Complaint[], topN: number = 5): string[] {
  const wordFrequency = new Map<string, number>();

  complaints.forEach((complaint) => {
    // Combinar asunto y contenido
    const text = `${complaint.Asunto} ${complaint.Contenido}`.toLowerCase();

    // Extraer palabras (solo letras, mínimo 4 caracteres)
    const words = text.match(/[a-záéíóúüñ]{4,}/g) || [];

    words.forEach((word) => {
      if (!STOPWORDS.has(word)) {
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

export function processComplaintsData(): Record<string, StationData> {
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
    const severity = categorySeverity[complaint.Asunto] || 0.5;
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
  console.log("=== STATION_COMPLAINT_DATA ===");
  console.log("Total estaciones:", Object.keys(result).length);
  console.log("Primeras 10 estaciones:", Object.keys(result).slice(0, 10));
  console.log("Ejemplo de datos:", result[Object.keys(result)[0]]);

  return result;
}

// Función para procesar comentarios por línea
export function processComplaintsByLine(): Record<string, LineData> {
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

  console.log("=== LINE_COMPLAINT_DATA ===");
  console.log("Total líneas:", Object.keys(result).length);
  console.log("Líneas:", Object.keys(result));

  return result;
}

// Export processed data
export const STATION_COMPLAINT_DATA = processComplaintsData();
export const LINE_COMPLAINT_DATA = processComplaintsByLine();
