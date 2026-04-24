import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { useLanguageStore } from '../i18n';
import { translations } from '../i18n/translations';

// Simple in-memory cache shared across all AutoText instances
const translationMemCache = {};

const fetchTranslation = async (text, lang) => {
  if (!text || lang === 'en') return text;

  const cacheKey = `${lang}:${text}`;
  if (translationMemCache[cacheKey]) return translationMemCache[cacheKey];

  if (lang === 'hi') {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      const data = await res.json();
      if (data.responseStatus === 200) {
        const result = data.responseData.translatedText;
        translationMemCache[cacheKey] = result;
        return result;
      }
    } catch (e) {
      console.log('AutoText API error:', e.message);
    }
  }

  return text; // Fallback to original
};

const AutoText = ({ children, style, ...props }) => {
  const lang = useLanguageStore(state => state.lang);
  const [translated, setTranslated] = useState(children);

  useEffect(() => {
    if (typeof children !== 'string' || !children.trim()) return;

    // For English — show original immediately
    if (lang === 'en') {
      setTranslated(children);
      return;
    }

    // For Chhattisgarhi — use JSON lookup
    if (lang === 'cg') {
      const enKeys = Object.keys(translations.en);
      const match = enKeys.find(k => translations.en[k] === children);
      if (match && translations.cg[match]) {
        setTranslated(translations.cg[match]);
      }
      return;
    }

    // For Hindi — check apiCache in store first
    const { apiCache } = useLanguageStore.getState();
    if (apiCache?.hi) {
      const enKeys = Object.keys(translations.en);
      const match = enKeys.find(k => translations.en[k] === children);
      if (match && apiCache.hi[match]) {
        setTranslated(apiCache.hi[match]);
        return;
      }
    }

    // Fetch from API
    let cancelled = false;
    fetchTranslation(children, lang).then(result => {
      if (!cancelled && result) setTranslated(result);
    });
    return () => { cancelled = true; };

  }, [children, lang]);

  return <Text style={style} {...props}>{translated}</Text>;
};

export default AutoText;
