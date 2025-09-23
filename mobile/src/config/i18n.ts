import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import pt from '../locales/pt.json';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';
import es from '../locales/es.json';

const LANGUAGE_STORAGE_KEY = 'user_language';

const resources = {
  pt: {
    translation: pt,
  },
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
  de: {
    translation: de,
  },
  es: {
    translation: es,
  },
};

// Função para obter o idioma salvo ou usar padrão
const getInitialLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage) {
      return savedLanguage;
    }
    
    // Usar português como padrão
    return 'pt';
  } catch (error) {
    console.error('Error getting initial language:', error);
    return 'pt';
  }
};

// Função para salvar o idioma selecionado
export const saveLanguage = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// Função para obter o idioma atual
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

// Função para alterar o idioma
export const changeLanguage = async (language: string): Promise<void> => {
  try {
    await i18n.changeLanguage(language);
    await saveLanguage(language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Inicializar i18n
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();
  
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'pt',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
};

// Inicializar i18n
initI18n();

export default i18n;
