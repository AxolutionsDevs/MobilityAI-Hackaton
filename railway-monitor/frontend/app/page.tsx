"use client";

import MetroMap from "@/components/MetroMap";
import GlobalPHI from "@/components/sections/GlobalPHI";
import Header from "@/components/sections/Header";
import StationInfo from "@/components/sections/StationInfo";
import SVGImporter from "@/components/SVGImporter";
import TrendsDashboard from "@/components/trends/TrendsDashboard";
import { CityProvider, useCity } from "@/lib/CityContext";
import { CATEGORIES } from "@/lib/constants";
import { calculateGlobalPHI, generateStationPHI } from "@/lib/utils";
import { Comment, CustomLine } from "@/types";
import {
  Activity,
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

function DashboardContent() {
  const { city, translations } = useCity();
  const [stationData] = useState(generateStationPHI);
  const [customLines, setCustomLines] = useState<CustomLine[]>([]);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [activeView, setActiveView] = useState<
    "heatmap" | "import" | "indicators" | "predictive" | "comparison" | "trends"
  >("heatmap");
  const [selectedLine, setSelectedLine] = useState("all");
  const [heatmapIntensity, setHeatmapIntensity] = useState(0.8);

  const globalPHI = useMemo(
    () => calculateGlobalPHI(stationData),
    [stationData]
  );

  const sampleComments: Comment[] = useMemo(() => {
    if (city === "cdmx") {
      return [
        { text: "El metro llegó 15 minutos tarde", sentiment: "negative" },
        { text: "Excelente servicio, muy limpio", sentiment: "positive" },
        { text: "Me robaron el celular en hora pico", sentiment: "negative" },
        { text: "Buen servicio hoy", sentiment: "positive" },
        { text: "Regular como siempre", sentiment: "neutral" },
      ];
    } else {
      return [
        { text: "Die U-Bahn kam 15 Minuten zu spät", sentiment: "negative" },
        { text: "Ausgezeichneter Service, sehr sauber", sentiment: "positive" },
        {
          text: "Mein Handy wurde zur Hauptverkehrszeit gestohlen",
          sentiment: "negative",
        },
        { text: "Heute guter Service", sentiment: "positive" },
        { text: "Wie immer durchschnittlich", sentiment: "neutral" },
      ];
    }
  }, [city]);

  const kpiData = useMemo(
    () => [
      {
        icon: Globe,
        label: translations.globalPHI,
        value: globalPHI,
        sub: "+2.3%",
      },
      {
        icon: ThumbsUp,
        label: translations.positives,
        value: "35%",
        sub: `4,521 ${translations.comments}`,
      },
      {
        icon: AlertTriangle,
        label: translations.alerts,
        value: "12",
        sub: `3 ${translations.critical}`,
      },
      {
        icon: Zap,
        label: translations.response,
        value: "2.4h",
        sub: translations.average,
      },
    ],
    [translations, globalPHI]
  );

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

  // Helper to get translated category name
  const getCategoryName = (categoryId: string): string => {
    const categoryMap: Record<string, string> = {
      seguridad: translations.categorySeguridad,
      puntualidad: translations.categoryPuntualidad,
      limpieza: translations.categoryLimpieza,
      comodidad: translations.categoryComodidad,
      comunicacion: translations.categoryComunicacion,
      fallas: translations.categoryFallas,
      saturacion: translations.categorySaturacion,
    };
    return categoryMap[categoryId] || categoryId;
  };

  // Radar chart data for category comparison
  const radarData = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        category: getCategoryName(cat.id),
        mexico: Math.floor(Math.random() * 40 + 50),
        austria: Math.floor(Math.random() * 30 + 65),
      })),
    [translations]
  );

  // Area chart data for trends
  const trendData = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        day: [
          translations.monday,
          translations.tuesday,
          translations.wednesday,
          translations.thursday,
          translations.friday,
          translations.saturday,
          translations.sunday,
        ][i],
        seguridad: Math.floor(Math.random() * 20 + 60),
        puntualidad: Math.floor(Math.random() * 20 + 65),
        limpieza: Math.floor(Math.random() * 20 + 70),
      })),
    [translations]
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

  const tabs = useMemo(
    () => [
      { id: "heatmap", label: translations.heatmap, icon: Map },
      { id: "import", label: translations.importSVG, icon: Upload },
      { id: "indicators", label: translations.indicators, icon: BarChart3 },
      { id: "predictive", label: translations.predictive, icon: TrendingUp },
      { id: "comparison", label: translations.comparison, icon: Globe },
      { id: "trends", label: "Tendencias", icon: Activity },
    ],
    [translations]
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 p-5">
      <div className="max-w-7xl mx-auto space-y-4">
        <Header />

        {/* Navigation Tabs */}
        <div className="flex gap-4 p-4 rounded-2xl bg-gray-200 backdrop-blur-sm border border-gray-400">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl transition-all ${
                activeView === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-300 text-gray-800 hover:bg-gray-400 hover:text-gray-900"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-sm font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Dynamic Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeView === "heatmap" && (
              <div className="p-6 rounded-2xl bg-gray-200 backdrop-blur-sm border border-gray-400">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-3 text-gray-900">
                    <Map className="w-5 h-5 text-blue-600" />
                    {translations.heatmapTitle}
                  </h3>
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedLine}
                      onChange={(e) => setSelectedLine(e.target.value)}
                      className="px-4 py-2 rounded-lg bg-gray-300 text-sm border border-gray-400 text-gray-900"
                    >
                      <option value="all">{translations.allLines}</option>
                      <option value="L1">{translations.line} 1</option>
                      <option value="L2">{translations.line} 2</option>
                      <option value="L3">{translations.line} 3</option>
                    </select>
                    <label className="flex items-center gap-3 text-sm text-gray-900">
                      <span>{translations.intensity}:</span>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={heatmapIntensity}
                        onChange={(e) =>
                          setHeatmapIntensity(parseFloat(e.target.value))
                        }
                        className="w-32"
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
            )}

            {activeView === "import" && (
              <SVGImporter onSave={handleSaveCustomLine} />
            )}

            {activeView === "indicators" && (
              <div className="p-6 rounded-2xl bg-gray-200 backdrop-blur-sm border border-gray-400">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-3 text-gray-900">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  {translations.weeklyTrends}
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
                          stopColor="#dc2626"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#dc2626"
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
                          stopColor="#ea580c"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ea580c"
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
                          stopColor="#16a34a"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#16a34a"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="seguridad"
                      stroke="#dc2626"
                      fillOpacity={1}
                      fill="url(#colorSeguridad)"
                      name={translations.security}
                    />
                    <Area
                      type="monotone"
                      dataKey="puntualidad"
                      stroke="#ea580c"
                      fillOpacity={1}
                      fill="url(#colorPuntualidad)"
                      name={translations.punctuality}
                    />
                    <Area
                      type="monotone"
                      dataKey="limpieza"
                      stroke="#16a34a"
                      fillOpacity={1}
                      fill="url(#colorLimpieza)"
                      name={translations.cleanliness}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeView === "predictive" && (
              <div className="p-6 rounded-2xl bg-gray-100 border border-gray-300">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  {translations.predictiveTitle}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictiveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                    <XAxis dataKey="hour" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #d1d5db",
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
                      name={translations.projectedConflicts}
                    />
                    <Line
                      type="monotone"
                      dataKey="riesgo"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ fill: "#f59e0b", r: 4 }}
                      name={translations.riskLevel}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 rounded-xl bg-red-100 border border-red-300">
                  <h4 className="text-sm font-semibold text-red-600 mb-2">
                    {translations.aiRecommendations}
                  </h4>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>{translations.recommendation1}</li>
                    <li>{translations.recommendation2}</li>
                    <li>{translations.recommendation3}</li>
                  </ul>
                </div>
              </div>
            )}

            {activeView === "comparison" && (
              <div className="p-6 rounded-2xl bg-gray-100 border border-gray-300">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                  <Globe className="w-5 h-5 text-blue-600" />
                  {translations.internationalComparison}
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#d1d5db" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name={translations.metroCDMX}
                      dataKey="mexico"
                      stroke="#e91e8b"
                      fill="#e91e8b"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name={translations.metroVienna}
                      dataKey="austria"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded-xl bg-pink-100 border border-pink-300">
                    <div className="text-xs text-gray-600 mb-1">
                      🇲🇽 {translations.metroCDMX}
                    </div>
                    <div className="text-2xl font-bold text-pink-600">
                      {globalPHI}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {translations.globalAveragePHI}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-green-100 border border-green-300">
                    <div className="text-xs text-gray-600 mb-1">
                      🇦🇹 {translations.metroVienna}
                    </div>
                    <div className="text-2xl font-bold text-green-600">84</div>
                    <div className="text-[10px] text-gray-500">
                      {translations.globalAveragePHI}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === "trends" && <TrendsDashboard />}
          </div>

          {/* Right Column - Analytics */}
          <div className="space-y-6">
            {selectedStation && <StationInfo station={selectedStation} />}

            <GlobalPHI globalPHI={globalPHI} />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-[10px] text-white/40 pt-3 border-t border-white/10">
          {translations.footer}
        </footer>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <CityProvider>
      <DashboardContent />
    </CityProvider>
  );
}
