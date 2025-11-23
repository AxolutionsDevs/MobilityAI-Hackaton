import { LucideIcon } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  weight: number;
  color: string;
}

export interface Station {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface MetroLine {
  id: string;
  name: string;
  color: string;
  stations: Station[];
}

export interface CustomLine extends MetroLine {
  paths?: SVGPath[];
  viewBox?: string;
  city?: "cdmx" | "vienna";
}

export interface SVGPath {
  id: string;
  d: string;
  stroke: string;
  points: string;
}

export interface StationData {
  phi: number;
  comments: number;
  positive: number;
  negative: number;
  alerts: number;
  topIssue: string;
  palabraClave: string;
  categoria: string;
  menciones: number;
  tendencia: "up" | "down";
  ejemplos: string[];
  reportCount?: number; // Número de reportes
  severity?: number; // Gravedad promedio (0-1)
  complaintIndex?: number; // Índice de quejas en porcentaje (0-100%)
  topKeywords?: string[]; // Palabras clave más frecuentes
  recentComments?: Array<{
    content: string;
    date: string;
    subject: string;
  }>; // Últimos comentarios
}

export interface StationDataMap {
  [stationId: string]: StationData;
}

export interface Comment {
  text: string;
  sentiment: "positive" | "neutral" | "negative";
}

export interface DetectedNode {
  id: string;
  x: number;
  y: number;
  name: string;
  phi: number;
  palabraClave: string;
  categoria: string;
}

export interface KPICardData {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub: string;
}
