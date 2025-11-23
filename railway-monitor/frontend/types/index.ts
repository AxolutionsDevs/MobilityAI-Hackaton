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
