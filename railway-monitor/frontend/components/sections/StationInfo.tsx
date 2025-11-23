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
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{station.name}</h3>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full"
          style={{ backgroundColor: station.lineColor }}
        >
          {station.line}
        </span>
      </div>

      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-red-500/30 to-orange-500/30 border border-red-500/40 text-center">
        <div className="text-[10px] text-white/60 mb-1">
          🔥 PALABRA PREDOMINANTE
        </div>
        <div className="text-2xl font-black text-white tracking-wide animate-pulse">
          {station.palabraClave}
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
            {station.menciones} menciones
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-center p-2 rounded-lg bg-white/10">
          <div className="text-xl font-bold">{station.phi}</div>
          <div className="text-[10px] text-white/60">PHI</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/10">
          <div className="text-xl font-bold">{station.comments}</div>
          <div className="text-[10px] text-white/60">Comentarios</div>
        </div>
      </div>
    </div>
  );
};

export default StationInfo;
