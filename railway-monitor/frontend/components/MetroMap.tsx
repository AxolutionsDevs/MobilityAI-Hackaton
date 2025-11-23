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
}

const MetroMap: React.FC<MetroMapProps> = ({
  stationData,
  selectedStation,
  onSelectStation,
  selectedLine,
  heatmapIntensity,
  customLines = [],
  onUpdateCustomLine,
}) => {
  const { translations } = useCity();
  const svgWidth = 860;
  const svgHeight = 800;

  // Estados para zoom y pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isMapFocused, setIsMapFocused] = useState(false);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Calcular color e intensidad del rojo basado en gravedad (0-1)
  const getHeatColor = (severity: number) => {
    // severity: 0 = sin problema, 1 = gravedad máxima
    // A mayor severidad, rojo más intenso
    const intensity = Math.min(Math.max(severity, 0), 1);
    const red = Math.floor(139 + (255 - 139) * intensity); // De #8B0000 a #FF0000
    const alpha = 0.3 + 0.7 * intensity; // De 0.3 a 1.0 opacidad

    return {
      color: `rgba(${red}, 0, 0, ${alpha})`,
      strokeColor: `rgb(${red}, 0, 0)`,
      intensity: intensity,
    };
  };

  const filteredLines =
    selectedLine === "all"
      ? METRO_LINES
      : METRO_LINES.filter((l) => l.id === selectedLine);

  // Manejar zoom con la rueda del mouse
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isMapFocused) {
      return;
    }

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.5), 5);
    setZoom(newZoom);
  };

  // Activar el mapa para zoom
  const handleMapClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMapFocused(true);
  };

  // Desactivar cuando se hace click fuera y manejar scroll
  React.useEffect(() => {
    const containerElement = containerRef.current;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerElement && !containerElement.contains(e.target as Node)) {
        setIsMapFocused(false);
      }
    };

    const handleWheelCapture = (e: WheelEvent) => {
      // Siempre prevenir scroll cuando está sobre el mapa
      if (containerElement && containerElement.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();

        // Si el mapa está enfocado, manejar el zoom aquí
        if (isMapFocused) {
          const delta = e.deltaY > 0 ? 0.9 : 1.1;
          setZoom((prev) => Math.min(Math.max(prev * delta, 0.5), 5));
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Agregar listener para prevenir scroll y manejar zoom
    document.addEventListener("wheel", handleWheelCapture, {
      passive: false,
      capture: true,
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("wheel", handleWheelCapture, true);
    };
  }, [isMapFocused]);

  // Manejar pan (arrastrar el mapa)
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-gray-100 border border-gray-300 rounded-lg p-4"
      style={{ touchAction: "none" }}
      onWheel={handleWheel}
    >
      {/* Overlay de hover cuando el mapa no está enfocado */}
      {!isMapFocused && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-200/30 to-gray-300/30 backdrop-blur-[2px] z-20 rounded-2xl cursor-pointer"
          onClick={handleMapClick}
        >
          <div className="bg-gray-300 px-6 py-3 rounded-xl border border-gray-400 shadow-2xl">
            <p className="text-gray-800 text-sm font-semibold flex items-center gap-2">
              <span className="text-2xl">🖱️</span>
              Click para interactuar con el mapa
            </p>
          </div>
        </div>
      )}

      {/* Indicador de zoom activo */}
      {isMapFocused && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-green-500 px-4 py-2 rounded-lg border border-green-600 shadow-lg">
            <p className="text-gray-900 text-xs font-semibold flex items-center gap-2">
              <span>🔍</span>
              Usa la rueda del mouse para zoom | Arrastra para mover
            </p>
          </div>
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto min-h-[500px]"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isPanning ? "grabbing" : "grab",
          touchAction: "none",
        }}
      >
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          transformOrigin="center"
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
                const reportData = STATION_REPORT_DATA[station.id] || {
                  reportCount: 0,
                  severity: 0,
                };
                const { reportCount, severity } = reportData;

                // Radio del blur basado en número de reportes (más reportes = blur más grande)
                const baseRadius = 25;
                const maxRadius = 150;
                const normalizedReports = Math.min(reportCount / 100, 1); // Normalizar a 0-1
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

                // Solo mostrar heatmap si hay reportes
                if (reportCount === 0) return null;

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
              const reportData = STATION_REPORT_DATA[station.id] || {
                reportCount: 0,
                severity: 0,
              };
              const { reportCount, severity } = reportData;
              const { color, strokeColor, intensity } = getHeatColor(severity);
              const isSelected = selectedStation?.id === station.id;
              const hasReports = reportCount > 0;

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
                >
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r={isSelected ? 18 : 14}
                    fill={color}
                    opacity="0.3"
                    className="transition-all duration-300"
                  />
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r={isSelected ? 12 : 8}
                    fill="#1e1b4b"
                    stroke={
                      isSelected
                        ? "#fff"
                        : hasReports
                        ? strokeColor
                        : line.color
                    }
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-300 hover:r-12"
                  />
                  <text
                    x={station.x}
                    y={station.y + 3}
                    textAnchor="middle"
                    className="text-[8px] font-bold fill-white pointer-events-none"
                  >
                    {reportCount}
                  </text>

                  {hasReports && (
                    <g>
                      <circle
                        cx={station.x + 10}
                        cy={station.y - 10}
                        r="8"
                        fill={strokeColor}
                        className="animate-pulse"
                      />
                      <text
                        x={station.x + 10}
                        y={station.y - 7}
                        textAnchor="middle"
                        className="text-[8px] font-bold fill-white"
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
                        fill="rgba(0,0,0,0.95)"
                        stroke={strokeColor}
                        strokeWidth="2.5"
                      />

                      {/* Nombre de la estación */}
                      <text
                        x={station.x}
                        y={station.y - 72}
                        textAnchor="middle"
                        className="text-[11px] fill-white font-bold"
                      >
                        {station.name}
                      </text>

                      {/* Línea separadora */}
                      <line
                        x1={station.x - 85}
                        y1={station.y - 64}
                        x2={station.x + 85}
                        y2={station.y - 64}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="1"
                      />

                      {/* Reportes y Gravedad en la misma línea */}
                      <text
                        x={station.x - 50}
                        y={station.y - 48}
                        textAnchor="start"
                        className="text-[8px] fill-white/70"
                      >
                        Reportes: {reportCount}
                      </text>
                      <text
                        x={station.x + 50}
                        y={station.y - 48}
                        textAnchor="end"
                        className="text-[8px] fill-white/70"
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
              return (
                <g
                  key={`custom-${station.id}`}
                  className="cursor-pointer"
                  onClick={() =>
                    onSelectStation({
                      ...station,
                      line: line.name,
                      lineColor: line.color,
                    })
                  }
                >
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r={14}
                    fill={line.color}
                    opacity="0.3"
                    className="transition-all duration-200"
                  />
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r={10}
                    fill="#1e1b4b"
                    stroke={line.color}
                    strokeWidth={2}
                    className="transition-all duration-200"
                  />
                  <text
                    x={station.x}
                    y={station.y + 3}
                    textAnchor="middle"
                    className="text-[8px] font-bold fill-white pointer-events-none"
                  >
                    {idx + 1}
                  </text>
                  <g transform={`translate(${station.x}, ${station.y - 20})`}>
                    <rect
                      x="-35"
                      y="-10"
                      width="70"
                      height="16"
                      rx="3"
                      fill="rgba(0,0,0,0.8)"
                    />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      className="text-[7px] fill-white"
                    >
                      {station.name}
                    </text>
                  </g>
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
          {customLines.map((line) => (
            <g
              key={`label-${line.id}`}
              transform={`translate(${line.stations[0].x - 35}, ${
                line.stations[0].y - 25
              })`}
            >
              <rect
                x="0"
                y="0"
                width="70"
                height="16"
                rx="4"
                fill={line.color}
              />
              <text
                x="35"
                y="11"
                textAnchor="middle"
                className="text-[7px] fill-white font-bold"
              >
                {line.name}
              </text>
            </g>
          ))}
        </g>

        {/* Legend - Fija, no afectada por zoom */}
        <g transform="translate(20, 20)">
          <rect
            x="0"
            y="0"
            width="250"
            height="145"
            rx="10"
            fill="rgba(0,0,0,0.85)"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.5"
          />
          <text x="15" y="25" className="text-[14px] fill-white font-bold">
            Heatmap de Incidencias
          </text>

          {/* Intensidad de color */}
          <text x="15" y="48" className="text-[11px] fill-white/80">
            Intensidad de color:
          </text>
          <rect
            x="15"
            y="56"
            width="38"
            height="10"
            rx="3"
            fill="rgba(32, 224, 10, 1)"
          />
          <text x="60" y="65" className="text-[10px] fill-white/70">
            Baja gravedad
          </text>
          <rect
            x="15"
            y="72"
            width="38"
            height="10"
            rx="3"
            fill="rgba(245, 180, 0, 1)"
          />
          <text x="60" y="81" className="text-[10px] fill-white/70">
            Media gravedad
          </text>
          <rect
            x="15"
            y="88"
            width="38"
            height="10"
            rx="3"
            fill="rgba(139, 0, 0, 1)"
          />
          <text x="60" y="97" className="text-[10px] fill-white/70">
            Alta gravedad
          </text>

          {/* Tamaño del blur */}
          <text x="15" y="118" className="text-[11px] fill-white/80">
            Tamaño del área:
          </text>
          <text x="15" y="132" className="text-[10px] fill-white/70">
            Mayor área = más reportes
          </text>
        </g>
      </svg>
    </div>
  );
};

export default MetroMap;
