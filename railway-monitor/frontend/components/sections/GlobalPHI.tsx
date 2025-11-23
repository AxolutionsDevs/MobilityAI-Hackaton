'use client';

import PHIGauge from "@/components/ui/PHIGauge";
import { useCity } from "@/lib/CityContext";
import React, { useMemo } from "react";

interface GlobalPHIProps {
  globalPHI: number;
}

const GlobalPHI: React.FC<GlobalPHIProps> = ({ globalPHI }) => {
  const { translations } = useCity();

  const sentimentData = useMemo(() => [
    { l: translations.positive, v: 35, c: "#10b981" },
    { l: translations.neutral, v: 25, c: "#f59e0b" },
    { l: translations.negative, v: 40, c: "#ef4444" },
  ], [translations]);

  return (
    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center">
      <h3 className="text-xs font-medium text-white/60 mb-2">{translations.globalPHITitle}</h3>
      <PHIGauge value={globalPHI} size={150} label={translations.system} />
      <div className="grid grid-cols-3 gap-1 mt-3">
        {sentimentData.map((s) => (
          <div
            key={s.l}
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${s.c}20` }}
          >
            <div className="text-base font-bold" style={{ color: s.c }}>
              {s.v}%
            </div>
            <div className="text-[9px] text-white/60">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalPHI;
