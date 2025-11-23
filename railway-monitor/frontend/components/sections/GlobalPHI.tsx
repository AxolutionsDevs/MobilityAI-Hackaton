import PHIGauge from "@/components/ui/PHIGauge";
import React from "react";

interface GlobalPHIProps {
  globalPHI: number;
}

const GlobalPHI: React.FC<GlobalPHIProps> = ({ globalPHI }) => {
  const sentimentData = [
    { l: "Positivo", v: 35, c: "#10b981" },
    { l: "Neutral", v: 25, c: "#f59e0b" },
    { l: "Negativo", v: 40, c: "#ef4444" },
  ];

  return (
    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center">
      <h3 className="text-xs font-medium text-white/60 mb-2">PHI Global</h3>
      <PHIGauge value={globalPHI} size={150} label="Sistema" />
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
