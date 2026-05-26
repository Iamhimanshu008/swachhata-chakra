import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: run: npx expo install expo-sqlite
// For now using AsyncStorage as SQLite fallback

export const getDB = async () => null;

export const saveCitizens = async (citizens) => {
  await AsyncStorage.setItem('offline_citizens', JSON.stringify(citizens));
  return citizens.length;
};

export const getCitizenByQR = async (qrHash) => {
  const data = await AsyncStorage.getItem('offline_citizens');
  if (!data) return null;
  const citizens = JSON.parse(data);
  return citizens.find(c => c.qr_hash === qrHash || c.house_id === qrHash);
};

export const searchCitizens = async (query) => {
  const data = await AsyncStorage.getItem('offline_citizens');
  if (!data) return [];
  const citizens = JSON.parse(data);
  const q = query.toLowerCase();
  return citizens.filter(c => (c.name && c.name.toLowerCase().includes(q)) || (c.house_id && c.house_id.toLowerCase().includes(q))).slice(0, 20);
};

export const getCitizenCount = async () => {
  const data = await AsyncStorage.getItem('offline_citizens');
  if (!data) return 0;
  return JSON.parse(data).length;
};

const getTxs = async () => {
  const data = await AsyncStorage.getItem('offline_transactions');
  return data ? JSON.parse(data) : [];
};

export const saveTransaction = async (tx) => {
  const txs = await getTxs();
  const id = tx.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2,6)}`;
  const newTx = {
    id,
    house_id: tx.house_id,
    weight_grams: tx.weight_grams,
    is_manual_override: tx.is_manual_override ? 1 : 0,
    is_ble_verified: tx.is_ble_verified ? 1 : 0,
    waste_type: tx.waste_type || 'plastic',
    collected_at: tx.collected_at || new Date().toISOString(),
    notes: tx.notes || null,
    synced: 0
  };
  txs.push(newTx);
  await AsyncStorage.setItem('offline_transactions', JSON.stringify(txs));
  return id;
};

export const getPendingTransactions = async () => {
  const txs = await getTxs();
  return txs.filter(t => t.synced === 0).sort((a, b) => a.collected_at.localeCompare(b.collected_at));
};

export const getTodayTransactions = async () => {
  const txs = await getTxs();
  const today = new Date().toISOString().split('T')[0];
  const data = await AsyncStorage.getItem('offline_citizens');
  const citizens = data ? JSON.parse(data) : [];
  
  return txs
    .filter(t => t.collected_at.startsWith(today))
    .sort((a, b) => b.collected_at.localeCompare(a.collected_at))
    .map(t => {
      const citizen = citizens.find(c => c.house_id === t.house_id);
      return { ...t, citizen_name: citizen ? citizen.name : null };
    });
};

export const markTransactionsSynced = async (ids) => {
  const txs = await getTxs();
  const updated = txs.map(t => ids.includes(t.id) ? { ...t, synced: 1 } : t);
  await AsyncStorage.setItem('offline_transactions', JSON.stringify(updated));
};

export const getTodayStats = async () => {
  const txs = await getTxs();
  const today = new Date().toISOString().split('T')[0];
  const todayTxs = txs.filter(t => t.collected_at.startsWith(today) && t.synced === 0);
  
  return {
    total_collections: todayTxs.length,
    total_grams: todayTxs.reduce((sum, t) => sum + (t.weight_grams || 0), 0),
    manual_count: todayTxs.reduce((sum, t) => sum + (t.is_manual_override ? 1 : 0), 0)
  };
};

export const clearSyncedTransactions = async () => {
  const txs = await getTxs();
  const pending = txs.filter(t => t.synced === 0);
  await AsyncStorage.setItem('offline_transactions', JSON.stringify(pending));
};
