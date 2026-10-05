/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  COUNTRIES, 
  LANGUAGES, 
  CURRENCIES, 
  getCountryByCode, 
  extractCurrencySymbol, 
  type CountryConfig, 
  type LanguageConfig, 
  type CurrencyConfig 
} from '../config/countriesData';
import { translate, type TranslationKey } from './translations';
import { dbService } from '../database/db';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  currentLanguageConfig: LanguageConfig;
  languages: LanguageConfig[];
  
  country: string;
  setCountry: (countryCode: string, autoSyncDefaults?: boolean) => void;
  currentCountryConfig: CountryConfig;
  countries: CountryConfig[];
  
  currency: string;
  currencySymbol: string;
  setCurrency: (currencyStr: string) => void;
  currencies: CurrencyConfig[];
  
  t: (key: TranslationKey, fallback?: string) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read initial from brandProfile or localStorage
  const initialBrand = dbService.getBrandProfile();
  const savedLang = localStorage.getItem('probaho_lang') || initialBrand?.language || 'en';
  const savedCountry = localStorage.getItem('probaho_country') || initialBrand?.country || 'US';
  const savedCurrency = initialBrand?.currency || localStorage.getItem('probaho_currency') || 'USD ($)';

  const [language, setLanguageState] = useState<string>(savedLang);
  const [country, setCountryState] = useState<string>(savedCountry);
  const [currency, setCurrencyState] = useState<string>(savedCurrency);

  // Sync brandProfile on mount and data changes
  useEffect(() => {
    const unsub = dbService.onDataChange(() => {
      const p = dbService.getBrandProfile();
      if (p) {
        if (p.language && p.language !== language) setLanguageState(p.language);
        if (p.country && p.country !== country) setCountryState(p.country);
        if (p.currency && p.currency !== currency) setCurrencyState(p.currency);
      }
    });
    return unsub;
  }, [language, country, currency]);

  // Set document dir when language changes (RTL for Arabic/Urdu)
  useEffect(() => {
    const langObj = LANGUAGES.find(l => l.code === language);
    const isRtl = langObj?.dir === 'rtl';
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('probaho_lang', language);
  }, [language]);

  const currentCountryConfig = useMemo(() => {
    return getCountryByCode(country);
  }, [country]);

  const currentLanguageConfig = useMemo(() => {
    return LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  }, [language]);

  const currencySymbol = useMemo(() => {
    return extractCurrencySymbol(currency);
  }, [currency]);

  const isRtl = currentLanguageConfig.dir === 'rtl';

  // Set Language handler
  const setLanguage = useCallback((newLang: string) => {
    setLanguageState(newLang);
    localStorage.setItem('probaho_lang', newLang);
    const profile = dbService.getBrandProfile();
    dbService.saveBrandProfile({
      ...profile,
      language: newLang
    });
  }, []);

  // Set Currency handler
  const setCurrency = useCallback((newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('probaho_currency', newCurrency);
    const profile = dbService.getBrandProfile();
    dbService.saveBrandProfile({
      ...profile,
      currency: newCurrency
    });
  }, []);

  // Set Country handler with automatic synchronization
  const setCountry = useCallback((newCountryCode: string, autoSyncDefaults: boolean = true) => {
    const targetCountry = getCountryByCode(newCountryCode);
    setCountryState(targetCountry.code);
    localStorage.setItem('probaho_country', targetCountry.code);

    const profile = dbService.getBrandProfile();
    const updatedProfile = { ...profile, country: targetCountry.code };

    if (autoSyncDefaults) {
      // Sync currency to target country currency
      setCurrencyState(targetCountry.currencyFormatted);
      localStorage.setItem('probaho_currency', targetCountry.currencyFormatted);
      updatedProfile.currency = targetCountry.currencyFormatted;
      
      // If profile doesn't have phone, prefill with country dial code
      if (!profile.phone || profile.phone === '+1 (555) 019-2834') {
        updatedProfile.phone = `${targetCountry.phoneCode} `;
      }
    }

    dbService.saveBrandProfile(updatedProfile);
  }, []);

  // Translation function
  const t = useCallback((key: TranslationKey, fallback?: string): string => {
    return translate(language, key, fallback);
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    currentLanguageConfig,
    languages: LANGUAGES,
    
    country,
    setCountry,
    currentCountryConfig,
    countries: COUNTRIES,
    
    currency,
    currencySymbol,
    setCurrency,
    currencies: CURRENCIES,
    
    t,
    isRtl
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export const useLocalization = useTranslation;
