'use client';

import { Bell, RefreshCw } from "lucide-react";
import React from "react";
import { useCity } from "@/lib/CityContext";

const Header: React.FC = () => {
  const { city, translations, toggleCity } = useCity();

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
          {translations.headerTitle}
        </h1>
        <p className="text-white/60 text-xs">{translations.headerSubtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleCity}
          className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 border border-white/20 transition-all flex items-center gap-2 font-semibold text-sm"
          title={city === 'cdmx' ? 'Cambiar a Wien' : 'Wechsel zu CDMX'}
        >
          <span>{city === 'cdmx' ? '🇲🇽' : '🇦🇹'}</span>
          <span>{city === 'cdmx' ? 'CDMX' : 'Wien'}</span>
        </button>
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
