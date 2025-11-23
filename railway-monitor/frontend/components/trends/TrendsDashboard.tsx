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
  Filter,
  Zap
} from 'lucide-react';
import { useCity } from '@/lib/CityContext';
import rawData from '@/lib/data/complaints_cdmx.json';

// ------------------------------------------------------------------
// 1. DEFINICIÓN DE TIPOS
// ------------------------------------------------------------------

interface Ticket {
  Nombre_remitente: string;
  Email_remitente: string;
  Nombre_destinatario: string;
  Email_destinatario: string;
  Asunto: string;
  Contenido: string;
  Fecha: string;
  "Message-ID": string;
  NombredeEstacion: string;
  IdEstacion: string;
  Linea: string;
}

// ------------------------------------------------------------------
// 2. COMPONENTE PRINCIPAL
// ------------------------------------------------------------------

export default function TrendsDashboard() {
  const { translations } = useCity();
  // "week" por defecto, pero puedes cambiarlo a "month" o "all"
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all');

  // ----------------------------------------------------------------
  // 3. LÓGICA DE PROCESAMIENTO DE DATOS
  // ----------------------------------------------------------------
  
  const processedStats = useMemo(() => {
    // Convertir datos crudos al tipo Ticket (el JSON ya tiene la estructura correcta)
    const tickets = rawData as unknown as Ticket[];
    
    // Encontrar la fecha más reciente en el dataset para usarla como referencia "Hoy"
    // Esto es importante porque si el dataset es de 2024 y estamos en 2025, "última semana" saldría vacía.
    const dates = tickets.map(t => new Date(t.Fecha).getTime());
    const maxDate = new Date(Math.max(...dates));
    const minDate = new Date(Math.min(...dates));
    
    // Referencia de tiempo (usamos la fecha máxima del dataset como "ahora" para la demo)
    const now = maxDate; 

    let filteredData = tickets;

    // Filtrar por rango de tiempo relativo a la última fecha del dataset
    if (timeRange === 'week') {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredData = filteredData.filter(d => new Date(d.Fecha) >= cutoff);
    } else if (timeRange === 'month') {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredData = filteredData.filter(d => new Date(d.Fecha) >= cutoff);
    }
    // 'all' no filtra fecha, muestra todo el dataset

    // A. Top Crítico (Ranking Estaciones)
    const stationCounts: Record<string, number> = {};
    filteredData.forEach(d => {
      if (d.NombredeEstacion) {
        stationCounts[d.NombredeEstacion] = (stationCounts[d.NombredeEstacion] || 0) + 1;
      }
    });

    const topStations = Object.entries(stationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // B. Distribución por Línea (Donut)
    const lineCounts: Record<string, number> = {};
    filteredData.forEach(d => {
      // Limpiar nombre de línea (a veces viene como int o string)
      const linea = String(d.Linea || translations.unknown);
      lineCounts[linea] = (lineCounts[linea] || 0) + 1;
    });
    
    const lineDistribution = Object.entries(lineCounts)
      .map(([name, value]) => ({ 
        name: name.startsWith('Línea') || name.startsWith('Linea') || name.startsWith('Line') ? name : `${translations.line} ${name}`, 
        value 
      }))
      .sort((a, b) => b.value - a.value); // Ordenar para mejor visualización

    // C. Sismógrafo (Timeline)
    const timelineCounts: Record<string, number> = {};
    filteredData.forEach(d => {
      const dateObj = new Date(d.Fecha);
      if (isNaN(dateObj.getTime())) return;

      // Agrupación dinámica
      let key;
      if (timeRange === 'week' || timeRange === 'month') {
         // Agrupar por día
         key = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      } else {
         // Si es 'all' (muchos datos), agrupar por Mes-Año para no saturar
         const diffDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 3600 * 24);
         if (diffDays > 60) {
             key = dateObj.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
         } else {
             key = dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
         }
      }
      
      timelineCounts[key] = (timelineCounts[key] || 0) + 1;
    });

    // Ordenar timeline por fecha real (recuperando un ejemplo de fecha del key o usando un map auxiliar)
    // Método simplificado: crear array y ordenar.
    // Nota: Para ordenar correctamente strings como "ene 2024", necesitamos lógica extra.
    // Vamos a simplificar: usar timestamp como key auxiliar para ordenar y luego formatear.
    
    const timelineMap = new Map<number, number>();
    filteredData.forEach(d => {
        const dateObj = new Date(d.Fecha);
        if (isNaN(dateObj.getTime())) return;
        
        // Normalizar fecha al inicio del periodo (día o mes)
        const normalizedDate = new Date(dateObj);
        normalizedDate.setHours(0,0,0,0);
        if (timeRange === 'all' && (maxDate.getTime() - minDate.getTime()) > (60 * 24 * 3600 * 1000)) {
            normalizedDate.setDate(1); // Primer día del mes
        }
        
        const timeKey = normalizedDate.getTime();
        timelineMap.set(timeKey, (timelineMap.get(timeKey) || 0) + 1);
    });

    const timelineData = Array.from(timelineMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([timestamp, count]) => {
            const date = new Date(timestamp);
            let label = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
            if (timeRange === 'all' && (maxDate.getTime() - minDate.getTime()) > (60 * 24 * 3600 * 1000)) {
                 label = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
            }
            return { date: label, count, timestamp };
        });

    return { topStations, lineDistribution, timelineData, total: filteredData.length };
  }, [timeRange]);

  // Colores para gráficas
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
  const BAR_COLORS = ['#ef4444', '#ef4444', '#f97316', '#f97316', '#eab308']; // Rojo -> Amarillo

  return (
    <div className="w-full p-6 bg-white border border-gray-300 rounded-2xl shadow-2xl text-gray-900 my-8">
      
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <Activity className="w-6 h-6 text-blue-600" />
            {translations.trends}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {translations.trendsSubtitle}
          </p>
        </div>

        <div className="flex bg-gray-200 p-1 rounded-lg border border-gray-300">
          {(['all', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                timeRange === range 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-300'
              }`}
            >
              {range === 'all' ? translations.historical : range === 'week' ? translations.last7Days : translations.last30Days}
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
            {translations.top5CriticalStations}
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
            {translations.distributionByLine}
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
              <span className="text-xs text-gray-600">{translations.complaints}</span>
            </div>
          </div>
        </div>

        {/* C. EL SISMÓGRAFO (Timeline) - Span 12 cols (Full Width) */}
        <div className="lg:col-span-12 bg-gray-100 p-5 rounded-xl border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
              <Zap className="w-4 h-4 text-green-500" />
              {translations.complaintVolume}
            </h3>
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
