"use client";

import MetroMap from "@/components/MetroMap";
import CategoryWeights from "@/components/sections/CategoryWeights";
import GlobalPHI from "@/components/sections/GlobalPHI";
import Header from "@/components/sections/Header";
import LiveFeed from "@/components/sections/LiveFeed";
import StationInfo from "@/components/sections/StationInfo";
import SVGImporter from "@/components/SVGImporter";
import KPICard from "@/components/ui/KPICard";
import { CATEGORIES } from "@/lib/constants";
import { calculateGlobalPHI, generateStationPHI } from "@/lib/utils";
import { Comment, CustomLine } from "@/types";
import {
  AlertTriangle,
  BarChart3,
  Globe,
  Map,
  ThumbsUp,
  TrendingUp,
  Upload,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Dashboard() {
  const [stationData] = useState(generateStationPHI);
  const [customLines, setCustomLines] = useState<CustomLine[]>([]);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [activeView, setActiveView] = useState<
    "heatmap" | "import" | "indicators" | "predictive" | "comparison"
  >("heatmap");
  const [selectedLine, setSelectedLine] = useState("all");
  const [heatmapIntensity, setHeatmapIntensity] = useState(1.5);

  const globalPHI = useMemo(
    () => calculateGlobalPHI(stationData),
    [stationData]
  );

  const sampleComments: Comment[] = [
    { text: "El metro llegó 15 minutos tarde", sentiment: "negative" },
    { text: "Excelente servicio, muy limpio", sentiment: "positive" },
    { text: "Me robaron el celular en hora pico", sentiment: "negative" },
    { text: "Buen servicio hoy", sentiment: "positive" },
    { text: "Regular como siempre", sentiment: "neutral" },
  ];

  const kpiData = [
    { icon: Globe, label: "PHI Global", value: globalPHI, sub: "+2.3%" },
    {
      icon: ThumbsUp,
      label: "Positivos",
      value: "35%",
      sub: "4,521 comentarios",
    },
    { icon: AlertTriangle, label: "Alertas", value: "12", sub: "3 críticas" },
    { icon: Zap, label: "Respuesta", value: "2.4h", sub: "Promedio" },
  ];

  const handleSaveCustomLine = (lineData: CustomLine) => {
    setCustomLines((prev) => [...prev, lineData]);
  };

  const handleUpdateCustomLine = (lineId: string, updatedStations: any[]) => {
    setCustomLines((prev) =>
      prev.map((line) =>
        line.id === lineId ? { ...line, stations: updatedStations } : line
      )
    );
  };

  // Radar chart data for category comparison
  const radarData = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        category: cat.name,
        mexico: Math.floor(Math.random() * 40 + 50),
        austria: Math.floor(Math.random() * 30 + 65),
      })),
    []
  );

  // Area chart data for trends
  const trendData = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        day: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i],
        seguridad: Math.floor(Math.random() * 20 + 60),
        puntualidad: Math.floor(Math.random() * 20 + 65),
        limpieza: Math.floor(Math.random() * 20 + 70),
      })),
    []
  );

  // Predictive data
  const predictiveData = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        conflictos: Math.floor(
          Math.random() * 30 + (i > 7 && i < 20 ? 40 : 10)
        ),
        riesgo: Math.floor(Math.random() * 20 + (i > 7 && i < 20 ? 50 : 20)),
      })),
    []
  );

  const tabs = [
    { id: "heatmap", label: "Mapa de Calor", icon: Map },
    { id: "import", label: "Importar SVG", icon: Upload },
    { id: "indicators", label: "Indicadores", icon: BarChart3 },
    { id: "predictive", label: "Predictivo", icon: TrendingUp },
    { id: "comparison", label: "Comparación", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-5">
      <div className="max-w-7xl mx-auto space-y-4">
        <Header />

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-3">
          {kpiData.map((kpi, i) => (
            <KPICard key={i} data={kpi} />
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-2 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
                activeView === tab.id
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Dynamic Content */}
          <div className="lg:col-span-2 space-y-4">
            {activeView === "heatmap" && (
              <>
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Map className="w-4 h-4" />
                      Mapa de Calor PHI
                    </h3>
                    <div className="flex items-center gap-3">
                      <select
                        value={selectedLine}
                        onChange={(e) => setSelectedLine(e.target.value)}
                        className="px-3 py-1 rounded-lg bg-white/10 text-sm border border-white/20"
                      >
                        <option value="all">Todas las líneas</option>
                        <option value="L1">Línea 1</option>
                        <option value="L2">Línea 2</option>
                        <option value="L3">Línea 3</option>
                      </select>
                      <label className="flex items-center gap-2 text-xs">
                        <span>Intensidad:</span>
                        <input
                          type="range"
                          min="0.5"
                          max="3"
                          step="0.1"
                          value={heatmapIntensity}
                          onChange={(e) =>
                            setHeatmapIntensity(parseFloat(e.target.value))
                          }
                          className="w-24"
                        />
                        <span>{heatmapIntensity.toFixed(1)}</span>
                      </label>
                    </div>
                  </div>
                  <MetroMap
                    stationData={stationData}
                    selectedStation={selectedStation}
                    onSelectStation={setSelectedStation}
                    selectedLine={selectedLine}
                    heatmapIntensity={heatmapIntensity}
                    customLines={customLines}
                    onUpdateCustomLine={handleUpdateCustomLine}
                  />
                </div>
              </>
            )}

            {activeView === "import" && (
              <>
                <SVGImporter onSave={handleSaveCustomLine} />

                {/* Custom Lines Display */}
                {customLines.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <h3 className="text-sm font-semibold mb-3">
                      🚇 Líneas Importadas
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {customLines.map((line) => (
                        <div
                          key={line.id}
                          className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                            style={{ backgroundColor: line.color }}
                          >
                            {line.id.split("-")[2]?.substring(0, 2) || "C"}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {line.name}
                            </div>
                            <div className="text-[10px] text-white/50">
                              {line.stations.length} estaciones
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                            Activa
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeView === "indicators" && (
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Tendencias Semanales
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient
                        id="colorSeguridad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorPuntualidad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f59e0b"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f59e0b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorLimpieza"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="day" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e1b4b",
                        border: "1px solid #ffffff20",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="seguridad"
                      stroke="#ef4444"
                      fillOpacity={1}
                      fill="url(#colorSeguridad)"
                      name="Seguridad"
                    />
                    <Area
                      type="monotone"
                      dataKey="puntualidad"
                      stroke="#f59e0b"
                      fillOpacity={1}
                      fill="url(#colorPuntualidad)"
                      name="Puntualidad"
                    />
                    <Area
                      type="monotone"
                      dataKey="limpieza"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorLimpieza)"
                      name="Limpieza"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeView === "predictive" && (
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Análisis Predictivo de Conflictos (24h)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictiveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="hour" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e1b4b",
                        border: "1px solid #ffffff20",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="conflictos"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: "#ef4444", r: 4 }}
                      name="Conflictos Proyectados"
                    />
                    <Line
                      type="monotone"
                      dataKey="riesgo"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: "#f59e0b", r: 4 }}
                      name="Nivel de Riesgo"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <h4 className="text-sm font-semibold text-red-400 mb-2">
                    🔴 Recomendaciones de IA
                  </h4>
                  <ul className="text-xs text-white/70 space-y-1">
                    <li>• Reforzar vigilancia en hora pico (17:00 - 20:00)</li>
                    <li>
                      • Aumentar frecuencia de trenes en Línea 1 durante mañana
                    </li>
                    <li>• Revisar iluminación en estaciones con bajo PHI</li>
                  </ul>
                </div>
              </div>
            )}

            {activeView === "comparison" && (
              <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Comparación Internacional
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#ffffff20" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fill: "#ffffff", fontSize: 11 }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Metro CDMX"
                      dataKey="mexico"
                      stroke="#e91e8b"
                      fill="#e91e8b"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Metro Viena"
                      dataKey="austria"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e1b4b",
                        border: "1px solid #ffffff20",
                        borderRadius: "8px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/30">
                    <div className="text-xs text-white/60 mb-1">
                      🇲🇽 Metro CDMX
                    </div>
                    <div className="text-2xl font-bold text-pink-400">
                      {globalPHI}
                    </div>
                    <div className="text-[10px] text-white/50">
                      PHI Promedio Global
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="text-xs text-white/60 mb-1">
                      🇦🇹 Metro Viena
                    </div>
                    <div className="text-2xl font-bold text-green-400">84</div>
                    <div className="text-[10px] text-white/50">
                      PHI Promedio Global
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Analytics */}
          <div className="space-y-4">
            <GlobalPHI globalPHI={globalPHI} />

            {selectedStation && <StationInfo station={selectedStation} />}

            <CategoryWeights />

            <LiveFeed comments={sampleComments} />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-[10px] text-white/40 pt-3 border-t border-white/10">
          Dashboard PHI v3.0 • Análisis Predictivo • Comparación Internacional •
          NLP en tiempo real
        </footer>
      </div>
    </div>
  );
}
