"use client";

import { useCity } from "@/lib/CityContext";
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

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-gray-900">{station.name}</h3>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium"
          style={{ backgroundColor: station.lineColor }}
        >
          {station.line}
        </span>
      </div>

      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-red-100 to-orange-100 border border-red-300 text-center">
        <div className="text-[10px] text-gray-600 mb-1">
          {translations.predominantWord}
        </div>
        <div className="text-2xl font-black text-red-700 tracking-wide animate-pulse">
          {station.palabraClave}
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-200 text-red-800">
            {station.menciones} {translations.mentions}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 mb-3">
        <div className="text-center p-2 rounded-lg bg-white/60">
          <div className="text-xl font-bold text-gray-900">
            {station.comments}
          </div>
          <div className="text-[10px] text-gray-600">
            {translations.comments}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationInfo;
