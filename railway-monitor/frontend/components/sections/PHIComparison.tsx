"use client";

import React, { useMemo } from "react";
import { GLOBAL_PHI_DATA, PHIData } from "@/lib/data/calculatePHI";
import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import { useCity } from "@/lib/CityContext";

const PHIComparison: React.FC = () => {
    const { translations } = useCity();
    const { cdmx, vienna } = GLOBAL_PHI_DATA;

    // Determinar cuál sistema tiene mejor PHI
    const betterSystem = cdmx.phi > vienna.phi ? "cdmx" : "vienna";
    const difference = Math.abs(cdmx.phi - vienna.phi);

    // Función para obtener color basado en PHI
    const getPHIColor = (phi: number): string => {
        if (phi >= 70) return "#16a34a"; // Verde - Excelente
        if (phi >= 50) return "#f59e0b"; // Amarillo - Aceptable
        if (phi >= 30) return "#ea580c"; // Naranja - Preocupante
        return "#dc2626"; // Rojo - Crítico
    };

    // Función para obtener etiqueta de estado
    const getPHILabel = (phi: number): string => {
        if (phi >= 70) return translations.excellent;
        if (phi >= 50) return translations.acceptable;
        if (phi >= 30) return translations.concerning;
        return translations.criticalPHI;
    };

    // Renderizar tarjeta de metro
    const renderMetroCard = (data: PHIData, flag: string) => {
        const color = getPHIColor(data.phi);
        const label = getPHILabel(data.phi);
        const isBetter = (data.metroName.includes("CDMX") && betterSystem === "cdmx") ||
            (data.metroName.includes("Vienna") && betterSystem === "vienna");

        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:shadow-xl transition-shadow">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">{flag}</span>
                        <h3 className="text-lg font-bold text-gray-800">{data.metroName}</h3>
                    </div>
                    {isBetter && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                            <TrendingUp className="w-4 h-4" />
                            {translations.better}
                        </div>
                    )}
                </div>

                {/* PHI Score */}
                <div className="text-center mb-6">
                    <div className="relative inline-block">
                        <svg className="w-40 h-40" viewBox="0 0 100 100">
                            {/* Background circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="8"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke={color}
                                strokeWidth="8"
                                strokeDasharray={`${(data.phi / 100) * 251.2} 251.2`}
                                strokeLinecap="round"
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-4xl font-bold" style={{ color }}>
                                {data.phi}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">PHI</div>
                        </div>
                    </div>
                    <div
                        className="mt-3 inline-block px-4 py-1 rounded-full text-sm font-semibold"
                        style={{ backgroundColor: `${color}20`, color }}
                    >
                        {label}
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">{translations.totalComplaints}</div>
                        <div className="text-2xl font-bold text-gray-800">
                            {data.totalComplaints.toLocaleString()}
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">{translations.weightedImpact}</div>
                        <div className="text-2xl font-bold text-gray-800">
                            {data.weightedSum.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Top 5 Categories by Impact */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        {translations.top5CategoriesByImpact}
                    </h4>
                    <div className="space-y-2">
                        {data.categoryBreakdown.slice(0, 5).map((cat, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium text-gray-700 truncate">
                                        {cat.category}
                                    </span>
                                    <span className="text-xs font-bold text-gray-900">
                                        {cat.impact.toFixed(1)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <span>{cat.count} {translations.complaints_plural}</span>
                                    <span>•</span>
                                    <span>{translations.weight}: {cat.weight.toFixed(2)}</span>
                                </div>
                                {/* Progress bar */}
                                <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500"
                                        style={{
                                            width: `${(cat.impact / data.categoryBreakdown[0].impact) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Activity className="w-7 h-7" />
                    {translations.passengerHappiness}
                </h2>
                <p className="text-blue-100 text-sm">
                    {translations.comparisonBased}
                </p>
                <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-xs text-blue-100 mb-1">{translations.formula}:</div>
                    <code className="text-sm font-mono">
                        PHI = 100 - [ Σ( e^(peso_del_asunto) × cantidad ) / total_quejas ] × 100
                    </code>
                </div>
            </div>

            {/* Comparison Summary */}
            <div className="bg-gray-100 rounded-2xl p-6 border-2 border-gray-200">
                <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">{translations.difference}</div>
                        <div className="text-4xl font-bold text-gray-800">
                            {difference.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">{translations.phiPoints}</div>
                    </div>
                    <div className="h-16 w-px bg-gray-300" />
                    <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">{translations.superiorSystem}</div>
                        <div className="text-2xl font-bold text-green-600">
                            {betterSystem === "cdmx" ? "🇲🇽 CDMX" : "🇦🇹 Vienna"}
                        </div>
                        <div className="text-xs text-gray-500">
                            {betterSystem === "cdmx" ? cdmx.phi : vienna.phi} PHI
                        </div>
                    </div>
                </div>
            </div>

            {/* Metro Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderMetroCard(cdmx, "🇲🇽")}
                {renderMetroCard(vienna, "🇦🇹")}
            </div>

            {/* Legend */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    {translations.phiInterpretation}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500" />
                        <span className="text-xs text-gray-700">
                            {translations.phiRange70to100}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500" />
                        <span className="text-xs text-gray-700">
                            {translations.phiRange50to69}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500" />
                        <span className="text-xs text-gray-700">
                            {translations.phiRange30to49}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500" />
                        <span className="text-xs text-gray-700">
                            {translations.phiRange0to29}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PHIComparison;
