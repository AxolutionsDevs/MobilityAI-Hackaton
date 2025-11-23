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
  const [availableMaps, setAvailableMaps] = useState<{ id: string; label: string }[]>([]);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [activeView, setActiveView] = useState<
    "heatmap" | "import" | "indicators" | "comparison" | "trends" | "phi"
  >("heatmap");
  const [selectedLine, setSelectedLine] = useState("all");
  const [heatmapIntensity, setHeatmapIntensity] = useState(0.8);
  const [displayMap, setDisplayMap] = useState<string>("");

  // Mantener el selector sincronizado con el idioma: sólo cambiar el mapa
  // si el mapa de la ciudad ya está disponible (evita mostrar CDMX/Vienna por defecto)
  useEffect(() => {
    if (availableMaps.find((m) => m.id === city)) {
      setDisplayMap(city);
    }
  }, [city, availableMaps]);

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

    // Si la línea pertenece a una ciudad completa (cdmx/vienna), registrar el mapa completo
    if (lineData.city === "cdmx" || lineData.city === "vienna") {
      const mapId = lineData.city;
      const mapLabel = lineData.city === "cdmx" ? "CDMX" : "Vienna";
      setAvailableMaps((prev) => {
        if (prev.find((m) => m.id === mapId)) return prev;
        return [...prev, { id: mapId, label: mapLabel }];
      });

      // Seleccionar automáticamente el mapa de la ciudad cuando se importa por primera vez
      setDisplayMap(mapId);
      return;
    }

    // Para mapas personalizados (sin city), agregar una opción individual
    if (!lineData.city) {
      setAvailableMaps((prev) => {
        if (prev.find((m) => m.id === lineData.id)) return prev;
        return [...prev, { id: lineData.id, label: lineData.name }];
      });
      setDisplayMap(lineData.id);
    }
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
      { id: "trends", label: translations.trends, icon: Activity },
      { id: "phi", label: translations.globalPHITitle, icon: Activity },
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
                    <select
                      value={displayMap}
                      onChange={(e) => setDisplayMap(e.target.value)}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-400 text-gray-900 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <option value="">{translations.selectMap || "Seleccione mapa"}</option>
                      {availableMaps.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                      {customLines
                        .filter((l) => !l.city)
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
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
                  onNavigateToImport={() => setActiveView("import")}
                  displayMap={displayMap}
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

            <>
              {/* Sección de Recomendaciones Inteligentes */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 shadow-sm">
                {(() => {
                  // Guardia de seguridad para carga inicial
                  if (!categoryPercentages || !categoryPercentages.length) {
                    return <div className="animate-pulse h-24 bg-purple-50/50 rounded-xl"></div>;
                  }

                  const maxPercentage = Math.max(...categoryPercentages);
                  const maxIndex = categoryPercentages.indexOf(maxPercentage);
                  const topCategory = CATEGORIES[maxIndex];

                  if (!topCategory) return null;

                  const RECOMMENDATIONS: Record<string, { title: string; text: string }> = {
                    seguridad: {
                      title: "Reforzar la Seguridad",
                      text: "Se detectó un alto índice de incidentes de seguridad. Se recomienda aumentar la vigilancia, revisar cámaras y mejorar la iluminación en zonas críticas."
                    },
                    puntualidad: {
                      title: "Optimización de Tiempos",
                      text: "La puntualidad es el mayor problema actual. Se sugiere revisar la planificación de rutas, tiempos de despacho y posibles cuellos de botella."
                    },
                    limpieza: {
                      title: "Protocolo de Limpieza",
                      text: "Los reportes indican problemas de higiene. Se recomienda incrementar la frecuencia de limpieza y auditar el estado de las unidades."
                    },
                    comodidad: {
                      title: "Mejora de Confort",
                      text: "Los usuarios reportan incomodidad. Revisar el estado de los asientos, aire acondicionado y ergonomía general."
                    },
                    comunicacion: {
                      title: "Canales de Comunicación",
                      text: "Fallas en la comunicación detectadas. Es necesario capacitar al personal en atención al cliente y verificar canales."
                    },
                    fallas: {
                      title: "Mantenimiento Técnico",
                      text: "Se detectaron fallas técnicas. Se recomienda revisar el estado de equipos y realizar mantenimiento preventivo."
                    },
                    saturacion: {
                      title: "Control de Afluencia",
                      text: "Alta saturación detectada. Se sugiere optimizar horarios y aumentar la capacidad en horas pico."
                    },
                    default: {
                      title: "Análisis General Requerido",
                      text: "Se recomienda realizar una auditoría general para identificar puntos de mejora específicos."
                    }
                  };

                  const currentRec = RECOMMENDATIONS[topCategory.id] || RECOMMENDATIONS.default;

                  return (
                    <div className="space-y-4">
                      {/* Encabezado */}
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <topCategory.icon
                            className="w-5 h-5"
                            style={{ color: topCategory.color }}
                          />
                        </div>
                        <span>Recomendación Prioritaria: {getCategoryName(topCategory.id)}</span>
                      </h3>

                      {/* Tarjeta de Acción */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-purple-100">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-800 mb-1">
                              {currentRec.title}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {currentRec.text}
                            </p>
                          </div>
                          {/* Indicador de porcentaje circular pequeño */}
                          <div className="flex flex-col items-center justify-center bg-white px-3 py-2 rounded-lg border border-gray-100 shadow-sm">
                            <span className="text-lg font-bold" style={{ color: topCategory.color }}>
                              {maxPercentage}%
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Crítico</span>
                          </div>
                        </div>
                      </div>

                      {/* Botón de acción sugerido (Opcional) */}
                      <button className="w-full py-2 text-xs font-medium text-purple-700 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                        Ver detalles de {getCategoryName(topCategory.id)}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </>
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
