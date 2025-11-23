"use client";

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  AlertOctagon, 
  Activity, 
  Calendar,
  Filter,
  Zap
} from 'lucide-react';

// ------------------------------------------------------------------
// 1. DEFINICIÓN DE TIPOS (Basado en tu Dataset)
// ------------------------------------------------------------------

interface Ticket {
  Nombre_remitente: string;
  Email_remitente: string;
  Nombre_destinatario: string;
  Email_destinatario: string;
  Asunto: string;
  Contenido: string;
  Fecha: string; // ISO string
  "Message-ID": string;
  NombredeEstacion: string;
  IdEstacion: string;
  Linea: string;
}

// ------------------------------------------------------------------
// 2. GENERADOR DE DATOS MOCK (Para simular el backend)
// ------------------------------------------------------------------

const ESTACIONES = [
  { nombre: "Estación Central", id: "ST-01", linea: "1" },
  { nombre: "Plaza Norte", id: "ST-02", linea: "1" },
  { nombre: "Terminal Sur", id: "ST-03", linea: "2" },
  { nombre: "Centro Cívico", id: "ST-04", linea: "A" },
  { nombre: "Parque Industrial", id: "ST-05", linea: "B" },
  { nombre: "Av. Universidad", id: "ST-06", linea: "1" },
  { nombre: "Mercado Viejo", id: "ST-07", linea: "2" },
];

const generateMockData = (count: number): Ticket[] => {
  const data: Ticket[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    // Random date within last 30 days
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    const estacion = ESTACIONES[Math.floor(Math.random() * ESTACIONES.length)];

    data.push({
      Nombre_remitente: `Usuario ${i}`,
      Email_remitente: `user${i}@example.com`,
      Nombre_destinatario: "Soporte",
      Email_destinatario: "soporte@railway.com",
      Asunto: "Reporte de incidente",
      Contenido: "Descripción del problema...",
      Fecha: date.toISOString(),
      "Message-ID": `MSG-${i}`,
      NombredeEstacion: estacion.nombre,
      IdEstacion: estacion.id,
      Linea: estacion.linea
    });
  }
  return data.sort((a, b) => new Date(a.Fecha).getTime() - new Date(b.Fecha).getTime());
};

// Datos iniciales (simulando fetch)
const MOCK_RAW_DATA = generateMockData(500);

// ------------------------------------------------------------------
// 3. COMPONENTE PRINCIPAL
// ------------------------------------------------------------------

export default function TrendsDashboard() {
  const [timeRange, setTimeRange] = useState<'24h' | 'week' | 'month'>('week');

  // ----------------------------------------------------------------
  // 4. LÓGICA DE PROCESAMIENTO DE DATOS (ProcessData)
  // ----------------------------------------------------------------
  
  const processedStats = useMemo(() => {
    const now = new Date();
    let filteredData = MOCK_RAW_DATA;

    // Filtrar por rango de tiempo
    if (timeRange === '24h') {
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filteredData = filteredData.filter(d => new Date(d.Fecha) >= cutoff);
    } else if (timeRange === 'week') {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredData = filteredData.filter(d => new Date(d.Fecha) >= cutoff);
    } else { // month
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredData = filteredData.filter(d => new Date(d.Fecha) >= cutoff);
    }

    // A. Top Crítico (Ranking Estaciones)
    const stationCounts: Record<string, number> = {};
    filteredData.forEach(d => {
      stationCounts[d.NombredeEstacion] = (stationCounts[d.NombredeEstacion] || 0) + 1;
    });

    const topStations = Object.entries(stationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // B. Distribución por Línea (Donut)
    const lineCounts: Record<string, number> = {};
    filteredData.forEach(d => {
      lineCounts[d.Linea] = (lineCounts[d.Linea] || 0) + 1;
    });
    
    const lineDistribution = Object.entries(lineCounts)
      .map(([name, value]) => ({ name: `Línea ${name}`, value }));

    // C. Sismógrafo (Timeline)
    const timelineCounts: Record<string, number> = {};
    filteredData.forEach(d => {
      const dateObj = new Date(d.Fecha);
      // Agrupar por hora si es 24h, por día si es semana/mes
      const key = timeRange === '24h' 
        ? `${dateObj.getHours()}:00`
        : dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      
      timelineCounts[key] = (timelineCounts[key] || 0) + 1;
    });

    // Asegurar orden cronológico para la gráfica (esto es simplificado para el mock)
    // En producción usarías librerías como date-fns para rellenar huecos de tiempo
    const timelineData = Object.entries(timelineCounts)
      .map(([date, count]) => ({ date, count }));

    return { topStations, lineDistribution, timelineData, total: filteredData.length };
  }, [timeRange]);

  // Colores para gráficas
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6'];
  const BAR_COLORS = ['#ef4444', '#ef4444', '#f97316', '#f97316', '#eab308']; // Rojo -> Amarillo

  return (
    <div className="w-full p-6 bg-white border border-gray-300 rounded-2xl shadow-2xl text-gray-900 my-8">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <Activity className="w-6 h-6 text-blue-600" />
            Centro de Comando: Tendencias
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Análisis de incidentes en tiempo real y patrones históricos.
          </p>
        </div>

        <div className="flex bg-gray-200 p-1 rounded-lg border border-gray-300">
          {(['24h', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                timeRange === range 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300'
              }`}
            >
              {range === '24h' ? 'Últimas 24h' : range === 'week' ? 'Esta Semana' : 'Este Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* A. TOP CRÍTICO (Ranking) - Span 7 cols */}
        <div className="lg:col-span-7 bg-gray-100 p-5 rounded-xl border border-gray-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertOctagon className="w-24 h-24 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
            <TrendingUp className="w-4 h-4 text-red-500" />
            Top 5 Estaciones Críticas
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={processedStats.topStations} margin={{ left: 20, right: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#d1d5db" opacity={0.5} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fill: '#4b5563', fontSize: 12 }} 
                  width={120}
                  interval={0}
                />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6', opacity: 0.5 }}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', color: '#374151' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {processedStats.topStations.map((entry: { name: string; count: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* B. DISTRIBUCIÓN POR LÍNEA (Donut) - Span 5 cols */}
        <div className="lg:col-span-5 bg-gray-100 p-5 rounded-xl border border-gray-300 relative">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-blue-600">
            <Filter className="w-4 h-4 text-blue-500" />
            Distribución por Línea
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={processedStats.lineDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {processedStats.lineDistribution.map((entry: { name: string; value: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', color: '#374151' }}
                  itemStyle={{ color: '#4b5563' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#6b7280' }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
              <span className="text-3xl font-bold text-gray-900">{processedStats.total}</span>
              <span className="text-xs text-gray-600">Quejas</span>
            </div>
          </div>
        </div>

        {/* C. EL SISMÓGRAFO (Timeline) - Span 12 cols (Full Width) */}
        <div className="lg:col-span-12 bg-gray-100 p-5 rounded-xl border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
              <Zap className="w-4 h-4 text-green-500" />
              Volumen de Quejas (Sismógrafo)
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Actualizado ahora
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedStats.timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" opacity={0.5} vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#6b7280" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d1d5db', color: '#374151' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVolume)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

