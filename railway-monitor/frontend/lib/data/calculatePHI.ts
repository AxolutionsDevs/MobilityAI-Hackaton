// Calculate global PHI (Public Health Index) for metro systems
import complaintsDataCDMX from "./complaints_cdmx.json";
import complaintsDataVienna from "./complaints_vienna.json";

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

// Clasificación por categorías y pesos de gravedad (0 a 1)
// Estos pesos son los mismos que en processComplaints.ts
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
 *//**
* Calcula el PHI global usando penalización no lineal
* Fórmula:
PHIα​=100(1−∑cantidadi​∑(pesoiα​⋅cantidadi​)​)

*/
function calculateMetroPHI(
    complaints: Complaint[],
    metroName: string,
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
        const baseWeight = categorySeverity[category] || 0.5;
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
        complaintsDataCDMX as Complaint[],
        "Metro CDMX"
    );

    const viennaPHI = calculateMetroPHI(
        complaintsDataVienna as Complaint[],
        "Metro Vienna"
    );

    return {
        cdmx: cdmxPHI,
        vienna: viennaPHI,
    };
}

// Export pre-calculated data
export const GLOBAL_PHI_DATA = calculateGlobalPHI();
