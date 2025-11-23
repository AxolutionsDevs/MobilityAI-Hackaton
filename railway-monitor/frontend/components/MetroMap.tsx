"use client";

import { useCity } from "@/lib/CityContext";
import { METRO_LINES, STATION_REPORT_DATA } from "@/lib/constants";
import { CustomLine, StationData } from "@/types";
import React, { useState } from "react";

interface MetroMapProps {
  stationData: { [key: string]: StationData };
  selectedStation: any;
  onSelectStation: (station: any) => void;
  selectedLine: string;
  heatmapIntensity: number;
  customLines?: CustomLine[];
  onUpdateCustomLine?: (lineId: string, updatedStations: any[]) => void;
  onNavigateToImport?: () => void;
}

const MetroMap: React.FC<MetroMapProps> = ({
  stationData,
  selectedStation,
  onSelectStation,
  selectedLine,
  heatmapIntensity,
  customLines = [],
  onUpdateCustomLine,
  onNavigateToImport,
}) => {
  const { translations } = useCity();

  // ViewBox fijo grande para acomodar cualquier mapa
  const svgViewBox = "0 0 2000 2000";
  const initialZoom = 0.6;
  const initialPan = { x: 0, y: 0 };

  // Función para dividir texto en múltiples líneas
  const wrapText = (text: string, maxCharsPerLine: number = 18) => {
    if (text.length <= maxCharsPerLine) return [text];

    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
        currentLine = (currentLine + " " + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Estados para zoom y pan con valores calculados automáticamente
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState(initialPan);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Calcular color e intensidad del rojo basado en gravedad (0-1)
  const getHeatColor = (severity: number) => {
    // severity: 0 = sin problema (verde), 1 = gravedad máxima (rojo)
    const intensity = Math.min(Math.max(severity, 0), 1);

    let red, green, blue;

    if (intensity < 0.3) {
      // Verde brillante a amarillo-verde (0.0 - 0.3)
      const t = intensity / 0.3;
      red = Math.floor(32 + (245 - 32) * t);
      green = Math.floor(224 + (158 - 224) * t);
      blue = Math.floor(10 * (1 - t));
    } else if (intensity < 0.6) {
      // Amarillo a naranja (0.3 - 0.6)
      const t = (intensity - 0.3) / 0.3;
      red = Math.floor(245 + (239 - 245) * t);
      green = Math.floor(158 - 90 * t);
      blue = 0;
    } else {
      // Naranja a rojo oscuro (0.6 - 1.0)
      const t = (intensity - 0.6) / 0.4;
      red = Math.floor(239 - 100 * t);
      green = Math.floor(68 * (1 - t));
      blue = 0;
    }

    const alpha = 0.3 + 0.7 * intensity;

    return {
      color: `rgba(${red}, ${green}, ${blue}, ${alpha})`,
      strokeColor: `rgb(${red}, ${green}, ${blue})`,
      intensity: intensity,
    };
  };

  const filteredLines =
    selectedLine === "all"
      ? METRO_LINES
      : METRO_LINES.filter((l) => l.id === selectedLine);

  const hasNoLines = METRO_LINES.length === 0 && customLines.length === 0;

  // Manejar zoom con la rueda del mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.5), 5);
    setZoom(newZoom);
  };

  // Manejar scroll cuando el cursor está sobre el mapa
  React.useEffect(() => {
    const containerElement = containerRef.current;

    const handleWheelCapture = (e: WheelEvent) => {
      // Prevenir scroll cuando está sobre el mapa
      if (containerElement && containerElement.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom((prev) => Math.min(Math.max(prev * delta, 0.5), 5));
      }
    };

    // Agregar listener para prevenir scroll y manejar zoom
    document.addEventListener("wheel", handleWheelCapture, {
      passive: false,
      capture: true,
    });

    return () => {
      document.removeEventListener("wheel", handleWheelCapture, true);
    };
  }, []);

  // Manejar pan (arrastrar el mapa)
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      // Calcular nuevo pan
      const newX = e.clientX - panStart.x;
      const newY = e.clientY - panStart.y;

      // Límites de movimiento que se escalan con el zoom
      // Aumentar el límite base y usar una fórmula más generosa
      const basePanLimit = 400;
      // Usar una escala que crece más rápido con el zoom
      const zoomFactor = Math.max(1, zoom * 1.5);
      const maxPanX = basePanLimit * zoomFactor;
      const maxPanY = basePanLimit * zoomFactor;

      // Aplicar límites
      setPan({
        x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Función para resetear zoom y pan con animación suave
  const handleResetView = () => {
    if (isResetting) return; // Evitar múltiples animaciones simultáneas

    setIsResetting(true);
    const startZoom = zoom;
    const startPan = { ...pan };
    const targetZoom = 0.6;
    const targetPan = { x: 0, y: 0 };

    const duration = 500; // 500ms de animación
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Función de easing suave (ease-out-cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // Interpolar zoom y pan
      const newZoom = startZoom + (targetZoom - startZoom) * easeProgress;
      const newPan = {
        x: startPan.x + (targetPan.x - startPan.x) * easeProgress,
        y: startPan.y + (targetPan.y - startPan.y) * easeProgress,
      };

      setZoom(newZoom);
      setPan(newPan);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsResetting(false);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-gray-100 border border-gray-300 rounded-lg p-4 select-none"
      style={{ touchAction: "none", userSelect: "none" }}
      onWheel={handleWheel}
    >
      {/* Mensaje cuando no hay líneas */}
      {hasNoLines && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="bg-white p-8 rounded-2xl border-2 border-gray-300 shadow-xl max-w-md text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              No hay líneas en el mapa
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Comienza importando un archivo SVG o JSON con las líneas del metro
            </p>
            {onNavigateToImport && (
              <button
                onClick={onNavigateToImport}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mx-auto"
              >
                <span className="text-lg">📁</span>
                Ir a Importar el mapa
              </button>
            )}
          </div>
        </div>
      )}

      {/* Botón de reset zoom */}
      {(Math.abs(zoom - 0.6) > 0.01 ||
        Math.abs(pan.x - 0) > 1 ||
        Math.abs(pan.y - 0) > 1) && (
        <button
          onClick={handleResetView}
          className="absolute top-4 right-4 z-30 pointer-events-auto bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-xl transition-all duration-300 flex items-center gap-2 font-bold text-sm border border-blue-400/50 hover:scale-105"
          title="Reiniciar vista"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          Centrar Vista
        </button>
      )}

      <svg
        ref={svgRef}
        viewBox={svgViewBox}
        className="w-full h-auto"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isPanning ? "grabbing" : "grab",
          touchAction: "none",
          minHeight: "800px",
        }}
      >
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          transformOrigin="center"
          style={{
            transition: isResetting ? "none" : "transform 0.1s ease-out",
          }}
        >
          <defs>
            {METRO_LINES.map((line) => (
              <filter
                key={`glow-${line.id}`}
                id={`glow-${line.id}`}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feFlood floodColor={line.color} floodOpacity="0.5" />
                <feComposite in2="blur" operator="in" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
            {/* Gradientes de verde a rojo para transición limpia */}
            {Array.from({ length: 20 }, (_, i) => i / 19).map(
              (intensity, i) => {
                // Transición suave de verde (baja gravedad) a rojo (alta gravedad)
                // 0.0 - 0.3: Verde (#10B981)
                // 0.3 - 0.6: Amarillo/Naranja (#F59E0B)
                // 0.6 - 1.0: Rojo (#EF4444 a #8B0000)

                let red, green, blue;

                if (intensity < 0.3) {
                  // Verde brillante a amarillo-verde (0.0 - 0.3)
                  // Verde más vibrante: rgba(32, 224, 10, 1)
                  const t = intensity / 0.3;
                  red = Math.floor(32 + (245 - 32) * t);
                  green = Math.floor(224 + (158 - 224) * t);
                  blue = Math.floor(10 * (1 - t));
                } else if (intensity < 0.6) {
                  // Amarillo a naranja (0.3 - 0.6)
                  // Amarillo: rgba(245, 180, 0, 1)
                  const t = (intensity - 0.3) / 0.3;
                  red = Math.floor(245 + (239 - 245) * t);
                  green = Math.floor(180 - 112 * t);
                  blue = 0;
                } else {
                  // Naranja a rojo oscuro (0.6 - 1.0)
                  const t = (intensity - 0.6) / 0.4;
                  red = Math.floor(239 - 100 * t);
                  green = Math.floor(68 * (1 - t));
                  blue = 0;
                }

                // Opacidades altas para visibilidad
                const maxOpacity = 0.85 + 0.15 * intensity;

                return (
                  <radialGradient
                    key={`heat-gradient-${i}`}
                    id={`heat-gradient-${i}`}
                    cx="50%"
                    cy="50%"
                    r="50%"
                  >
                    <stop
                      offset="0%"
                      stopColor={`rgb(${red}, ${green}, ${blue})`}
                      stopOpacity={maxOpacity}
                    />
                    <stop
                      offset="25%"
                      stopColor={`rgb(${red}, ${green}, ${blue})`}
                      stopOpacity={maxOpacity * 0.85}
                    />
                    <stop
                      offset="50%"
                      stopColor={`rgb(${red}, ${green}, ${blue})`}
                      stopOpacity={maxOpacity * 0.6}
                    />
                    <stop
                      offset="75%"
                      stopColor={`rgb(${red}, ${green}, ${blue})`}
                      stopOpacity={maxOpacity * 0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor={`rgb(${red}, ${green}, ${blue})`}
                      stopOpacity="0"
                    />
                  </radialGradient>
                );
              }
            )}
            {/* Filtro de blur para hacer el heatmap más suave */}
            <filter
              id="heatmap-blur"
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" />
            </filter>
          </defs>

          {/* Heatmap Layer - Radio basado en reportes, color en gravedad */}
          <g className="heatmap-layer" filter="url(#heatmap-blur)">
            {filteredLines.map((line) =>
              line.stations.map((station) => {
                const reportData = STATION_REPORT_DATA[station.name] || {
                  reportCount: 0,
                  severity: 0.05,
                  recentIssue: "Todo en orden",
                };
                const { reportCount, severity } = reportData;

                // Debug log
                if (station.name === "Ciudad Azteca" || reportCount > 0) {
                  console.log(
                    "Heatmap - Station:",
                    station.name,
                    "Reports:",
                    reportCount,
                    "Severity:",
                    severity
                  );
                }

                // Radio del blur basado en número de reportes (más reportes = blur más grande)
                const baseRadius = 25;
                const maxRadius = 150;
                const normalizedReports =
                  reportCount === 0 ? 0.1 : Math.min(reportCount / 100, 1);
                const heatRadius =
                  baseRadius +
                  (maxRadius - baseRadius) *
                    normalizedReports *
                    heatmapIntensity;

                // Seleccionar gradiente basado en severidad con interpolación continua
                const gradientIndex = Math.floor(severity * 19); // 0-19 para 20 gradientes
                const gradientId = `heat-gradient-${Math.min(
                  gradientIndex,
                  19
                )}`;

                return (
                  <circle
                    key={`heat-${station.id}`}
                    cx={station.x}
                    cy={station.y}
                    r={heatRadius}
                    fill={`url(#${gradientId})`}
                    className="transition-all duration-700 ease-in-out"
                    style={{ mixBlendMode: "screen" }}
                  />
                );
              })
            )}
          </g>

          {/* Custom Heatmap Layer para líneas importadas */}
          <g className="heatmap-layer-custom" filter="url(#heatmap-blur)">
            {customLines.map((line) =>
              line.stations.map((station) => {
                const reportData = STATION_REPORT_DATA[station.name] || {
                  reportCount: 0,
                  severity: 0.05,
                  recentIssue: "Todo en orden",
                };
                const { reportCount, severity } = reportData;

                // Debug log
                if (reportCount > 0) {
                  console.log(
                    "Custom Heatmap - Station:",
                    station.name,
                    "Reports:",
                    reportCount,
                    "Severity:",
                    severity
                  );
                }

                // Radio del blur basado en número de reportes
                const baseRadius = 25;
                const maxRadius = 150;
                const normalizedReports =
                  reportCount === 0 ? 0.1 : Math.min(reportCount / 100, 1);
                const heatRadius =
                  baseRadius +
                  (maxRadius - baseRadius) *
                    normalizedReports *
                    heatmapIntensity;

                // Seleccionar gradiente basado en severidad
                const gradientIndex = Math.floor(severity * 19);
                const gradientId = `heat-gradient-${Math.min(
                  gradientIndex,
                  19
                )}`;

                return (
                  <circle
                    key={`heat-custom-${line.id}-${station.id}`}
                    cx={station.x}
                    cy={station.y}
                    r={heatRadius}
                    fill={`url(#${gradientId})`}
                    className="transition-all duration-700 ease-in-out"
                    style={{ mixBlendMode: "screen" }}
                  />
                );
              })
            )}
          </g>

          {/* Metro Lines */}
          {filteredLines.map((line) => {
            const pathData = line.stations
              .map((s, i) => `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`)
              .join(" ");
            return (
              <g key={line.id}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#glow-${line.id})`}
                  opacity="0.8"
                />
                <path
                  d={pathData}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* Custom Imported Lines */}
          {customLines.map((line) => {
            const pathData = line.stations
              .map((s, i) => `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`)
              .join(" ");
            return (
              <g key={line.id}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.6"
                />
                <path
                  d={pathData}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* Stations */}
          {filteredLines.map((line) =>
            line.stations.map((station) => {
              const data = stationData[station.id];
              const reportData = STATION_REPORT_DATA[station.name] || {
                reportCount: 0,
                severity: 0.05,
                recentIssue: "Todo en orden",
                complaintIndex: 0,
              };
              const { reportCount, severity, complaintIndex } = reportData;
              const { color, strokeColor, intensity } = getHeatColor(severity);
              const isSelected = selectedStation?.id === station.id;
              const hasReports = reportCount > 0;
              const stationKey = `${line.id}-${station.id}`;
              const isHovered = hoveredStation === stationKey;

              return (
                <g
                  key={station.id}
                  className="cursor-pointer"
                  onClick={() =>
                    onSelectStation({
                      ...station,
                      line: line.name,
                      lineColor: line.color,
                      ...data,
                      reportCount,
                      severity,
                    })
                  }
                  onMouseEnter={() => setHoveredStation(stationKey)}
                  onMouseLeave={() => setHoveredStation(null)}
                >
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r={isSelected ? 22 : 18}
                    fill={color}
                    opacity="0.3"
                    className="transition-all duration-300"
                  />
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r={isSelected ? 15 : 11}
                    fill="#ffffff"
                    stroke={
                      isSelected
                        ? "#374151"
                        : hasReports
                        ? strokeColor
                        : line.color
                    }
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-300 hover:r-12"
                  />

                  {hasReports && (
                    <g>
                      <circle
                        cx={station.x + 12}
                        cy={station.y - 12}
                        r="10"
                        fill={strokeColor}
                        className="animate-pulse"
                      />
                      <text
                        x={station.x + 12}
                        y={station.y - 8}
                        textAnchor="middle"
                        className="text-[10px] font-bold fill-white"
                      >
                        ⚠
                      </text>
                    </g>
                  )}

                  {isSelected && (
                    <g>
                      {/* Fondo del popup con tamaño adaptativo */}
                      <rect
                        x={station.x - 100}
                        y={station.y - 95}
                        width="200"
                        height="92"
                        rx="8"
                        fill="rgba(255,255,255,0.98)"
                        stroke={strokeColor}
                        strokeWidth="2.5"
                      />

                      {/* Nombre de la estación */}
                      <text
                        x={station.x}
                        y={station.y - 72}
                        textAnchor="middle"
                        className="text-[11px] fill-gray-900 font-bold"
                      >
                        {station.name}
                      </text>

                      {/* Línea separadora */}
                      <line
                        x1={station.x - 85}
                        y1={station.y - 64}
                        x2={station.x + 85}
                        y2={station.y - 64}
                        stroke="rgba(156,163,175,0.3)"
                        strokeWidth="1"
                      />

                      {/* Reportes y Gravedad en la misma línea */}
                      <text
                        x={station.x - 50}
                        y={station.y - 48}
                        textAnchor="start"
                        className="text-[8px] fill-gray-600"
                      >
                        Reportes: {reportCount}
                      </text>
                      <text
                        x={station.x + 50}
                        y={station.y - 48}
                        textAnchor="end"
                        className="text-[8px] fill-gray-600"
                      >
                        Gravedad: {(severity * 100).toFixed(0)}%
                      </text>

                      {/* Asunto más reciente con texto envuelto */}
                      <text
                        x={station.x}
                        y={station.y - 32}
                        textAnchor="middle"
                        className="text-[8px] fill-orange-400 font-semibold"
                      >
                        Último reporte:
                      </text>

                      {/* Dividir texto largo en múltiples líneas si es necesario */}
                      {(() => {
                        const issue = reportData.recentIssue || "Sin datos";
                        const maxCharsPerLine = 28;

                        if (issue.length <= maxCharsPerLine) {
                          return (
                            <text
                              x={station.x}
                              y={station.y - 18}
                              textAnchor="middle"
                              className="text-[9px] fill-red-400 font-bold"
                            >
                              {issue}
                            </text>
                          );
                        } else {
                          // Dividir en dos líneas
                          const words = issue.split(" ");
                          let line1 = "";
                          let line2 = "";

                          for (const word of words) {
                            if (
                              (line1 + " " + word).trim().length <=
                              maxCharsPerLine
                            ) {
                              line1 = (line1 + " " + word).trim();
                            } else {
                              line2 = (line2 + " " + word).trim();
                            }
                          }

                          return (
                            <>
                              <text
                                x={station.x}
                                y={station.y - 20}
                                textAnchor="middle"
                                className="text-[8px] fill-red-400 font-bold"
                              >
                                {line1}
                              </text>
                              <text
                                x={station.x}
                                y={station.y - 10}
                                textAnchor="middle"
                                className="text-[8px] fill-red-400 font-bold"
                              >
                                {line2}
                              </text>
                            </>
                          );
                        }
                      })()}
                    </g>
                  )}
                </g>
              );
            })
          )}

          {/* Custom Line Stations */}
          {customLines.map((line) =>
            line.stations.map((station, idx) => {
              const stationKey = `custom-${line.id}-${station.id}`;
              const isHovered = hoveredStation === stationKey;

              // Obtener datos reales de quejas
              const reportData = STATION_REPORT_DATA[station.name] || {
                reportCount: 0,
                severity: 0.05,
                recentIssue: "Todo en orden",
                complaintIndex: 0,
              };
              const { reportCount, severity, complaintIndex } = reportData;
              const { color: heatColor, strokeColor } = getHeatColor(severity);
              const hasReports = reportCount > 0;

              return (
                <g
                  key={`custom-${station.id}`}
                  className="cursor-pointer"
                  onClick={() =>
                    onSelectStation({
                      ...station,
                      line: line.name,
                      lineColor: line.color,
                      reportCount,
                      severity,
                    })
                  }
                  onMouseEnter={() => setHoveredStation(stationKey)}
                  onMouseLeave={() => setHoveredStation(null)}
                >
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r={18}
                    fill={hasReports ? heatColor : line.color}
                    opacity="0.3"
                    className="transition-all duration-200"
                  />
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r={12}
                    fill="#ffffff"
                    stroke={hasReports ? strokeColor : line.color}
                    strokeWidth={2}
                    className="transition-all duration-200"
                  />
                </g>
              );
            })
          )}

          {/* Line Labels */}
          {filteredLines.map((line) => (
            <g
              key={`label-${line.id}`}
              transform={`translate(${line.stations[0].x - 30}, ${
                line.stations[0].y - 20
              })`}
            >
              <rect
                x="0"
                y="0"
                width="24"
                height="14"
                rx="3"
                fill={line.color}
              />
              <text
                x="12"
                y="11"
                textAnchor="middle"
                className="text-[8px] fill-white font-bold"
              >
                {line.id}
              </text>
            </g>
          ))}

          {/* Custom Line Labels */}
          {customLines.map((line) => {
            // Extraer el número/letra de la línea del nombre
            // "Metro CDMX Línea 6" → "L6"
            // "Metro CDMX Línea B" → "LB"
            const lineMatch = line.name.match(/Línea\s+([A-Z0-9]+)/i);
            const lineLabel = lineMatch ? `L${lineMatch[1]}` : line.name;
            const lastStation = line.stations[line.stations.length - 1];

            return (
              <React.Fragment key={`label-custom-${line.id}`}>
                {/* Label al inicio de la línea */}
                <g
                  transform={`translate(${line.stations[0].x - 30}, ${
                    line.stations[0].y - 20
                  })`}
                >
                  <rect
                    x="0"
                    y="0"
                    width="24"
                    height="14"
                    rx="3"
                    fill={line.color}
                  />
                  <text
                    x="12"
                    y="11"
                    textAnchor="middle"
                    className="text-[8px] fill-white font-bold"
                  >
                    {lineLabel}
                  </text>
                </g>

                {/* Label al final de la línea */}
                <g
                  transform={`translate(${lastStation.x + 6}, ${
                    lastStation.y - 20
                  })`}
                >
                  <rect
                    x="0"
                    y="0"
                    width="24"
                    height="14"
                    rx="3"
                    fill={line.color}
                  />
                  <text
                    x="12"
                    y="11"
                    textAnchor="middle"
                    className="text-[8px] fill-white font-bold"
                  >
                    {lineLabel}
                  </text>
                </g>
              </React.Fragment>
            );
          })}

          {/* Hover Tooltips Layer - Siempre al frente */}
          <g className="tooltips-layer" style={{ pointerEvents: "none" }}>
            {/* Tooltips for predefined lines */}
            {filteredLines.map((line) =>
              line.stations.map((station) => {
                const stationKey = `${line.id}-${station.id}`;
                const isHovered = hoveredStation === stationKey;
                const isSelected = selectedStation?.id === station.id;

                if (!isHovered || isSelected) return null;

                const reportData = STATION_REPORT_DATA[station.name] || {
                  reportCount: 0,
                  severity: 0.05,
                  recentIssue: "Todo en orden",
                  complaintIndex: 0,
                };
                const { reportCount, severity, complaintIndex } = reportData;

                const maxWidth = 280;
                const issueLines = wrapText(reportData.recentIssue, 35);
                const baseHeight = 90;
                const extraHeight = Math.max(0, issueLines.length - 1) * 18;
                const totalHeight = baseHeight + extraHeight;

                return (
                  <g
                    key={`tooltip-${stationKey}`}
                    transform={`translate(${station.x}, ${station.y - 50})`}
                  >
                    <rect
                      x={-maxWidth / 2}
                      y="-45"
                      width={maxWidth}
                      height={totalHeight}
                      rx="10"
                      fill="rgba(255,255,255,0.98)"
                      stroke="rgba(156,163,175,0.4)"
                      strokeWidth="2.5"
                    />

                    <text
                      x="0"
                      y="-24"
                      textAnchor="middle"
                      className="text-[16px] font-bold fill-gray-900"
                    >
                      {station.name}
                    </text>

                    <text
                      x="0"
                      y="-4"
                      textAnchor="middle"
                      className="text-[13px] fill-gray-600"
                    >
                      Reportes: {reportCount} | Índice: {complaintIndex}%
                    </text>

                    {issueLines.map((line, idx) => (
                      <text
                        key={idx}
                        x="0"
                        y={16 + idx * 18}
                        textAnchor="middle"
                        className={`text-[13px] font-semibold ${
                          reportCount > 0 ? "fill-red-600" : "fill-green-600"
                        }`}
                      >
                        {line}
                      </text>
                    ))}

                    <text
                      x="0"
                      y={38 + extraHeight}
                      textAnchor="middle"
                      className="text-[12px] fill-gray-500"
                    >
                      Gravedad: {(severity * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })
            )}

            {/* Tooltips for custom lines */}
            {customLines.map((line) =>
              line.stations.map((station) => {
                const stationKey = `custom-${line.id}-${station.id}`;
                const isHovered = hoveredStation === stationKey;

                if (!isHovered) return null;

                const reportData = STATION_REPORT_DATA[station.name] || {
                  reportCount: 0,
                  severity: 0.05,
                  recentIssue: "Todo en orden",
                  complaintIndex: 0,
                };
                const { reportCount, severity, complaintIndex } = reportData;
                const hasReports = reportCount > 0;

                const maxWidth = 280;
                const issueLines = wrapText(reportData.recentIssue, 35);
                const baseHeight = 90;
                const extraHeight = Math.max(0, issueLines.length - 1) * 18;
                const totalHeight = baseHeight + extraHeight;

                return (
                  <g
                    key={`tooltip-${stationKey}`}
                    transform={`translate(${station.x}, ${station.y - 50})`}
                  >
                    <rect
                      x={-maxWidth / 2}
                      y="-45"
                      width={maxWidth}
                      height={totalHeight}
                      rx="10"
                      fill="rgba(255,255,255,0.98)"
                      stroke={line.color}
                      strokeWidth="3"
                    />

                    <text
                      x="0"
                      y="-24"
                      textAnchor="middle"
                      className="text-[16px] fill-gray-900 font-bold"
                    >
                      {station.name}
                    </text>

                    <text
                      x="0"
                      y="-4"
                      textAnchor="middle"
                      className="text-[13px] fill-gray-600"
                    >
                      Reportes: {reportCount} | Índice: {complaintIndex}%
                    </text>

                    {issueLines.map((line, idx) => (
                      <text
                        key={idx}
                        x="0"
                        y={16 + idx * 18}
                        textAnchor="middle"
                        className={`text-[13px] font-semibold ${
                          hasReports ? "fill-red-600" : "fill-green-600"
                        }`}
                      >
                        {line}
                      </text>
                    ))}

                    <text
                      x="0"
                      y={38 + extraHeight}
                      textAnchor="middle"
                      className="text-[12px] fill-gray-500"
                    >
                      Gravedad: {(severity * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })
            )}
          </g>
        </g>

        {/* Legend - Fija, no afectada por zoom */}
        <g transform="translate(20, 20)">
          <rect
            x="0"
            y="0"
            width="340"
            height="200"
            rx="12"
            fill="rgba(255,255,255,0.95)"
            stroke="rgba(156,163,175,0.8)"
            strokeWidth="2"
          />
          <text x="20" y="35" className="text-[18px] fill-gray-900 font-bold">
            Heatmap de Incidencias
          </text>

          {/* Intensidad de color */}
          <text
            x="20"
            y="65"
            className="text-[15px] fill-gray-700 font-semibold"
          >
            Intensidad de color:
          </text>
          <rect
            x="20"
            y="78"
            width="55"
            height="16"
            rx="4"
            fill="rgba(32, 224, 10, 1)"
          />
          <text x="85" y="91" className="text-[14px] fill-gray-600">
            Baja gravedad
          </text>
          <rect
            x="20"
            y="102"
            width="55"
            height="16"
            rx="4"
            fill="rgba(245, 180, 0, 1)"
          />
          <text x="85" y="115" className="text-[14px] fill-gray-600">
            Media gravedad
          </text>
          <rect
            x="20"
            y="126"
            width="55"
            height="16"
            rx="4"
            fill="rgba(139, 0, 0, 1)"
          />
          <text x="85" y="139" className="text-[14px] fill-gray-600">
            Alta gravedad
          </text>

          {/* Tamaño del blur */}
          <text
            x="20"
            y="165"
            className="text-[15px] fill-gray-700 font-semibold"
          >
            Tamaño del área:
          </text>
          <text x="20" y="185" className="text-[13px] fill-gray-600">
            Mayor área = más reportes
          </text>
        </g>
      </svg>
    </div>
  );
};

export default MetroMap;
