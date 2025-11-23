"use client";

import MetroMap from "@/components/MetroMap";
import ComparisonView from "@/components/comparison/ComparisonView";
import Header from "@/components/sections/Header";
import PHIComparison from "@/components/sections/PHIComparison";
import StationInfo from "@/components/sections/StationInfo";
import SVGImporter from "@/components/SVGImporter";
import TrendsDashboard from "@/components/trends/TrendsDashboard";
import { CityProvider, useCity } from "@/lib/CityContext";
import { CATEGORIES } from "@/lib/constants";
import { generateStationPHI } from "@/lib/utils";
import { Comment, CustomLine } from "@/types";
import {
  Activity,
  AlertTriangle,
  Globe,
  Map,
  ThumbsUp,
  Upload,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function DashboardContent() {
  const { city, translations } = useCity();
  const [stationData] = useState(generateStationPHI);
  const [customLines, setCustomLines] = useState<CustomLine[]>([]);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [activeView, setActiveView] = useState<
    "heatmap" | "import" | "indicators" | "comparison" | "trends" | "phi"
  >("heatmap");
  const [selectedLine, setSelectedLine] = useState("all");
  const [heatmapIntensity, setHeatmapIntensity] = useState(0.8);

  // Establecer estación por defecto solo si hay líneas personalizadas cargadas
  useEffect(() => {
    if (customLines.length > 0 && !selectedStation) {
      const firstLine = customLines[0];
      if (firstLine.stations.length > 0) {
        const firstStation = firstLine.stations[0];
        setSelectedStation({
          ...firstStation,
          line: firstLine.name,
          lineColor: firstLine.color,
        });
      }
    }
  }, [customLines]);

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
    [translations]
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
  const [trendData, setTrendData] = useState<any[]>([]);
  const [categoryPercentages, setCategoryPercentages] = useState<number[]>([]);

  useEffect(() => {
    // Initialize trend data
    setTrendData(
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
      }))
    );

    // Initialize category percentages for dashboard
    setCategoryPercentages(
      CATEGORIES.map(() => Math.floor(Math.random() * 30 + 10))
    );
  }, [translations]);

  const tabs = useMemo(
    () => [
      { id: "heatmap", label: translations.heatmap, icon: Map },
      { id: "import", label: translations.importSVG, icon: Upload },
      { id: "comparison", label: translations.comparison, icon: Globe },
      { id: "trends", label: "Tendencias", icon: Activity },
      { id: "phi", label: "PHI Global", icon: Activity },
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
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl transition-all ${activeView === tab.id
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
                  onNavigateToImport={() => setActiveView("import")}
                />
              </div>
            )}

            {activeView === "import" && (
              <SVGImporter onSave={handleSaveCustomLine} />
            )}

            {activeView === "comparison" && <ComparisonView />}

            {activeView === "trends" && <TrendsDashboard />}

            {activeView === "phi" && <PHIComparison />}
          </div>

          {/* Right Column - Analytics */}
          <div className="space-y-6">
            <StationInfo station={selectedStation} />

            {!selectedStation && (
              <>
                {/* Categorías de incidentes */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-purple-600" />
                    Categorías Principales
                  </h3>
                  <div className="space-y-3">
                    {CATEGORIES.slice(0, 5).map((category, idx) => (
                      <div key={category.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <category.icon
                              className="w-3 h-3"
                              style={{ color: category.color }}
                            />
                            <span className="text-xs text-gray-700 font-medium">
                              {category.name}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-gray-900">
                            {categoryPercentages[idx] || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${categoryPercentages[idx] || 0}%`,
                              backgroundColor: category.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
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
