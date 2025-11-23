import { KPICardData } from "@/types";
import React from "react";

interface KPICardProps {
  data: KPICardData;
}

const KPICard: React.FC<KPICardProps> = ({ data }) => {
  const Icon = data.icon;

  return (
    <div className="p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center gap-1 text-white/60 text-xs mb-1">
        <Icon className="w-3 h-3" />
        {data.label}
      </div>
      <div className="text-2xl font-bold">{data.value}</div>
      <div className="text-xs text-white/50">{data.sub}</div>
    </div>
  );
};

export default KPICard;
