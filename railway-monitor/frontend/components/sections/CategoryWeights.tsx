import { CATEGORIES } from "@/lib/constants";
import React from "react";

const CategoryWeights: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
      <h3 className="text-xs font-medium text-white/60 mb-2">⚖️ Pesos NLP</h3>
      <div className="space-y-1.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.id} className="flex items-center gap-1.5">
              <Icon className="w-3 h-3" style={{ color: cat.color }} />
              <span className="text-[10px] flex-1">{cat.name}</span>
              <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${cat.weight * 100}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
              <span className="text-[9px] text-white/50 w-6">
                {(cat.weight * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryWeights;
