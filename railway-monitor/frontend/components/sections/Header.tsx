import { Bell, RefreshCw } from "lucide-react";
import React from "react";

const Header: React.FC = () => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
          🚇 Dashboard PHI - Metro CDMX
        </h1>
        <p className="text-white/60 text-xs">Sistema de Análisis con NLP</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
