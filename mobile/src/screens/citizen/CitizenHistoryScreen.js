import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useStore from '../../store';
import { citizenApi } from '../../api/citizenApi';

export default function CitizenHistoryScreen({ navigation }) {
  const { citizenWallet, setCitizenWallet } = useStore();
  const [loading, setLoading] = useState(!citizenWallet);
  const [activeTab, setActiveTab] = useState('collections'); // 'collections' | 'redemptions'

  useEffect(() => {
    if (!citizenWallet) {
      citizenApi.getWallet()
        .then(res => setCitizenWallet(res.data))
        .catch(() => Alert.alert('Error', 'Could not load history'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const transactions = citizenWallet?.transactions || [];
  const redemptions = citizenWallet?.redemptions || [];
  const totalPoints = (citizenWallet?.balance || 0).toFixed(1);
  const totalCollections = transactions.length;
  const totalGrams = transactions.reduce((sum, t) => sum + (t.weight_grams || 0), 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderCollection = ({ item, index }) => (
    <View style={[styles.historyItem, index === 0 && styles.historyItemFirst]}>
      <View style={styles.historyIconBg}>
        <MaterialCommunityIcons name="recycle" size={22} color="#16a34a" />
      </View>
      <View style={styles.historyMiddle}>
        <Text style={styles.historyTitle}>Plastic Collected</Text>
        <Text style={styles.historyWeight}>{item.weight_grams}g</Text>
        <Text style={styles.historyDate}>{formatDate(item.collected_at)}</Text>
      </View>
      <View style={styles.historyRight}>
        <View style={styles.pointsEarned}>
          <Text style={styles.pointsEarnedText}>+{item.points_awarded}</Text>
          <Text style={styles.pointsEarnedLabel}>pts</Text>
        </View>
        <View style={[styles.statusBadge, item.status === 'synced' ? styles.statusSynced : styles.statusPending]}>
          <Text style={styles.statusText}>{item.status === 'synced' ? 'Confirmed' : item.status}</Text>
        </View>
      </View>
    </View>
  );

  const renderRedemption = ({ item, index }) => (
    <View style={[styles.historyItem, index === 0 && styles.historyItemFirst]}>
      <View style={[styles.historyIconBg, { backgroundColor: '#fef3c7' }]}>
        <MaterialCommunityIcons name="tag-outline" size={22} color="#f59e0b" />
      </View>
      <View style={styles.historyMiddle}>
        <Text style={styles.historyTitle}>Points Redeemed</Text>
        <Text style={styles.historyWeight}>{item.description || 'Merchant Redemption'}</Text>
        <Text style={styles.historyDate}>{formatDate(item.redeemed_at)}</Text>
      </View>
      <View style={styles.historyRight}>
        <View style={[styles.pointsEarned, { backgroundColor: '#fef3c7' }]}>
          <Text style={[styles.pointsEarnedText, { color: '#f59e0b' }]}>-{item.points_deducted}</Text>
          <Text style={[styles.pointsEarnedLabel, { color: '#f59e0b' }]}>pts</Text>
        </View>
        <Text style={styles.inrValue}>₹{item.inr_value}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#14532d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalPoints}</Text>
          <Text style={styles.summaryLabel}>Total Points</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalCollections}</Text>
          <Text style={styles.summaryLabel}>Collections</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{(totalGrams / 1000).toFixed(1)}kg</Text>
          <Text style={styles.summaryLabel}>Plastic Saved</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['collections', 'redemptions'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'collections' ? 'Collections' : 'Redemptions'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={activeTab === 'collections' ? transactions : redemptions}
        keyExtractor={(item, i) => item.id || String(i)}
        renderItem={activeTab === 'collections' ? renderCollection : renderRedemption}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name={activeTab === 'collections' ? 'recycle' : 'tag-outline'}
              size={56} color="#d1d5db"
            />
            <Text style={styles.emptyText}>No {activeTab} yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
    backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dcfce7',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#14532d' },
  summaryRow: {
    flexDirection: 'row', backgroundColor: '#14532d',
    paddingVertical: 16, paddingHorizontal: 8,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
  summaryLabel: { fontSize: 11, color: '#86efac', marginTop: 2, textTransform: 'uppercase' },
  summaryDivider: { width: 1, backgroundColor: '#ffffff25' },
  tabs: { flexDirection: 'row', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dcfce7' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#16a34a' },
  tabText: { fontSize: 14, color: '#9ca3af', fontWeight: '600' },
  tabTextActive: { color: '#16a34a' },
  listContent: { padding: 16, gap: 8 },
  historyItem: {
    backgroundColor: '#ffffff', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  historyItemFirst: {},
  historyIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center' },
  historyMiddle: { flex: 1 },
  historyTitle: { fontSize: 14, fontWeight: '700', color: '#1f2937' },
  historyWeight: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  historyDate: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  historyRight: { alignItems: 'flex-end', gap: 6 },
  pointsEarned: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 2 },
  pointsEarnedText: { fontSize: 16, fontWeight: '800', color: '#16a34a' },
  pointsEarnedLabel: { fontSize: 11, color: '#16a34a', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusSynced: { backgroundColor: '#dcfce7' },
  statusPending: { backgroundColor: '#fef9c3' },
  statusText: { fontSize: 10, fontWeight: '600', color: '#16a34a' },
  inrValue: { fontSize: 12, color: '#f59e0b', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 15, color: '#9ca3af', marginTop: 12, fontWeight: '600' },
});
