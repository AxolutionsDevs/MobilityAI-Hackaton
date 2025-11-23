import { CATEGORIES, FRASES_EJEMPLO, METRO_LINES } from "@/lib/constants";
import { StationDataMap } from "@/types";

// Seeded random function for consistent server/client rendering
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const generateStationPHI = (): StationDataMap => {
  const data: StationDataMap = {};

  const problems = [
    { id: "obs", cat: "saturacion", palabra: "SATURADO", phi: 42 },
    { id: "tac", cat: "fallas", palabra: "ESCALERAS", phi: 55 },
    { id: "jua", cat: "limpieza", palabra: "SUCIO", phi: 61 },
    { id: "cha", cat: "seguridad", palabra: "ROBOS", phi: 38 },
    { id: "cua2", cat: "puntualidad", palabra: "RETRASOS", phi: 54 },
    { id: "ind", cat: "saturacion", palabra: "SATURADO", phi: 33 },
  ];

  let seedCounter = 12345; // Fixed seed for consistency

  METRO_LINES.forEach((line) => {
    line.stations.forEach((station) => {
      const problem = problems.find((p) => p.id === station.id) || {
        cat: "limpieza",
        palabra: "SUCIO",
        phi: 50,
      };

      const cat = CATEGORIES.find((c) => c.id === problem.cat);

      seedCounter++;
      const comments = Math.floor(seededRandom(seedCounter) * 800) + 100;
      seedCounter++;
      const positive = Math.floor(seededRandom(seedCounter) * 30) + 10;
      seedCounter++;
      const negative = Math.floor(seededRandom(seedCounter) * 40) + 30;
      seedCounter++;
      const alerts =
        problem.phi < 40 ? Math.floor(seededRandom(seedCounter) * 3) + 1 : 0;
      seedCounter++;
      const menciones = Math.floor(seededRandom(seedCounter) * 150) + 50;
      seedCounter++;
      const tendencia = seededRandom(seedCounter) > 0.5 ? "up" : "down";

      data[station.id] = {
        phi: problem.phi,
        comments,
        positive,
        negative,
        alerts,
        topIssue: cat?.name || "Limpieza",
        palabraClave: problem.palabra,
        categoria: problem.cat,
        menciones,
        tendencia,
        ejemplos: FRASES_EJEMPLO[problem.palabra] || ["Comentario de ejemplo"],
      };
    });
  });

  return data;
};

export const calculateGlobalPHI = (stationData: StationDataMap): number => {
  const values = Object.values(stationData);
  if (values.length === 0) return 0;

  const sum = values.reduce((acc, station) => acc + station.phi, 0);
  return Math.round(sum / values.length);
};
