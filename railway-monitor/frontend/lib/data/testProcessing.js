// Script de prueba para verificar el procesamiento de datos
const fs = require("fs");
const path = require("path");

// Leer el archivo de complaints de Vienna
const complaintsPath = path.join(__dirname, "complaints_vienna.json");
const complaints = JSON.parse(fs.readFileSync(complaintsPath, "utf-8"));

console.log("=== DATOS DE VIENNA ===");
console.log("Total de quejas:", complaints.length);

// Contar estaciones únicas
const stations = new Set();
complaints.forEach((c) => {
  stations.add(c.NombredeEstacion);
});

console.log("Total de estaciones únicas:", stations.size);
console.log("\nPrimeras 10 estaciones:");
Array.from(stations)
  .slice(0, 10)
  .forEach((s) => console.log("  -", s));

// Contar quejas por estación
const stationCounts = {};
complaints.forEach((c) => {
  const station = c.NombredeEstacion;
  stationCounts[station] = (stationCounts[station] || 0) + 1;
});

console.log("\nTop 10 estaciones con más quejas:");
Object.entries(stationCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([station, count]) => {
    console.log(`  - ${station}: ${count} quejas`);
  });

// Ver categorías únicas
const categories = new Set();
complaints.forEach((c) => {
  categories.add(c.Asunto);
});

console.log("\nCategorías únicas:", categories.size);
console.log("Categorías:");
Array.from(categories).forEach((c) => console.log("  -", c));
