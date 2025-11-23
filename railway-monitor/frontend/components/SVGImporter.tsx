"use client";

import { useCity } from "@/lib/CityContext";
import { PALABRAS_CLAVE } from "@/lib/constants";
import { DetectedNode, SVGPath } from "@/types";
import React, { ChangeEvent, useCallback, useMemo, useState } from "react";

// Componente memoizado para los paths de fondo
const BackgroundPaths = React.memo(
  ({ paths, lineColor }: { paths: SVGPath[]; lineColor: string }) => {
    return (
      <>
        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            fill="none"
            stroke={path.stroke || lineColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
            points={path.points}
          />
        ))}
      </>
    );
  }
);
BackgroundPaths.displayName = "BackgroundPaths";

// Componente memoizado para cada nodo/estación
const StationNode = React.memo(
  ({
    node,
    lineColor,
    isBeingDragged,
    onDragStart,
    onEdit,
    onDelete,
  }: {
    node: DetectedNode;
    lineColor: string;
    isBeingDragged: boolean;
    onDragStart: (e: React.MouseEvent, id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
  }) => {
    return (
      <g className={isBeingDragged ? "cursor-grabbing" : "cursor-grab"}>
        <circle
          cx={node.x}
          cy={node.y}
          r={isBeingDragged ? 35 : 30}
          fill={(node as any).color || lineColor}
          opacity="0.3"
          className="transition-all duration-200"
        />
        <circle
          cx={node.x}
          cy={node.y}
          r={isBeingDragged ? 14 : 12}
          fill="#ffffff"
          stroke={
            (node as any).color || (isBeingDragged ? "#a78bfa" : lineColor)
          }
          strokeWidth={isBeingDragged ? 4 : 3}
          className="transition-all duration-200"
          onMouseDown={(e) => onDragStart(e, node.id)}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(node.id);
          }}
        />
        <text
          x={node.x}
          y={node.y + 4}
          textAnchor="middle"
          className="text-[8px] font-bold fill-gray-900 pointer-events-none"
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
              fill="rgba(255,255,255,0.95)"
              stroke="rgba(156,163,175,0.5)"
              strokeWidth="1"
            />
            <text
              x="0"
              y="2"
              textAnchor="middle"
              className="text-[7px] fill-gray-900 font-medium pointer-events-none"
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
            onDelete(node.id);
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
  }
);
StationNode.displayName = "StationNode";

interface SVGImporterProps {
  onSave: (lineData: any) => void;
}

const SVGImporter: React.FC<SVGImporterProps> = ({ onSave }) => {
  const { translations } = useCity();
  const [lineName, setLineName] = useState("Nueva Línea");
  const [lineColor, setLineColor] = useState("#e91e8b");
  const [importedSVG, setImportedSVG] = useState<string | null>(null);
  const [detectedNodes, setDetectedNodes] = useState<DetectedNode[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [svgViewBox, setSvgViewBox] = useState("0 0 800 600");
  const [svgPaths, setSvgPaths] = useState<SVGPath[]>([]);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Estados para zoom y pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isMapFocused, setIsMapFocused] = useState(false);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Ref para optimizar el drag
  const dragRef = React.useRef<{
    svgRect: DOMRect | null;
    viewBoxParts: number[];
  }>({
    svgRect: null,
    viewBoxParts: [],
  });

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

  const handleJSONUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          try {
            const jsonData = JSON.parse(ev.target.result as string);
            // Check if it's an array of lines or a single line
            if (Array.isArray(jsonData)) {
              // Import multiple lines
              importMultipleLinesFromJSON(jsonData);
            } else {
              // Import single line
              importLineFromJSON(jsonData);
            }
          } catch (error) {
            console.error("Error parsing JSON:", error);
            alert("Error al importar el JSON. Verifica el formato.");
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea imagen
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido.");
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/detect-stations", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error en el servidor");
      }

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (data.success && Array.isArray(data.lines)) {
        // Adaptar respuesta del backend al formato esperado por importMultipleLinesFromJSON
        // El backend devuelve 'lines' con 'stations' que tienen x, y, name
        // No devuelve 'paths' ni 'viewBox' explícito, se calculará
        importMultipleLinesFromJSON(data.lines);
        alert(data.message || "Detección completada exitosamente");
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(
        `Error al procesar la imagen: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    } finally {
      setIsProcessing(false);
      // Limpiar input para permitir subir el mismo archivo de nuevo si falla
      e.target.value = "";
    }
  };

  const importMultipleLinesFromJSON = (linesData: any[]) => {
    setIsProcessing(true);
    try {
      // Reset state
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setSvgPaths([]);
      setDetectedNodes([]);
      setLineName("Importación Múltiple");
      setLineColor("#ffffff");

      let allNodes: DetectedNode[] = [];
      let allPaths: SVGPath[] = [];
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      linesData.forEach((lineData, lineIndex) => {
        const lineColor = lineData.color || "#e91e8b";

        // Process paths
        if (lineData.paths && Array.isArray(lineData.paths)) {
          const paths = lineData.paths.map((p: any) => ({
            ...p,
            stroke: p.stroke || lineColor, // Ensure path has color
          }));
          allPaths = [...allPaths, ...paths];
        }

        // Process stations
        if (lineData.stations && Array.isArray(lineData.stations)) {
          const nodes = lineData.stations.map((station: any, i: number) => {
            const x =
              typeof station.x === "string"
                ? parseFloat(station.x)
                : Number(station.x);
            const y =
              typeof station.y === "string"
                ? parseFloat(station.y)
                : Number(station.y);

            // Update bounds
            if (!isNaN(x)) {
              minX = Math.min(minX, x);
              maxX = Math.max(maxX, x);
            }
            if (!isNaN(y)) {
              minY = Math.min(minY, y);
              maxY = Math.max(maxY, y);
            }

            const randomCatKey =
              Object.keys(PALABRAS_CLAVE)[Math.floor(Math.random() * 7)];

            return {
              id: station.id || `node-${lineIndex}-${i}`,
              x: isNaN(x) ? 0 : x,
              y: isNaN(y) ? 0 : y,
              name: station.name || `Estación ${i + 1}`,
              phi: Math.floor(Math.random() * 50) + 35,
              palabraClave: PALABRAS_CLAVE[randomCatKey][0],
              categoria: randomCatKey,
              color: lineColor, // Add color property
            };
          });
          allNodes = [...allNodes, ...nodes];
        }

        // Also try to parse viewBox to update bounds if stations are missing or weird
        if (lineData.viewBox) {
          const parts = lineData.viewBox.split(" ").map(Number);
          if (parts.length === 4) {
            minX = Math.min(minX, parts[0]);
            minY = Math.min(minY, parts[1]);
            maxX = Math.max(maxX, parts[0] + parts[2]);
            maxY = Math.max(maxY, parts[1] + parts[3]);
          }
        }
      });

      // Set global viewBox
      // Add some padding
      const padding = 50;
      const width = maxX - minX + padding * 2;
      const height = maxY - minY + padding * 2;
      const viewBox = `${minX - padding} ${minY - padding} ${width} ${height}`;

      if (minX !== Infinity) {
        setSvgViewBox(viewBox);
        console.log("Global ViewBox calculado:", viewBox);
      } else {
        setSvgViewBox("0 0 800 600");
      }

      setSvgPaths(allPaths);
      setDetectedNodes(allNodes);

      console.log(`Importadas ${linesData.length} líneas.`);
      console.log(`Total estaciones: ${allNodes.length}`);
      console.log(`Total paths: ${allPaths.length}`);

      // Create a minimal SVG representation
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"></svg>`;
      setImportedSVG(svgContent);

      // Automatically save/import each line to the app
      linesData.forEach((line) => {
        onSave(line);
      });
    } catch (error) {
      console.error("Error importing multiple lines:", error);
    }
    setIsProcessing(false);
  };
  const importLineFromJSON = (lineData: any) => {
    setIsProcessing(true);
    try {
      // Reset state completely
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setSvgPaths([]);
      setDetectedNodes([]);

      // Set line name and color
      setLineName(lineData.name || "Línea Importada");
      setLineColor(lineData.color || "#e91e8b");

      // Set viewBox
      if (lineData.viewBox) {
        setSvgViewBox(lineData.viewBox);
        console.log("ViewBox importado:", lineData.viewBox);
      }

      // Import paths
      if (lineData.paths && Array.isArray(lineData.paths)) {
        setSvgPaths(lineData.paths);
        console.log("Paths importados:", lineData.paths.length);
      }

      // Import stations
      if (lineData.stations && Array.isArray(lineData.stations)) {
        const nodes: DetectedNode[] = lineData.stations.map(
          (station: any, i: number) => {
            const randomCatKey =
              Object.keys(PALABRAS_CLAVE)[Math.floor(Math.random() * 7)];

            // Ensure coordinates are numbers
            const x =
              typeof station.x === "string"
                ? parseFloat(station.x)
                : Number(station.x);
            const y =
              typeof station.y === "string"
                ? parseFloat(station.y)
                : Number(station.y);

            return {
              id: station.id || `node-${i}`,
              x: isNaN(x) ? 0 : x,
              y: isNaN(y) ? 0 : y,
              name: station.name || `Estación ${i + 1}`,
              phi: Math.floor(Math.random() * 50) + 35,
              palabraClave: PALABRAS_CLAVE[randomCatKey][0],
              categoria: randomCatKey,
            };
          }
        );
        setDetectedNodes(nodes);
        console.log("Estaciones importadas:", nodes.length);
        if (nodes.length > 0) {
          console.log("Primera estación:", nodes[0]);
          console.log("Última estación:", nodes[nodes.length - 1]);
        }
      }

      // Create a minimal SVG representation for display purposes
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${
        lineData.viewBox || "0 0 800 600"
      }"></svg>`;
      setImportedSVG(svgContent);
    } catch (error) {
      console.error("Error importing line from JSON:", error);
    }
    setIsProcessing(false);
  };

  const updateNodeName = (id: string, name: string) => {
    setDetectedNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, name } : n))
    );
    setEditingNode(null);
  };

  const deleteNode = useCallback((id: string) => {
    setDetectedNodes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleNodeDragStart = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      setDraggingNodeId(nodeId);

      // Cachear dimensiones del SVG al iniciar el drag
      if (svgRef.current) {
        dragRef.current.svgRect = svgRef.current.getBoundingClientRect();
        dragRef.current.viewBoxParts = svgViewBox.split(" ").map(Number);
      }
    },
    [svgViewBox]
  );

  const handleNodeDrag = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingNodeId) {
      // Si no estamos arrastrando un nodo, manejamos el pan
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
      return;
    }

    // Usar valores cacheados si existen, si no, calcularlos (fallback)
    const rect =
      dragRef.current.svgRect || e.currentTarget.getBoundingClientRect();
    const viewBoxParts =
      dragRef.current.viewBoxParts.length === 4
        ? dragRef.current.viewBoxParts
        : svgViewBox.split(" ").map(Number);

    // Calcular las coordenadas del mouse en el espacio del SVG
    // teniendo en cuenta el zoom y el pan
    const scaleX = viewBoxParts[2] / rect.width;
    const scaleY = viewBoxParts[3] / rect.height;

    // Primero obtenemos la posición del mouse relativa al SVG
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Luego ajustamos por el zoom y pan aplicados al grupo <g>
    // La fórmula correcta es: (mousePos - pan) / zoom
    const x = ((mouseX - pan.x) / zoom) * scaleX + viewBoxParts[0];
    const y = ((mouseY - pan.y) / zoom) * scaleY + viewBoxParts[1];

    setDetectedNodes((prev) =>
      prev.map((node) =>
        node.id === draggingNodeId ? { ...node, x, y } : node
      )
    );
  };

  const handleNodeDragEnd = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
    dragRef.current.svgRect = null;
  };

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

  // Manejar inicio de pan
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingNodeId) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  // Desactivar cuando se hace click fuera
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
    document.addEventListener("wheel", handleWheelCapture, {
      passive: false,
      capture: true,
    });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("wheel", handleWheelCapture, true);
    };
  }, [isMapFocused]);

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

  // Memoize connection path
  const connectionPath = useMemo(() => {
    return detectedNodes
      .map((node, i) => `${i === 0 ? "M" : "L"} ${node.x} ${node.y}`)
      .join(" ");
  }, [detectedNodes]);

  // Memoize handlers for StationNode to prevent re-renders
  const handleDragStartCallback = useCallback(
    (e: React.MouseEvent, id: string) => {
      handleNodeDragStart(e, id);
    },
    []
  ); // handleNodeDragStart needs to be stable or included in deps.
  // Actually handleNodeDragStart uses state setters and refs, so it should be stable if defined with useCallback or if we just use it directly but it's defined inside the component so it changes every render.

  // Let's redefine handleNodeDragStart with useCallback in the next step or just use a wrapper here that calls the current one, but that doesn't help.
  // I need to wrap the ORIGINAL definitions.

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-white border border-gray-300">
        <h2 className="text-base font-semibold flex items-center gap-2 mb-4 text-gray-900">
          <span className="text-purple-600">🚇</span>
          {translations.importTransportLine}
        </h2>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors">
          <input
            type="file"
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer block">
            <div className="text-6xl mb-4">🖼️</div>
            <div className="text-lg font-bold text-gray-900 mb-2">
              Arrastra o selecciona una imagen del mapa
            </div>
            <div className="text-sm text-gray-600 mb-1">
              Sube una imagen del sistema de transporte
            </div>
            <div className="text-xs text-gray-500 mt-2">
              El sistema detectará automáticamente las estaciones usando IA
            </div>
            <div className="mt-4">
              <span className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-base font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                Detectar Estaciones con IA
              </span>
            </div>
          </label>
        </div>

        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
            <p className="text-xs text-gray-600 mt-2">
              {translations.processingSVG}
            </p>
          </div>
        )}
      </div>

      {importedSVG && detectedNodes.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-gray-300">
              <h3 className="text-sm font-semibold mb-3 text-gray-900">
                {translations.editStations}
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {detectedNodes.map((node, i) => (
                  <div
                    key={node.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
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
                        className="flex-1 px-2 py-1 rounded bg-white border border-purple-500 text-xs text-gray-900 focus:outline-none"
                      />
                    ) : (
                      <span
                        className="flex-1 text-xs cursor-pointer hover:text-purple-400"
                        onClick={() => setEditingNode(node.id)}
                      >
                        {node.name}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500">
                      ({Math.round(node.x)}, {Math.round(node.y)})
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        node.phi >= 50
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
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

            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-300">
              <h3 className="text-sm font-semibold mb-3 text-gray-900">
                {translations.actions}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={clear}
                  className="px-4 py-3 rounded-xl bg-gray-200 border border-gray-300 text-gray-900 font-medium text-sm hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <span>🗑</span> {translations.clean}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {translations.preview}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                  {detectedNodes.length} {translations.stations}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  ViewBox: {svgViewBox}
                </span>
              </div>
            </div>

            <div
              ref={containerRef}
              className="relative bg-gray-50 rounded-xl overflow-hidden border border-gray-300"
              style={{ touchAction: "none" }}
            >
              {/* Overlay de hover cuando el mapa no está enfocado */}
              {!isMapFocused && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-gray-200/40 backdrop-blur-[2px] z-20 rounded-xl cursor-pointer"
                  onClick={handleMapClick}
                >
                  <div className="bg-white px-6 py-3 rounded-xl border border-gray-300 shadow-2xl">
                    <p className="text-gray-900 text-sm font-semibold flex items-center gap-2">
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
                    <p className="text-white text-xs font-semibold flex items-center gap-2">
                      <span>🔍</span>
                      Usa la rueda del mouse para zoom | Arrastra para mover
                    </p>
                  </div>
                </div>
              )}

              <svg
                ref={svgRef}
                viewBox={svgViewBox}
                className={`w-full h-auto ${
                  isPanning
                    ? "cursor-grabbing"
                    : draggingNodeId
                    ? "cursor-grabbing"
                    : "cursor-grab"
                }`}
                style={{ minHeight: "800px", touchAction: "none" }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleNodeDrag}
                onMouseUp={handleNodeDragEnd}
                onMouseLeave={handleNodeDragEnd}
                onWheel={handleWheel}
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
                      stroke="rgba(156,163,175,0.15)"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* Grid background that respects viewBox */}
                  <rect
                    x={svgViewBox.split(" ")[0]}
                    y={svgViewBox.split(" ")[1]}
                    width={svgViewBox.split(" ")[2]}
                    height={svgViewBox.split(" ")[3]}
                    fill="url(#grid)"
                  />

                  {/* SVG paths imported from JSON */}
                  <BackgroundPaths paths={svgPaths} lineColor={lineColor} />

                  {/* Dynamic connection line between stations */}
                  <path
                    d={connectionPath}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.8"
                  />

                  {detectedNodes.map((node) => (
                    <StationNode
                      key={node.id}
                      node={node}
                      lineColor={lineColor}
                      isBeingDragged={draggingNodeId === node.id}
                      onDragStart={handleNodeDragStart}
                      onEdit={setEditingNode}
                      onDelete={deleteNode}
                    />
                  ))}
                </g>
              </svg>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-300">
            <h3 className="text-sm font-semibold mb-3 text-gray-900">
              {translations.instructions}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">1.</span>
                  <span>{translations.instruction1}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">2.</span>
                  <span>{translations.instruction2}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">3.</span>
                  <span>{translations.instruction3}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">4.</span>
                  <span>{translations.instruction4}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">5.</span>
                  <span>{translations.instruction5}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-400">6.</span>
                  <span>{translations.instruction6}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-indigo-100 border border-indigo-300">
              <div className="text-xs text-indigo-800">
                <strong>{translations.tip}</strong> {translations.tipText}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SVGImporter;
