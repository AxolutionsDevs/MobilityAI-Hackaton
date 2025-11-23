// Calculate global PHI (Public Health Index) for metro systems
import {
  categorySeverityCDMX,
  categorySeverityVienna,
} from "./categorySeverityMaps";
import complaintsDataCDMX from "./complaints_cdmx.json";
import complaintsDataVienna from "./complaints_vienna.json";

interface ComplaintCDMX {
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

interface ComplaintVienna {
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
  Asunto: string;
}

export interface PHIData {
  metroName: string;
  phi: number;
  totalComplaints: number;
  weightedSum: number;
  categoryBreakdown: {
    category: string;
    count: number;
    weight: number;
    impact: number; // peso * cantidad
  }[];
}

/**
 * Calcula el PHI global para un sistema de metro
 * Fórmula: PHI = 100 - Σ(peso_del_asunto × cantidad)
 *
 * Para normalizar el resultado, dividimos la suma ponderada por el total de quejas
 * y multiplicamos por 100 para obtener un porcentaje de impacto
 */ /**
* Calcula el PHI global usando penalización no lineal
* Fórmula:
PHIα​=100(1−∑cantidadi​∑(pesoiα​⋅cantidadi​)​)

*/
function calculateMetroPHI(
  complaints: (ComplaintCDMX | ComplaintVienna)[],
  metroName: string,
  categorySeverityMap: Record<string, number>,
  alpha: number = 2.0 // Exponente para penalización no lineal
): PHIData {
  // Contar quejas por categoría
  const categoryCount = new Map<string, number>();

  complaints.forEach((complaint) => {
    const category = complaint.Asunto;
    categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
  });

  // Calcular suma ponderada no lineal: Σ( (peso^α) × cantidad )
  let weightedSum = 0;
  const categoryBreakdown: PHIData["categoryBreakdown"] = [];

  categoryCount.forEach((count, category) => {
    const baseWeight = categorySeverityMap[category] || 0.5;
    const nonlinearWeight = Math.pow(baseWeight, alpha);
    const impact = nonlinearWeight * count;
    weightedSum += impact;

    categoryBreakdown.push({
      category,
      count,
      weight: nonlinearWeight, // ahora mostramos el peso ya elevado
      impact,
    });
  });

  // Ordenar por impacto
  categoryBreakdown.sort((a, b) => b.impact - a.impact);

  const totalComplaints = complaints.length;

  // Media ponderada no lineal
  const avgImpact = weightedSum / totalComplaints;

  // PHI exponencial
  let phi = 100 * (1 - avgImpact);
  phi = Math.max(0, phi); // evitar negativos

  return {
    metroName,
    phi: Math.round(phi * 10) / 10,
    totalComplaints,
    weightedSum: Math.round(weightedSum * 10) / 10,
    categoryBreakdown,
  };
}

/**
 * Calcula el PHI para ambos sistemas de metro
 */
export function calculateGlobalPHI(): {
  cdmx: PHIData;
  vienna: PHIData;
} {
  const cdmxPHI = calculateMetroPHI(
    complaintsDataCDMX as ComplaintCDMX[],
    "Metro CDMX",
    categorySeverityCDMX
  );

  const viennaPHI = calculateMetroPHI(
    complaintsDataVienna as ComplaintVienna[],
    "Metro Vienna",
    categorySeverityVienna
  );

  return {
    cdmx: cdmxPHI,
    vienna: viennaPHI,
  };
} // Export pre-calculated data
export const GLOBAL_PHI_DATA = calculateGlobalPHI();
