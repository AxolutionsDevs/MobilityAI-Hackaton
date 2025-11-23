'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { City, Language, Translations, getTranslations } from './translations';

interface CityContextType {
    city: City;
    language: Language;
    translations: Translations;
    selectedMapCity: City;
    toggleCity: () => void;
    toggleLanguage: () => void;
    setSelectedMapCity: (city: City) => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [city, setCity] = useState<City>('cdmx');
    const [selectedMapCity, setSelectedMapCity] = useState<City>('cdmx');

    const language: Language = city === 'cdmx' ? 'en' : 'de';
    const translations = getTranslations(city);

    const toggleCity = () => {
        setCity(prevCity => prevCity === 'cdmx' ? 'vienna' : 'cdmx');
    };

    const toggleLanguage = () => {
        // Cambiar idioma y automáticamente cambiar el mapa
        setCity(prevCity => {
            const newCity = prevCity === 'cdmx' ? 'vienna' : 'cdmx';
            setSelectedMapCity(newCity);
            return newCity;
        });
    };

    return (
        <CityContext.Provider value={{ city, language, translations, selectedMapCity, toggleCity, toggleLanguage, setSelectedMapCity }}>
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
