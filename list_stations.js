const data = require("./railway-monitor/frontend/lib/data/estacionesvienna.json");
const valid = data.filter((s) => !s.nombre.startsWith("Estacion_"));
console.log("Total estaciones válidas:", valid.length);
console.log("\n=== NOMBRES DE TODAS LAS ESTACIONES ===\n");
valid.forEach((s, i) => {
  console.log(`${i + 1}. "${s.nombre}"`);
});
