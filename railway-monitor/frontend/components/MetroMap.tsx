"use client";

import { METRO_LINES } from "@/lib/constants";
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
  const svgWidth = 860;
  const svgHeight = 800;
  const [editMode, setEditMode] = useState(false);
  const [draggingNode, setDraggingNode] = useState<{
    lineId: string;
    stationId: string;
  } | null>(null);

  const getHeatColor = (phi: number) => {
    if (phi >= 70) return { color: "rgba(16, 185, 129, 0.9)", glow: "#10b981" };
    if (phi >= 50) return { color: "rgba(245, 158, 11, 0.9)", glow: "#f59e0b" };
    return { color: "rgba(239, 68, 68, 0.9)", glow: "#ef4444" };
  };

  const filteredLines =
    selectedLine === "all"
      ? METRO_LINES
      : METRO_LINES.filter((l) => l.id === selectedLine);

  const handleNodeDrag = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingNode || !onUpdateCustomLine) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * svgWidth;
    const y = ((e.clientY - rect.top) / rect.height) * svgHeight;

    const line = customLines.find((l) => l.id === draggingNode.lineId);
    if (line) {
      const updatedStations = line.stations.map((s) =>
        s.id === draggingNode.stationId ? { ...s, x, y } : s
      );
      onUpdateCustomLine(draggingNode.lineId, updatedStations);
    }
  };

  const handleNodeDragEnd = () => {
    setDraggingNode(null);
  };

  return (
    <div className="relative w-full overflow-auto bg-slate-900/50 rounded-2xl border border-white/10 p-4">
      {customLines.length > 0 && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              editMode
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            {editMode ? "✓ Modo Edición" : "✏️ Editar Nodos"}
          </button>
        </div>
      )}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto min-h-[500px]"
        onMouseMove={editMode ? handleNodeDrag : undefined}
        onMouseUp={editMode ? handleNodeDragEnd : undefined}
        onMouseLeave={editMode ? handleNodeDragEnd : undefined}
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
          {["#ef4444", "#f59e0b", "#10b981"].map((color, i) => (
            <filter
              key={`heat-${i}`}
              id={`heat-glow-${i}`}
              x="-100%"
              y="-100%"
              width="300%"
              height="300%"
            >
              <feGaussianBlur
                stdDeviation={heatmapIntensity * 8}
                result="blur"
              />
              <feFlood floodColor={color} floodOpacity="0.6" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <radialGradient id="heat-red" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-yellow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-green" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Heatmap Layer */}
        <g className="heatmap-layer">
          {filteredLines.map((line) =>
            line.stations.map((station) => {
              const data = stationData[station.id];
              const phi = data?.phi || 50;
              const heatRadius = (100 - phi) * heatmapIntensity * 0.8 + 20;
              const gradientId =
                phi >= 70
                  ? "heat-green"
                  : phi >= 50
                  ? "heat-yellow"
                  : "heat-red";

              return (
                <circle
                  key={`heat-${station.id}`}
                  cx={station.x}
                  cy={station.y}
                  r={heatRadius}
                  fill={`url(#${gradientId})`}
                  className="transition-all duration-500"
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
            const phi = data?.phi || 50;
            const { color, glow } = getHeatColor(phi);
            const isSelected = selectedStation?.id === station.id;
            const hasAlert = data?.alerts > 0;

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
                  stroke={isSelected ? "#fff" : color}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all duration-300 hover:r-12"
                />
                <text
                  x={station.x}
                  y={station.y + 3}
                  textAnchor="middle"
                  className="text-[8px] font-bold fill-white pointer-events-none"
                >
                  {phi}
                </text>

                {hasAlert && (
                  <g>
                    <circle
                      cx={station.x + 10}
                      cy={station.y - 10}
                      r="8"
                      fill="#ef4444"
                      className="animate-pulse"
                    />
                    <text
                      x={station.x + 10}
                      y={station.y - 7}
                      textAnchor="middle"
                      className="text-[8px] font-bold fill-white"
                    >
                      {data.alerts}
                    </text>
                  </g>
                )}

                {isSelected && (
                  <g>
                    <rect
                      x={station.x - 50}
                      y={station.y - 55}
                      width="100"
                      height="38"
                      rx="6"
                      fill="rgba(0,0,0,0.9)"
                      stroke={glow}
                      strokeWidth="1"
                    />
                    <text
                      x={station.x}
                      y={station.y - 40}
                      textAnchor="middle"
                      className="text-[8px] fill-white/70"
                    >
                      {station.name}
                    </text>
                    <text
                      x={station.x}
                      y={station.y - 26}
                      textAnchor="middle"
                      className="text-[11px] fill-red-400 font-black"
                    >
                      {data?.palabraClave || "N/A"}
                    </text>
                  </g>
                )}
              </g>
            );
          })
        )}

        {/* Legend */}
        <g transform="translate(20, 20)">
          <rect
            x="0"
            y="0"
            width="120"
            height="90"
            rx="8"
            fill="rgba(0,0,0,0.6)"
          />
          <text x="10" y="20" className="text-[10px] fill-white font-semibold">
            Intensidad PHI
          </text>
          <circle cx="20" cy="38" r="6" fill="#ef4444" />
          <text x="32" y="42" className="text-[9px] fill-white">
            Crítico (0-49)
          </text>
          <circle cx="20" cy="55" r="6" fill="#f59e0b" />
          <text x="32" y="59" className="text-[9px] fill-white">
            Alerta (50-69)
          </text>
          <circle cx="20" cy="72" r="6" fill="#10b981" />
          <text x="32" y="76" className="text-[9px] fill-white">
            Óptimo (70-100)
          </text>
        </g>

        {/* Custom Line Stations */}
        {customLines.map((line) =>
          line.stations.map((station, idx) => {
            const isBeingDragged =
              draggingNode?.lineId === line.id &&
              draggingNode?.stationId === station.id;
            return (
              <g
                key={`custom-${station.id}`}
                className={editMode ? "cursor-move" : "cursor-pointer"}
                onMouseDown={
                  editMode
                    ? () =>
                        setDraggingNode({
                          lineId: line.id,
                          stationId: station.id,
                        })
                    : undefined
                }
                onClick={
                  !editMode
                    ? () =>
                        onSelectStation({
                          ...station,
                          line: line.name,
                          lineColor: line.color,
                        })
                    : undefined
                }
              >
                <circle
                  cx={station.x}
                  cy={station.y}
                  r={isBeingDragged ? 20 : 14}
                  fill={line.color}
                  opacity="0.3"
                  className="transition-all duration-200"
                />
                <circle
                  cx={station.x}
                  cy={station.y}
                  r={isBeingDragged ? 14 : 10}
                  fill="#1e1b4b"
                  stroke={editMode ? "#a78bfa" : line.color}
                  strokeWidth={editMode ? 3 : 2}
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
                {!editMode && (
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
                )}
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
            <rect x="0" y="0" width="24" height="14" rx="3" fill={line.color} />
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
            <rect x="0" y="0" width="70" height="16" rx="4" fill={line.color} />
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
      </svg>
    </div>
  );
};

export default MetroMap;
