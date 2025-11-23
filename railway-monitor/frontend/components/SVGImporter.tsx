"use client";

import { PALABRAS_CLAVE } from "@/lib/constants";
import { DetectedNode, SVGPath } from "@/types";
import React, { ChangeEvent, useState } from "react";

interface SVGImporterProps {
  onSave: (lineData: any) => void;
}

const SVGImporter: React.FC<SVGImporterProps> = ({ onSave }) => {
  const [lineName, setLineName] = useState("Nueva Línea");
  const [lineColor, setLineColor] = useState("#e91e8b");
  const [importedSVG, setImportedSVG] = useState<string | null>(null);
  const [detectedNodes, setDetectedNodes] = useState<DetectedNode[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [svgViewBox, setSvgViewBox] = useState("0 0 800 600");
  const [svgPaths, setSvgPaths] = useState<SVGPath[]>([]);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const parseSVG = (svgContent: string) => {
    setIsProcessing(true);
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const svg = doc.querySelector("svg");

      const viewBox = svg?.getAttribute("viewBox") || "0 0 800 600";
      setSvgViewBox(viewBox);

      const paths = doc.querySelectorAll("path, line, polyline");
      const extractedPaths: SVGPath[] = [];
      paths.forEach((p, i) => {
        extractedPaths.push({
          id: `path-${i}`,
          d: p.getAttribute("d") || "",
          stroke: p.getAttribute("stroke") || lineColor,
          points: p.getAttribute("points") || "",
        });
      });
      setSvgPaths(extractedPaths);

      const circles = doc.querySelectorAll("circle, ellipse");
      const nodes: DetectedNode[] = [];
      circles.forEach((c, i) => {
        const cx = parseFloat(
          c.getAttribute("cx") || c.getAttribute("x") || "0"
        );
        const cy = parseFloat(
          c.getAttribute("cy") || c.getAttribute("y") || "0"
        );
        const randomCatKey =
          Object.keys(PALABRAS_CLAVE)[Math.floor(Math.random() * 7)];
        nodes.push({
          id: `node-${i}`,
          x: cx,
          y: cy,
          name: `Estación ${i + 1}`,
          phi: Math.floor(Math.random() * 50) + 35,
          palabraClave: PALABRAS_CLAVE[randomCatKey][0],
          categoria: randomCatKey,
        });
      });

      if (nodes.length === 0) {
        const allPaths = doc.querySelectorAll("path");
        allPaths.forEach((path) => {
          const d = path.getAttribute("d") || "";
          const commands = d.match(/[ML]\s*[\d.,\s-]+/gi) || [];
          commands.forEach((cmd) => {
            const nums = cmd.match(/[\d.-]+/g);
            if (nums && nums.length >= 2) {
              const randomCatKey =
                Object.keys(PALABRAS_CLAVE)[Math.floor(Math.random() * 7)];
              nodes.push({
                id: `node-${nodes.length}`,
                x: parseFloat(nums[0]),
                y: parseFloat(nums[1]),
                name: `Estación ${nodes.length + 1}`,
                phi: Math.floor(Math.random() * 50) + 35,
                palabraClave: PALABRAS_CLAVE[randomCatKey][0],
                categoria: randomCatKey,
              });
            }
          });
        });
      }

      setDetectedNodes(nodes);
      setImportedSVG(svgContent);
    } catch (e) {
      console.error("Error parsing SVG:", e);
    }
    setIsProcessing(false);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          parseSVG(ev.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const simulateUpload = () => {
    const exampleSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">
  <path d="M 50 200 L 150 200 L 250 180 L 350 180 L 450 200 L 550 220 L 650 220 L 750 200" 
        stroke="#FF6B35" stroke-width="6" fill="none" stroke-linecap="round"/>
  <circle cx="50" cy="200" r="8" fill="#FF6B35"/>
  <circle cx="150" cy="200" r="8" fill="#FF6B35"/>
  <circle cx="250" cy="180" r="8" fill="#FF6B35"/>
  <circle cx="350" cy="180" r="8" fill="#FF6B35"/>
  <circle cx="450" cy="200" r="8" fill="#FF6B35"/>
  <circle cx="550" cy="220" r="8" fill="#FF6B35"/>
  <circle cx="650" cy="220" r="8" fill="#FF6B35"/>
  <circle cx="750" cy="200" r="8" fill="#FF6B35"/>
</svg>`;

    setLineName("Metrobús Línea 1");
    setLineColor("#FF6B35");
    parseSVG(exampleSVG);
  };

  const addManualNode = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingNodeId) return; // Don't add nodes while dragging
    if (
      e.target instanceof SVGSVGElement ||
      (e.target instanceof SVGElement && e.target.tagName === "rect")
    ) {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const viewBoxParts = svgViewBox.split(" ").map(Number);
      const scaleX = viewBoxParts[2] / rect.width;
      const scaleY = viewBoxParts[3] / rect.height;
      const x = (e.clientX - rect.left) * scaleX + viewBoxParts[0];
      const y = (e.clientY - rect.top) * scaleY + viewBoxParts[1];

      const randomCatKey =
        Object.keys(PALABRAS_CLAVE)[Math.floor(Math.random() * 7)];
      setDetectedNodes((prev) => [
        ...prev,
        {
          id: `manual-${Date.now()}`,
          x,
          y,
          name: `Estación ${prev.length + 1}`,
          phi: Math.floor(Math.random() * 50) + 35,
          palabraClave: PALABRAS_CLAVE[randomCatKey][0],
          categoria: randomCatKey,
        },
      ]);
    }
  };

  const updateNodeName = (id: string, name: string) => {
    setDetectedNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, name } : n))
    );
    setEditingNode(null);
  };

  const deleteNode = (id: string) => {
    setDetectedNodes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
  };

  const handleNodeDrag = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingNodeId) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const viewBoxParts = svgViewBox.split(" ").map(Number);
    const scaleX = viewBoxParts[2] / rect.width;
    const scaleY = viewBoxParts[3] / rect.height;
    const x = (e.clientX - rect.left) * scaleX + viewBoxParts[0];
    const y = (e.clientY - rect.top) * scaleY + viewBoxParts[1];

    setDetectedNodes((prev) =>
      prev.map((node) =>
        node.id === draggingNodeId ? { ...node, x, y } : node
      )
    );
  };

  const handleNodeDragEnd = () => {
    setDraggingNodeId(null);
  };

  const exportLine = () => {
    const lineData = {
      id: `custom-${Date.now()}`,
      name: lineName,
      color: lineColor,
      stations: detectedNodes.map((n) => ({
        id: n.id,
        name: n.name,
        x: Math.round(n.x),
        y: Math.round(n.y),
      })),
      paths: svgPaths,
      viewBox: svgViewBox,
    };

    const blob = new Blob([JSON.stringify(lineData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lineName.replace(/\s+/g, "_")}_config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveToCustomLines = () => {
    const newLine = {
      id: `L-custom-${Date.now()}`,
      name: lineName,
      color: lineColor,
      stations: detectedNodes.map((n) => ({
        id: n.id,
        name: n.name,
        x: n.x,
        y: n.y,
      })),
    };
    onSave(newLine);
    clear();
  };

  const clear = () => {
    setDetectedNodes([]);
    setImportedSVG(null);
    setSvgPaths([]);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
        <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
          <span className="text-purple-400">🚇</span>
          Importar Línea de Transporte
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-white/60 mb-1">
              Nombre de la línea
            </label>
            <input
              type="text"
              value={lineName}
              onChange={(e) => setLineName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ej: Línea A - Metrobús"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">
              Color de la línea
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                className="w-12 h-9 rounded cursor-pointer"
              />
              <input
                type="text"
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-purple-500/50 transition-colors">
          <input
            type="file"
            accept=".svg"
            onChange={handleFileUpload}
            className="hidden"
            id="svg-upload"
          />
          <label htmlFor="svg-upload" className="cursor-pointer block mb-3">
            <div className="text-4xl mb-2">📁</div>
            <div className="text-sm font-medium text-white/80">
              Arrastra un archivo SVG o haz clic
            </div>
            <div className="text-xs text-white/50 mt-1">
              El sistema detectará automáticamente los nodos
            </div>
          </label>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-slate-900/50 text-white/50">o</span>
            </div>
          </div>

          <button
            onClick={simulateUpload}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
          >
            <span>⚡</span> Simular Carga de Ejemplo
          </button>
        </div>

        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
            <p className="text-xs text-white/60 mt-2">Procesando SVG...</p>
          </div>
        )}
      </div>

      {importedSVG && detectedNodes.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <h3 className="text-sm font-semibold mb-3">
                📝 Editar Estaciones
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {detectedNodes.map((node, i) => (
                  <div
                    key={node.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: lineColor }}
                    >
                      {i + 1}
                    </div>
                    {editingNode === node.id ? (
                      <input
                        type="text"
                        defaultValue={node.name}
                        autoFocus
                        onBlur={(e) => updateNodeName(node.id, e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          updateNodeName(node.id, e.currentTarget.value)
                        }
                        className="flex-1 px-2 py-1 rounded bg-white/10 border border-purple-500 text-xs focus:outline-none"
                      />
                    ) : (
                      <span
                        className="flex-1 text-xs cursor-pointer hover:text-purple-400"
                        onClick={() => setEditingNode(node.id)}
                      >
                        {node.name}
                      </span>
                    )}
                    <span className="text-[10px] text-white/40">
                      ({Math.round(node.x)}, {Math.round(node.y)})
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        node.phi >= 50
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      PHI: {node.phi}
                    </span>
                    <button
                      onClick={() => deleteNode(node.id)}
                      className="p-1 rounded hover:bg-red-500/20 text-red-400"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30">
              <h3 className="text-sm font-semibold mb-3">⚡ Acciones</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={saveToCustomLines}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <span>✓</span> Guardar
                </button>
                <button
                  onClick={exportLine}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <span>📥</span> Exportar
                </button>
                <button
                  onClick={clear}
                  className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium text-sm hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <span>🗑</span> Limpiar
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">
                Vista Previa - Arrastra estaciones para moverlas
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                {detectedNodes.length} estaciones
              </span>
            </div>

            <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-white/10">
              <svg
                viewBox={svgViewBox}
                className={`w-full h-auto min-h-[400px] ${
                  draggingNodeId ? "cursor-grabbing" : "cursor-crosshair"
                }`}
                onClick={addManualNode}
                onMouseMove={handleNodeDrag}
                onMouseUp={handleNodeDragEnd}
                onMouseLeave={handleNodeDragEnd}
              >
                <defs>
                  <pattern
                    id="grid"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Dynamic connection line between stations */}
                <path
                  d={detectedNodes
                    .map(
                      (node, i) => `${i === 0 ? "M" : "L"} ${node.x} ${node.y}`
                    )
                    .join(" ")}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.8"
                />

                {detectedNodes.map((node) => {
                  const isBeingDragged = draggingNodeId === node.id;
                  return (
                    <g
                      key={node.id}
                      className={
                        isBeingDragged ? "cursor-grabbing" : "cursor-grab"
                      }
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isBeingDragged ? 35 : 30}
                        fill={
                          node.phi >= 70
                            ? "rgba(16,185,129,0.3)"
                            : node.phi >= 50
                            ? "rgba(245,158,11,0.3)"
                            : "rgba(239,68,68,0.3)"
                        }
                        className="transition-all duration-200"
                      />
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isBeingDragged ? 14 : 12}
                        fill="#1e1b4b"
                        stroke={isBeingDragged ? "#a78bfa" : lineColor}
                        strokeWidth={isBeingDragged ? 4 : 3}
                        className="transition-all duration-200"
                        onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!draggingNodeId) {
                            setEditingNode(node.id);
                          }
                        }}
                      />
                      <text
                        x={node.x}
                        y={node.y + 4}
                        textAnchor="middle"
                        className="text-[8px] font-bold fill-white pointer-events-none"
                      >
                        {node.phi}
                      </text>
                      {!isBeingDragged && (
                        <g transform={`translate(${node.x}, ${node.y - 20})`}>
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
                            className="text-[7px] fill-white pointer-events-none"
                          >
                            {node.name}
                          </text>
                        </g>
                      )}
                      <g
                        transform={`translate(${node.x + 15}, ${node.y - 15})`}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNode(node.id);
                        }}
                        className="cursor-pointer"
                      >
                        <circle r="8" fill="#ef4444" />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          className="text-[8px] fill-white font-bold pointer-events-none"
                        >
                          ×
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <h3 className="text-sm font-semibold mb-3">📖 Instrucciones</h3>
            <div className="grid grid-cols-2 gap-4 text-xs text-white/70">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">1.</span>
                  <span>Sube un archivo SVG con el trazo de tu línea</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">2.</span>
                  <span>El sistema detectará automáticamente los nodos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">3.</span>
                  <span>Arrastra las estaciones para reposicionarlas</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">4.</span>
                  <span>Edita los nombres haciendo clic en cada estación</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">5.</span>
                  <span>Guarda en el dashboard o exporta como JSON</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">6.</span>
                  <span>El sistema asignará PHI automáticamente</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
              <div className="text-xs text-indigo-300">
                <strong>💡 Tip:</strong> Funciona con cualquier sistema de
                transporte de cualquier ciudad del mundo.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SVGImporter;
