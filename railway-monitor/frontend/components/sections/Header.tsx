'use client';

import React from "react";
import { useCity } from "@/lib/CityContext";

const Header: React.FC = () => {
  const { language, translations, toggleLanguage } = useCity();

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-300">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-blue-500 to-green-500 bg-clip-text text-transparent">
          {translations.headerTitle}
        </h1>
        <p className="text-gray-600 text-xs">{translations.headerSubtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-green-400 hover:from-blue-500 hover:to-green-500 border border-gray-400 transition-all flex items-center gap-2 font-semibold text-sm"
          title={language === 'en' ? 'Switch to Deutsch' : 'Switch to English'}
        >
          <span>{language === 'en' ? '🇬🇧' : '🇩🇪'}</span>
          <span>{language === 'en' ? 'English' : 'Deutsch'}</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
