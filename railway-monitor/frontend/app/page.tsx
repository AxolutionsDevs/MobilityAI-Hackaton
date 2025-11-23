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

            <>
              {/* Sección de Recomendaciones Inteligentes */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 shadow-sm">
                {(() => {
                  // 1. Lógica para encontrar la categoría con mayor porcentaje de incidentes
                  const maxPercentage = Math.max(...categoryPercentages);
                  const maxIndex = categoryPercentages.indexOf(maxPercentage);
                  const topCategory = CATEGORIES[maxIndex];
                  {/* Sección de Recomendaciones Inteligentes */ }
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

                      // CORRECCIÓN AQUÍ: Definimos explícitamente el tipo Record<string, ...>
                      // Esto permite que 'topCategory.id' pueda usarse como índice sin errores.
                      const RECOMMENDATIONS: Record<string, { title: string; text: string }> = {
                        security: {
                          title: "Reforzar la Seguridad",
                          text: "Se detectó un alto índice de incidentes de seguridad. Se recomienda aumentar la vigilancia, revisar cámaras y mejorar la iluminación en zonas críticas."
                        },
                        punctuality: {
                          title: "Optimización de Tiempos",
                          text: "La puntualidad es el mayor problema actual. Se sugiere revisar la planificación de rutas, tiempos de despacho y posibles cuellos de botella."
                        },
                        cleanliness: {
                          title: "Protocolo de Limpieza",
                          text: "Los reportes indican problemas de higiene. Se recomienda incrementar la frecuencia de limpieza y auditar el estado de las unidades."
                        },
                        comfort: {
                          title: "Mejora de Confort",
                          text: "Los usuarios reportan incomodidad. Revisar el estado de los asientos, aire acondicionado y ergonomía general."
                        },
                        communication: {
                          title: "Canales de Comunicación",
                          text: "Fallas en la comunicación detectadas. Es necesario capacitar al personal en atención al cliente y verificar canales."
                        },
                        default: {
                          title: "Análisis General Requerido",
                          text: "Se recomienda realizar una auditoría general para identificar puntos de mejora específicos."
                        }
                      };

                      // Ahora TypeScript aceptará cualquier string o 'any' como índice
                      const currentRec = RECOMMENDATIONS[topCategory.id] || RECOMMENDATIONS.default;

                      return (
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <topCategory.icon
                                className="w-5 h-5"
                                style={{ color: topCategory.color }}
                              />
                            </div>
                            <span>Recomendación Prioritaria: {getCategoryName(topCategory.id)}</span>
                          </h3>

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
                              <div className="flex flex-col items-center justify-center bg-white px-3 py-2 rounded-lg border border-gray-100 shadow-sm">
                                <span className="text-lg font-bold" style={{ color: topCategory.color }}>
                                  {maxPercentage}%
                                </span>
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Crítico</span>
                              </div>
                            </div>
                          </div>

                          <button className="w-full py-2 text-xs font-medium text-purple-700 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                            Ver detalles de {getCategoryName(topCategory.id)}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                  // 2. Diccionario de recomendaciones según la categoría (puedes editar los textos aquí)
                  const RECOMMENDATIONS = {
                    security: {
                      title: "Reforzar la Seguridad",
                      text: "Se detectó un alto índice de incidentes de seguridad. Se recomienda aumentar la vigilancia, revisar cámaras y mejorar la iluminación en zonas críticas."
                    },
                    punctuality: {
                      title: "Optimización de Tiempos",
                      text: "La puntualidad es el mayor problema actual. Se sugiere revisar la planificación de rutas, tiempos de despacho y posibles cuellos de botella en la operación."
                    },
                    cleanliness: {
                      title: "Protocolo de Limpieza",
                      text: "Los reportes indican problemas de higiene. Se recomienda incrementar la frecuencia de limpieza y auditar el estado de las unidades o instalaciones."
                    },
                    comfort: {
                      title: "Mejora de Confort",
                      text: "Los usuarios reportan incomodidad. Revisar el estado de los asientos, aire acondicionado y ergonomía general del servicio."
                    },
                    communication: {
                      title: "Canales de Comunicación",
                      text: "Fallas en la comunicación detectadas. Es necesario capacitar al personal en atención al cliente y verificar los canales de reporte."
                    },
                    // Fallback por defecto si el ID no coincide
                    default: {
                      title: "Análisis General Requerido",
                      text: "Se recomienda realizar una auditoría general para identificar puntos de mejora específicos."
                    }
                  };

                  // 3. Obtener la recomendación actual basada en el ID de la categoría top
                  // Asegúrate de que tus CATEGORIES tengan ids como 'security', 'punctuality', etc.
                  // Si usan otros IDs, ajusta las claves del objeto RECOMMENDATIONS arriba.
                  const currentRec = RECOMMENDATIONS[topCategory?.id] || RECOMMENDATIONS.default;

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
