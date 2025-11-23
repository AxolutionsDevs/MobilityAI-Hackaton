'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { City, Language, Translations, getTranslations } from './translations';

interface CityContextType {
    city: City;
    language: Language;
    translations: Translations;
    toggleCity: () => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [city, setCity] = useState<City>('cdmx');

    const language: Language = city === 'cdmx' ? 'es' : 'de';
    const translations = getTranslations(city);

    const toggleCity = () => {
        setCity(prevCity => prevCity === 'cdmx' ? 'vienna' : 'cdmx');
    };

    return (
        <CityContext.Provider value={{ city, language, translations, toggleCity }}>
            {children}
        </CityContext.Provider>
    );
};

export const useCity = (): CityContextType => {
    const context = useContext(CityContext);
    if (!context) {
        throw new Error('useCity must be used within a CityProvider');
    }
    return context;
};
