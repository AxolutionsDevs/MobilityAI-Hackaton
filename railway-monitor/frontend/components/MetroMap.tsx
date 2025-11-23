"use client";

import { useCity } from "@/lib/CityContext";
import { getMetroLines, getStationReportData } from "@/lib/constants";
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
  displayMap?: string; // 'cdmx' | 'vienna' | custom line id
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
  displayMap = "cdmx",
}) => {
  const { translations, city } = useCity();

  // Obtener líneas según la ciudad
  const METRO_LINES = getMetroLines(city);

  // Calcular dimensiones reales del mapa y zoom automático
  const calculateMapBoundsAndZoom = () => {
    // Determinar qué líneas mostrar para calcular bounds
    const isCustomSelected = typeof displayMap === "string" && displayMap.startsWith("L-custom-");

    const shownBaseLines = isCustomSelected ? [] : METRO_LINES;
    const shownCustomLines = isCustomSelected
      ? customLines.filter((l) => l.id === displayMap)
      : customLines.filter((line) => line.city === undefined || line.city === displayMap);

    const allStations = [
      ...shownBaseLines.flatMap((line) => line.stations),
      ...shownCustomLines.flatMap((line) => line.stations),
    ];

    if (allStations.length === 0) {
      return {
        minX: 0,
        minY: 0,
        maxX: 2000,
        maxY: 2000,
        autoZoom: 0.6,
        centerX: 1000,
        centerY: 1000,
      };
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    allStations.forEach((station) => {
      const x =
        typeof station.x === "string"
          ? parseFloat(station.x)
          : Number(station.x);
      const y =
        typeof station.y === "string"
          ? parseFloat(station.y)
          : Number(station.y);

      if (!isNaN(x)) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
      if (!isNaN(y)) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    });

    if (minX === Infinity) {
      return {
        minX: 0,
        minY: 0,
        maxX: 2000,
        maxY: 2000,
        autoZoom: 0.6,
        centerX: 1000,
        centerY: 1000,
      };
    }

    const mapWidth = maxX - minX;
    const mapHeight = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Calcular zoom para que el mapa quepa bien en el viewport
    // ViewBox es 2000x2000, queremos que el mapa ocupe ~70% del espacio
    const targetViewportRatio = 0.7;
    const viewBoxSize = 2000;

    const zoomForWidth = (viewBoxSize * targetViewportRatio) / mapWidth;
    const zoomForHeight = (viewBoxSize * targetViewportRatio) / mapHeight;

    // Usar el menor zoom para que todo quepa
    const autoZoom = Math.min(zoomForWidth, zoomForHeight, 2.0); // Máximo 2.0x
    const clampedZoom = Math.max(0.3, Math.min(autoZoom, 2.0)); // Entre 0.3 y 2.0

    return {
      minX,
      minY,
      maxX,
      maxY,
      autoZoom: clampedZoom,
      centerX,
      centerY,
    };
  };

  const mapBounds = calculateMapBoundsAndZoom();
  const svgViewBox = "0 0 2000 2000";
  const initialZoom = mapBounds.autoZoom;

  // Calcular pan inicial para centrar el mapa en el viewport
  // El centro del viewport es (1000, 1000) en el viewBox de 2000x2000
  // Necesitamos trasladar el centro del mapa al centro del viewport
  const viewBoxCenter = 1000; // Centro del viewBox (2000/2)
  const initialPan = {
    x: (viewBoxCenter - mapBounds.centerX) * initialZoom,
    y: (viewBoxCenter - mapBounds.centerY) * initialZoom,
  };

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

  const isCustomSelected = typeof displayMap === "string" && displayMap.startsWith("L-custom-");

  const filteredLines = isCustomSelected
    ? []
    : selectedLine === "all"
    ? METRO_LINES
    : METRO_LINES.filter((l) => l.id === selectedLine);

  // Filtrar customLines por ciudad seleccionada, o mostrar sólo la importada si fue seleccionada
  const filteredCustomLines = isCustomSelected
    ? customLines.filter((l) => l.id === displayMap)
    : customLines.filter((line) => line.city === undefined || line.city === displayMap);

  const hasNoLines = filteredLines.length === 0 && filteredCustomLines.length === 0;

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
    const targetZoom = initialZoom; // Usar zoom calculado automáticamente
    const targetPan = initialPan; // Usar pan calculado para centrar el mapa

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
              {translations.noLines}
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              {translations.noLinesDescription}
            </p>
            {onNavigateToImport && (
              <button
                onClick={onNavigateToImport}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mx-auto"
              >
                <span className="text-lg">📁</span>
                {translations.goToImport}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Botón de reset zoom */}
      {(Math.abs(zoom - initialZoom) > 0.01 ||
        Math.abs(pan.x - initialPan.x) > 1 ||
        Math.abs(pan.y - initialPan.y) > 1) && (
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
          {translations.centerView}
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
                const stationReportData = getStationReportData(city);
                const reportData = stationReportData[station.name] || {
                  reportCount: 0,
                  severity: 0.05,
                  recentIssue: "Todo en orden",
                };
                const { reportCount, severity } = reportData;

                // Debug log mejorado
                if (reportCount > 0 || city === "vienna") {
                  console.log(
                    `[Heatmap] City: ${city}, Station: "${
                      station.name
                    }", Reports: ${reportCount}, Severity: ${severity}, Found: ${!!stationReportData[
                      station.name
                    ]}`
                  );
                  if (reportCount === 0 && city === "vienna") {
                    // Mostrar las primeras 3 estaciones disponibles en los datos
                    const availableStations = Object.keys(
                      stationReportData
                    ).slice(0, 3);
                    console.log(
                      `[Heatmap] Available stations sample:`,
                      availableStations
                    );
                  }
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
            {filteredCustomLines.map((line) =>
              line.stations.map((station) => {
                const stationReportData = getStationReportData(city);
                const reportData = stationReportData[station.name] || {
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
          {filteredCustomLines.map((line) => {
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
              const stationReportData = getStationReportData(city);
              const reportData = stationReportData[station.name] || {
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
          {filteredCustomLines.map((line) =>
            line.stations.map((station, idx) => {
              const stationKey = `custom-${line.id}-${station.id}`;
              const isHovered = hoveredStation === stationKey;

              // Obtener datos reales de quejas
              const stationReportData = getStationReportData(city);
              const reportData = stationReportData[station.name] || {
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
          {filteredCustomLines.map((line) => {
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

                const stationReportData = getStationReportData(city);
                const reportData = stationReportData[station.name] || {
                  reportCount: 0,
                  severity: 0.05,
                  recentIssue: "Todo en orden",
                  complaintIndex: 0,
                };
                const { reportCount, severity, complaintIndex } = reportData;

                const maxWidth = 380;
                const issueLines = wrapText(reportData.recentIssue, 45);
                const baseHeight = 120;
                const extraHeight = Math.max(0, issueLines.length - 1) * 24;
                const totalHeight = baseHeight + extraHeight;

                return (
                  <g
                    key={`tooltip-${stationKey}`}
                    transform={`translate(${station.x}, ${station.y - 65})`}
                  >
                    <rect
                      x={-maxWidth / 2}
                      y="-60"
                      width={maxWidth}
                      height={totalHeight}
                      rx="12"
                      fill="rgba(255,255,255,0.98)"
                      stroke="rgba(156,163,175,0.4)"
                      strokeWidth="3"
                      filter="drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
                    />

                    <text
                      x="0"
                      y="-34"
                      textAnchor="middle"
                      className="text-[20px] font-bold fill-gray-900"
                    >
                      {station.name}
                    </text>

                    <text
                      x="0"
                      y="-8"
                      textAnchor="middle"
                      className="text-[17px] fill-gray-600"
                    >
                      {translations.reportCount}: {reportCount} | {translations.complaintIndex}: {complaintIndex}%
                    </text>

                    {issueLines.map((line, idx) => (
                      <text
                        key={idx}
                        x="0"
                        y={20 + idx * 24}
                        textAnchor="middle"
                        className={`text-[17px] font-semibold ${
                          reportCount > 0 ? "fill-red-600" : "fill-green-600"
                        }`}
                      >
                        {line}
                      </text>
                    ))}

                    <text
                      x="0"
                      y={50 + extraHeight}
                      textAnchor="middle"
                      className="text-[16px] fill-gray-500"
                    >
                      {translations.severity}: {(severity * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })
            )}

            {/* Tooltips for custom lines */}
            {filteredCustomLines.map((line) =>
              line.stations.map((station) => {
                const stationKey = `custom-${line.id}-${station.id}`;
                const isHovered = hoveredStation === stationKey;

                if (!isHovered) return null;

                const stationReportData = getStationReportData(city);
                const reportData = stationReportData[station.name] || {
                  reportCount: 0,
                  severity: 0.05,
                  recentIssue: "Todo en orden",
                  complaintIndex: 0,
                };
                const { reportCount, severity, complaintIndex } = reportData;
                const hasReports = reportCount > 0;

                const maxWidth = 380;
                const issueLines = wrapText(reportData.recentIssue, 45);
                const baseHeight = 120;
                const extraHeight = Math.max(0, issueLines.length - 1) * 24;
                const totalHeight = baseHeight + extraHeight;

                return (
                  <g
                    key={`tooltip-${stationKey}`}
                    transform={`translate(${station.x}, ${station.y - 65})`}
                  >
                    <rect
                      x={-maxWidth / 2}
                      y="-60"
                      width={maxWidth}
                      height={totalHeight}
                      rx="12"
                      fill="rgba(255,255,255,0.98)"
                      stroke={line.color}
                      strokeWidth="3.5"
                      filter="drop-shadow(0 4px 8px rgba(0,0,0,0.15))"
                    />

                    <text
                      x="0"
                      y="-34"
                      textAnchor="middle"
                      className="text-[20px] fill-gray-900 font-bold"
                    >
                      {station.name}
                    </text>

                    <text
                      x="0"
                      y="-8"
                      textAnchor="middle"
                      className="text-[17px] fill-gray-600"
                    >
                      {translations.reportCount}: {reportCount} | {translations.complaintIndex}: {complaintIndex}%
                    </text>

                    {issueLines.map((line, idx) => (
                      <text
                        key={idx}
                        x="0"
                        y={20 + idx * 24}
                        textAnchor="middle"
                        className={`text-[17px] font-semibold ${
                          hasReports ? "fill-red-600" : "fill-green-600"
                        }`}
                      >
                        {line}
                      </text>
                    ))}

                    <text
                      x="0"
                      y={50 + extraHeight}
                      textAnchor="middle"
                      className="text-[16px] fill-gray-500"
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
        <g transform="translate(40, 40)">
          <rect
            x="0"
            y="0"
            width="520"
            height="320"
            rx="18"
            fill="rgba(255,255,255,0.98)"
            stroke="rgba(156,163,175,0.9)"
            strokeWidth="3"
            filter="drop-shadow(0 6px 12px rgba(0,0,0,0.15))"
          />
          <text x="30" y="55" className="text-[28px] fill-gray-900 font-bold">
            Heatmap de Incidencias
          </text>

          {/* Intensidad de color */}
          <text
            x="30"
            y="110"
            className="text-[22px] fill-gray-700 font-semibold"
          >
            Intensidad de color:
          </text>
          <rect
            x="30"
            y="130"
            width="90"
            height="28"
            rx="6"
            fill="rgba(32, 224, 10, 1)"
          />
          <text x="130" y="151" className="text-[21px] fill-gray-600">
            Baja gravedad
          </text>
          <rect
            x="30"
            y="170"
            width="90"
            height="28"
            rx="6"
            fill="rgba(245, 180, 0, 1)"
          />
          <text x="130" y="191" className="text-[21px] fill-gray-600">
            Media gravedad
          </text>
          <rect
            x="30"
            y="210"
            width="90"
            height="28"
            rx="6"
            fill="rgba(139, 0, 0, 1)"
          />
          <text x="130" y="231" className="text-[21px] fill-gray-600">
            Alta gravedad
          </text>

          {/* Tamaño del blur */}
          <text
            x="30"
            y="275"
            className="text-[22px] fill-gray-700 font-semibold"
          >
            Tamaño del área:
          </text>
          <text x="30" y="305" className="text-[20px] fill-gray-600">
            Mayor área = más reportes
          </text>
        </g>
      </svg>
    </div>
  );
};

export default MetroMap;
