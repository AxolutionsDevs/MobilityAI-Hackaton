import { Category, MetroLine } from "@/types";
import {
  Clock,
  MessageSquare,
  Shield,
  Sparkles,
  Train,
  Users,
  Wrench,
} from "lucide-react";
import {
  LINE_COMPLAINT_DATA,
  STATION_COMPLAINT_DATA,
} from "./data/processComplaints";

export const CATEGORIES: Category[] = [
  {
    id: "seguridad",
    name: "Seguridad",
    icon: Shield,
    weight: 0.3,
    color: "#ef4444",
  },
  {
    id: "puntualidad",
    name: "Puntualidad",
    icon: Clock,
    weight: 0.25,
    color: "#f59e0b",
  },
  {
    id: "limpieza",
    name: "Limpieza",
    icon: Sparkles,
    weight: 0.15,
    color: "#10b981",
  },
  {
    id: "comodidad",
    name: "Comodidad",
    icon: Users,
    weight: 0.1,
    color: "#6366f1",
  },
  {
    id: "comunicacion",
    name: "Comunicación",
    icon: MessageSquare,
    weight: 0.1,
    color: "#8b5cf6",
  },
  {
    id: "fallas",
    name: "Fallas Técnicas",
    icon: Wrench,
    weight: 0.05,
    color: "#06b6d4",
  },
  {
    id: "saturacion",
    name: "Saturación",
    icon: Train,
    weight: 0.05,
    color: "#ec4899",
  },
];

export const METRO_LINES: MetroLine[] = [];

// Datos reales de reportes de quejas por estación desde complaints_cdmx.json
// severity: 0.0 = sin gravedad (sin rojo), 1.0 = gravedad máxima (rojo intenso)
// complaintIndex: porcentaje (0-100%) que representa el índice de quejas
// topKeywords: palabras más frecuentes en los comentarios de la estación
// recentComments: últimos 5 comentarios de la estación
export const STATION_REPORT_DATA: Record<
  string,
  {
    reportCount: number;
    severity: number;
    recentIssue: string;
    lastReportDate: string;
    complaintIndex: number;
    topKeywords: string[];
    recentComments: Array<{
      content: string;
      date: string;
      subject: string;
    }>;
  }
> = STATION_COMPLAINT_DATA;

// Datos de comentarios por línea
export const LINE_REPORT_DATA: Record<
  string,
  {
    lineName: string;
    recentComments: Array<{
      station: string;
      content: string;
      date: string;
      subject: string;
    }>;
  }
> = LINE_COMPLAINT_DATA;

export const PALABRAS_CLAVE: Record<string, string[]> = {
  seguridad: [
    "ROBOS",
    "ASALTOS",
    "ACOSO",
    "INSEGURO",
    "MIEDO",
    "PELEAS",
    "DROGAS",
    "VENDEDORES",
    "MANOSEO",
    "CARTERISTAS",
  ],
  puntualidad: [
    "RETRASOS",
    "TARDANZA",
    "LENTO",
    "ESPERA",
    "DEMORA",
    "TIEMPO",
    "HORARIO",
    "IMPUNTUAL",
    "FALTA",
    "TREN",
  ],
  limpieza: [
    "SUCIO",
    "BASURA",
    "OLOR",
    "ASQUEROSO",
    "COCHINO",
    "INMUNDO",
    "MUGRE",
    "DESASTRE",
    "PESTILENTE",
    "HIGIÉNICO",
  ],
  comodidad: [
    "LLENO",
    "CALOR",
    "ASIENTOS",
    "APRETADO",
    "SOFOCANTE",
    "INCÓMODO",
    "ASFIXIA",
    "EMPUJONES",
    "ESTRECHO",
    "HACINAMIENTO",
  ],
  comunicacion: [
    "CONFUSO",
    "AVISOS",
    "SEÑALES",
    "INFORMACIÓN",
    "ANUNCIOS",
    "MAPAS",
    "INDICACIONES",
    "DESORIENTADO",
    "PERDIDO",
    "INSTRUCCIONES",
  ],
  fallas: [
    "ESCALERAS",
    "AIRE",
    "PUERTAS",
    "ELEVADOR",
    "TORNIQUETES",
    "DESCOMPUESTO",
    "ROTO",
    "AVERÍA",
    "MANTENIMIENTO",
    "FALLA",
  ],
  saturacion: [
    "SATURADO",
    "ABARROTADO",
    "CAOS",
    "MULTITUD",
    "COLAPSO",
    "SOBRECUPO",
    "ATASCADO",
    "REPLETO",
    "DESBORDADO",
    "APRETUJADO",
  ],
};

export const FRASES_EJEMPLO: Record<string, string[]> = {
  ROBOS: ["Me robaron el celular", "Cuidado con los rateros", "Robo constante"],
  ASALTOS: [
    "Me asaltaron a punta de cuchillo",
    "Zona peligrosa",
    "Asaltos frecuentes",
  ],
  ACOSO: [
    "Me acosaron en el vagón",
    "Mucho acoso sexual",
    "Incomodidad constante",
  ],
  SUCIO: [
    "Está asqueroso el piso",
    "Huele muy mal",
    "Necesita limpieza urgente",
  ],
  BASURA: [
    "Mucha basura acumulada",
    "Tiran basura por todos lados",
    "Falta de botes",
  ],
  OLOR: [
    "Olor insoportable",
    "Apesta horrible",
    "Necesitan ventilación urgente",
  ],
  RETRASOS: [
    "Llevo 20 min esperando",
    "El tren no pasa",
    "Siempre con retrasos",
  ],
  TARDANZA: ["Muy tardado", "Demora excesiva", "Nunca es puntual"],
  LENTO: ["Servicio muy lento", "Va a vuelta de rueda", "Demasiado lento"],
  LLENO: ["Imposible subir", "Iba como sardina", "No cabe ni un alfiler"],
  CALOR: ["Calor insoportable", "Se siente como sauna", "Asfixiante el calor"],
  ASIENTOS: ["No hay asientos", "Todos los asientos rotos", "Faltan asientos"],
  ESCALERAS: [
    "Escaleras sin funcionar",
    "Otra vez descompuestas",
    "Siempre fuera de servicio",
  ],
  AIRE: ["No hay aire acondicionado", "Clima descompuesto", "Sin ventilación"],
  PUERTAS: ["Puertas trabadas", "No cierran bien", "Peligro con las puertas"],
  SATURADO: ["Demasiada gente", "Colapsó la estación", "Saturación extrema"],
  ABARROTADO: [
    "Está abarrotadísimo",
    "No se puede ni respirar",
    "Lleno a reventar",
  ],
  CAOS: ["Es un caos total", "Desorganización completa", "Mucho desorden"],
  CONFUSO: [
    "Muy confuso el mapa",
    "No entiendo las señales",
    "Desorientación total",
  ],
  AVISOS: [
    "No hay avisos claros",
    "Falta información",
    "Avisos incomprensibles",
  ],
  SEÑALES: ["Señalización deficiente", "Faltan señales", "Señales borrosas"],
};
