import AsyncStorage from '@react-native-async-storage/async-storage';

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';
const CACHE_PREFIX = 'sw_trans_v1_';
const CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

export const translateText = async (text, targetLang) => {
  if (!text || targetLang === 'en') return text;

  const langPair = `en|${targetLang === 'hi' ? 'hi' : 'hi'}`;
  const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=${langPair}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const translateAllKeys = async (enTranslations, targetLang) => {
  if (targetLang !== 'hi') return null; // Only call API for Hindi

  const cacheKey = `${CACHE_PREFIX}${targetLang}`;

  // Check cache
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        console.log('Using cached translations for', targetLang);
        return data;
      }
    }
  } catch (e) {}

  // Translate all keys via MyMemory
  // Batch to avoid rate limiting — translate in groups of 5
  const keys = Object.keys(enTranslations);
  const values = Object.values(enTranslations);
  const translated = {};

  const BATCH_SIZE = 5;
  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batchKeys = keys.slice(i, i + BATCH_SIZE);
    const batchValues = values.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batchValues.map(text => translateText(text, targetLang))
    );

    results.forEach((result, idx) => {
      if (result.status === 'fulfilled' && result.value) {
        translated[batchKeys[idx]] = result.value;
      }
    });

    // Small delay to avoid rate limit
    if (i + BATCH_SIZE < keys.length) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // Cache result
  if (Object.keys(translated).length > 0) {
    await AsyncStorage.setItem(
      cacheKey,
      JSON.stringify({ data: translated, timestamp: Date.now() })
    );
    console.log(`Cached ${Object.keys(translated).length} Hindi translations`);
  }

  return Object.keys(translated).length > 0 ? translated : null;
};
