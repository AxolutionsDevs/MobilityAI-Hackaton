// Vienna Metro Lines Configuration
import { MetroLine } from "@/types";
import viennaStationsRaw from "./estacionesvienna.json";

interface ViennaStation {
  id: number;
  nombre: string;
  coords: { x: number; y: number };
  radio: number;
}

const viennaStations = viennaStationsRaw as ViennaStation[];

// Mapeo de colores reales del metro de Vienna
const VIENNA_LINE_COLORS: Record<string, string> = {
  U1: "#E2001A", // Rot (Rojo)
  U2: "#A862A4", // Violett (Violeta)
  U3: "#F39100", // Orange (Naranja)
  U4: "#00933B", // Grün (Verde)
  U6: "#9C6830", // Braun (Marrón)
};

// Filtrar solo estaciones con nombres válidos (no "Estacion_X")
const validStations = viennaStations.filter(
  (s) => s.nombre && !s.nombre.startsWith("Estacion_")
);

console.log(
  "[viennaMetroLines] Estaciones válidas encontradas:",
  validStations.length
);
console.log(
  "[viennaMetroLines] Primeras 5:",
  validStations.slice(0, 5).map((s) => s.nombre)
);

// Distribuir estaciones entre las líneas
const stationsPerLine = Math.ceil(validStations.length / 5);

// Agrupación manual de estaciones por línea
export const VIENNA_METRO_LINES: MetroLine[] = [
  {
    id: "U1",
    name: "U1 (Rot)",
    color: VIENNA_LINE_COLORS["U1"],
    stations: validStations.slice(0, stationsPerLine).map((s) => ({
      id: `vienna-u1-${s.id}`,
      name: s.nombre,
      x: s.coords.x,
      y: s.coords.y,
    })),
  },
  {
    id: "U2",
    name: "U2 (Violett)",
    color: VIENNA_LINE_COLORS["U2"],
    stations: validStations
      .slice(stationsPerLine, stationsPerLine * 2)
      .map((s) => ({
        id: `vienna-u2-${s.id}`,
        name: s.nombre,
        x: s.coords.x,
        y: s.coords.y,
      })),
  },
  {
    id: "U3",
    name: "U3 (Orange)",
    color: VIENNA_LINE_COLORS["U3"],
    stations: validStations
      .slice(stationsPerLine * 2, stationsPerLine * 3)
      .map((s) => ({
        id: `vienna-u3-${s.id}`,
        name: s.nombre,
        x: s.coords.x,
        y: s.coords.y,
      })),
  },
  {
    id: "U4",
    name: "U4 (Grün)",
    color: VIENNA_LINE_COLORS["U4"],
    stations: validStations
      .slice(stationsPerLine * 3, stationsPerLine * 4)
      .map((s) => ({
        id: `vienna-u4-${s.id}`,
        name: s.nombre,
        x: s.coords.x,
        y: s.coords.y,
      })),
  },
  {
    id: "U6",
    name: "U6 (Braun)",
    color: VIENNA_LINE_COLORS["U6"],
    stations: validStations.slice(stationsPerLine * 4).map((s) => ({
      id: `vienna-u6-${s.id}`,
      name: s.nombre,
      x: s.coords.x,
      y: s.coords.y,
    })),
  },
];

console.log(
  "[viennaMetroLines] Líneas de Vienna cargadas:",
  VIENNA_METRO_LINES.length
);
VIENNA_METRO_LINES.forEach((line) => {
  console.log(`  - ${line.name}: ${line.stations.length} estaciones`);
});
