import { translations } from './translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useLanguageStore = create(
  persist(
    (set, get) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
      t: (key) => {
        const lang = get().lang;
        return translations[lang]?.[key] || translations['en']?.[key] || key;
      },
    }),
    {
      name: 'smartwaste-lang',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
