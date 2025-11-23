import { useCity } from "@/lib/CityContext";
import cdmxDataRaw from "@/lib/data/complaints_cdmx.json";
import viennaDataRaw from "@/lib/data/complaints_vienna.json";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Globe, AlertTriangle, CheckCircle } from "lucide-react";

// Define Complaint interface
interface Complaint {
  Asunto: string;
  [key: string]: any;
}

// Cast imported data to Complaint array
const cdmxData = cdmxDataRaw as Complaint[];
const viennaData = viennaDataRaw as Complaint[];

export default function ComparisonView() {
  const { translations } = useCity();

  // Normalization mapping: Vienna/CDMX variations -> Canonical Category (CDMX style)
  const SUBJECT_MAPPING: Record<string, string> = {
    // CDMX Direct Mappings (Identity)
    "Acoso": "Acoso",
    "Basura": "Basura",
    "Calor extremo": "Calor extremo",
    "Escaleras/Rampas rotas": "Escaleras/Rampas rotas",
    "Falta de aire": "Falta de aire",
    "Falta de señalización": "Falta de señalización",
    "Falta de solucion a errores de usuarios": "Atención al Cliente",
    "Falta de vigilancia": "Falta de vigilancia",
    "Fugas de agua": "Fugas de agua",
    "Iluminación fallida": "Iluminación fallida",
    "Mal olor": "Mal olor",
    "Máquinas fuera de servicio": "Máquinas fuera de servicio",
    "Personal grosero": "Personal grosero",
    "Queja General / Varios": "Queja General / Varios",
    "Retrasos": "Retrasos",
    "Robo": "Robo",
    "Saturación": "Saturación",
    "Taquillas cerradas": "Taquillas cerradas",
    "Torniquetes rotos": "Torniquetes rotos",
    "Tren lento": "Tren lento",
    "Vagones sin luz": "Vagones sin luz",
    "Vandalismo": "Vandalismo",

    // Vienna Mappings -> CDMX Equivalents
    "Allgemeine Beschwerde": "Queja General / Varios",
    "Allgemeines / Sonstiges": "Queja General / Varios",
    "Automaten defekt": "Máquinas fuera de servicio",
    "Beleuchtungsausfall (Iluminación)": "Iluminación fallida",
    "Belästigung (Acoso)": "Acoso",
    "Defekte Aufzüge/Rolltreppen": "Escaleras/Rampas rotas",
    "Diebstahl (Robo)": "Robo",
    "Entwerter Probleme (Validadores)": "Torniquetes rotos",
    "Fehlende Beschilderung": "Falta de señalización",
    "Geruchsbelästigung (Mal olor)": "Mal olor",
    "Geschlossene Schalter": "Taquillas cerradas",
    "Hitze (Calor)": "Calor extremo",
    "Langsame Fahrt (Tren lento)": "Tren lento",
    "Lärm (Ruido)": "Ruido", // No direct CDMX equivalent, keep unique
    "Mangelnde Sicherheit (Seguridad)": "Falta de vigilancia",
    "Schlechte Belüftung (Aire)": "Falta de aire",
    "Unfreundliches Personal": "Personal grosero",
    "Vandalismus (Vandalismo)": "Vandalismo",
    "Verschmutzung (Suciedad)": "Basura",
    "Verspätung (Retrasos)": "Retrasos",
    "Wasserschaden (Fugas)": "Fugas de agua"
  };

  // Helper to normalize subject
  const normalizeSubject = (subject: string): string => {
    return SUBJECT_MAPPING[subject] || subject;
  };

  // Count categories
  const countCategories = (data: Complaint[]) => {
    const counts: Record<string, number> = {};
    data.forEach((item) => {
      const category = normalizeSubject(item.Asunto);
      counts[category] = (counts[category] || 0) + 1;
    });
    return { counts, total: data.length };
  };

  const cdmxCounts = countCategories(cdmxData);
  const viennaCounts = countCategories(viennaData);

  // Get all unique categories found
  const allCategories = Array.from(new Set([
    ...Object.keys(cdmxCounts.counts),
    ...Object.keys(viennaCounts.counts)
  ])).sort();

  // Prepare data for charts
  const chartData = allCategories.map(category => {
    const cdmxVal = cdmxCounts.counts[category] || 0;
    const viennaVal = viennaCounts.counts[category] || 0;

    // Normalize to percentage of total complaints for fair comparison
    const cdmxPct = (cdmxVal / cdmxCounts.total) * 100;
    const viennaPct = (viennaVal / viennaCounts.total) * 100;

    return {
      subject: category,
      cdmx: parseFloat(cdmxPct.toFixed(1)),
      vienna: parseFloat(viennaPct.toFixed(1)),
      cdmxCount: cdmxVal,
      viennaCount: viennaVal
    };
  });

  // Statistics
  const getTopCategory = (counts: Record<string, number>) => {
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .filter(([cat]) => cat !== "Varios" && cat !== "Otros" && cat !== "Queja General / Varios")[0]?.[0] || "N/A";
  };

  const stats = {
    cdmxTotal: cdmxData.length,
    viennaTotal: viennaData.length,
    cdmxTop: getTopCategory(cdmxCounts.counts),
    viennaTop: getTopCategory(viennaCounts.counts),
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-pink-50 p-4 rounded-xl border border-pink-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-pink-700 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Metro CDMX
            </h4>
            <span className="text-xs font-semibold bg-pink-200 text-pink-800 px-2 py-1 rounded-full">
              {stats.cdmxTotal} Reportes
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-pink-900">
            <AlertTriangle className="w-4 h-4" />
            Top Problema: <span className="font-bold">{stats.cdmxTop}</span>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-green-700 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Metro Vienna
            </h4>
            <span className="text-xs font-semibold bg-green-200 text-green-800 px-2 py-1 rounded-full">
              {stats.viennaTotal} Reportes
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-900">
            <AlertTriangle className="w-4 h-4" />
            Top Problema: <span className="font-bold">{stats.viennaTop}</span>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Distribución de Problemas (Comparativa)</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
              <Radar name="CDMX (%)" dataKey="cdmx" stroke="#e91e63" fill="#e91e63" fillOpacity={0.4} />
              <Radar name="Vienna (%)" dataKey="vienna" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
              <Legend />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Porcentaje']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart for Detailed View */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Detalle por Categoría (%)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="subject" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${value}%`, 'Porcentaje']}
                cursor={{ fill: 'transparent' }}
              />
              <Legend />
              <Bar dataKey="cdmx" name="CDMX" fill="#e91e63" radius={[4, 4, 0, 0]} />
              <Bar dataKey="vienna" name="Vienna" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
