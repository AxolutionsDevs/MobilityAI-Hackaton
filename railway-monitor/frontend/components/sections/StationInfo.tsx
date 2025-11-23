"use client";

import { useCity } from "@/lib/CityContext";
import { LINE_REPORT_DATA, STATION_REPORT_DATA } from "@/lib/constants";
import { StationData } from "@/types";
import React from "react";

interface StationInfoProps {
  station: {
    id: string;
    name: string;
    line: string;
    lineColor: string;
  } & StationData;
}

const StationInfo: React.FC<StationInfoProps> = ({ station }) => {
  const { translations } = useCity();

  // Obtener datos reales de la estación
  const stationData = STATION_REPORT_DATA[station.name];
  const topKeywords = stationData?.topKeywords || [];
  const recentComments = stationData?.recentComments || [];

  // Obtener comentarios de la línea
  const lineData = LINE_REPORT_DATA[station.line];
  const lineComments = lineData?.recentComments || [];

  return (
    <div className="space-y-4">
      {/* Info de la estación */}
      <div className="p-6 rounded-2xl bg-white border-2 border-gray-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl text-gray-900">{station.name}</h3>
          <span
            className="text-sm px-3 py-1 rounded-full text-white font-semibold shadow-md"
            style={{ backgroundColor: station.lineColor }}
          >
            {station.line}
          </span>
        </div>

        {/* Palabras clave predominantes */}
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="text-sm text-gray-700 mb-3 text-center font-bold">
            Palabras Clave Predominantes
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {topKeywords.length > 0 ? (
              topKeywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="text-sm px-3 py-1.5 rounded-full bg-blue-500 text-white font-semibold capitalize shadow-sm hover:bg-blue-600 transition-colors"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <span className="text-base text-gray-500">Sin datos</span>
            )}
          </div>
        </div>

        {/* Últimos comentarios de la estación */}
        <div className="mt-4">
          <div className="text-sm text-gray-800 mb-3 font-bold">
            Últimos Comentarios (Estación):
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {recentComments.length > 0 ? (
              recentComments.map((comment, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-gray-50 border-2 border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-1 rounded-lg bg-indigo-500 text-white font-semibold shadow-sm">
                      {comment.subject}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(comment.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-base text-gray-500 text-center py-4">
                No hay comentarios recientes
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationInfo;
