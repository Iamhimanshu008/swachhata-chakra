import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { syncApi } from '../../api/syncApi';
import {
  getPendingTransactions,
  markTransactionsSynced,
  clearSyncedTransactions,
  getTodayStats
} from '../../services/localDB';

// Matches backend WASTE_TYPE_MULTIPLIER in sync.py
const WASTE_TYPE_MULTIPLIER = {
  plastic: 1.0,
  organic: 0.5,
  paper:   0.8,
  other:   0.3,
};

const calculateEstimatedPoints = (transactions) => {
  return transactions.reduce((total, t) => {
    const basePoints = (t.weight_grams || 0) / 100; // 100g = 1 point
    const gradeMultiplier =
      t.ai_grade === 'A' ? 1.5 :
      t.ai_grade === 'B' ? 1.0 : 0.5;
    const typeMultiplier =
      WASTE_TYPE_MULTIPLIER[t.waste_type] ?? 1.0;
    return total + Math.min(basePoints * gradeMultiplier * typeMultiplier, 30);
  }, 0);
};

export default function AfternoonSyncScreen({ navigation, route }) {
  const wardNo = route?.params?.ward_no || 0;
  const [pending, setPending] = useState([]);
  const [todayStats, setTodayStats] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    const txns = await getPendingTransactions();
    const stats = await getTodayStats();
    setPending(txns);
    setTodayStats(stats);
  };

  const handleUpload = async () => {
    if (pending.length === 0) {
      Alert.alert('Nothing to Sync', 'No pending transactions found.');
      return;
    }
    setUploading(true);
    setUploadResult(null);
    try {
      const payload = pending.map(tx => ({
        house_id: tx.house_id,
        weight_grams: tx.weight_grams,
        is_manual_override: tx.is_manual_override === 1,
        is_ble_verified: tx.is_ble_verified === 1,
        waste_type: tx.waste_type || 'plastic',
        collected_at: tx.collected_at,
        notes: tx.notes || null,
      }));

      const res = await syncApi.uploadBatch(wardNo, payload);
      const { total_processed, successful, failed } = res.data;

      // Mark synced in local DB
      await markTransactionsSynced(pending.map(t => t.id));
      await clearSyncedTransactions();

      setUploadResult({ success: true, total_processed, successful, failed });
      await loadPending();
    } catch (err) {
      setUploadResult({ success: false, error: err.message });
      Alert.alert('Upload Failed', 'Check internet connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const totalGrams = pending.reduce((s, t) => s + (t.weight_grams || 0), 0);
  const manualCount = pending.filter(t => t.is_manual_override).length;
  const estimatedPoints = Math.round(calculateEstimatedPoints(pending) * 10) / 10;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#14532d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Afternoon Sync</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Today's Collection Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{pending.length}</Text>
              <Text style={styles.summaryLabel}>Pending Uploads</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{(totalGrams / 1000).toFixed(1)}kg</Text>
              <Text style={styles.summaryLabel}>Total Plastic</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{estimatedPoints}</Text>
              <Text style={styles.summaryLabel}>Est. Points</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, manualCount > 0 && styles.warningValue]}>{manualCount}</Text>
              <Text style={styles.summaryLabel}>Manual Override</Text>
            </View>
          </View>
        </View>

        {/* Fraud Warning */}
        {manualCount > 0 && (
          <View style={styles.warningCard}>
            <Ionicons name="warning-outline" size={20} color="#f59e0b" />
            <Text style={styles.warningText}>
              {manualCount} manual override{manualCount > 1 ? 's' : ''} detected. These will be flagged for admin review.
            </Text>
          </View>
        )}

        {/* Upload Button */}
        <TouchableOpacity
          style={[styles.uploadBtn, (uploading || pending.length === 0) && styles.uploadBtnDisabled]}
          onPress={handleUpload}
          disabled={uploading || pending.length === 0}
        >
          {uploading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <MaterialCommunityIcons name="cloud-upload-outline" size={24} color="#ffffff" />
          )}
          <Text style={styles.uploadBtnText}>
            {uploading ? 'Uploading...' : `Upload ${pending.length} Transactions`}
          </Text>
        </TouchableOpacity>

        {/* Upload Result */}
        {uploadResult && (
          <View style={[styles.resultCard, uploadResult.success ? styles.resultSuccess : styles.resultError]}>
            <Ionicons
              name={uploadResult.success ? 'checkmark-circle' : 'alert-circle'}
              size={28}
              color={uploadResult.success ? '#16a34a' : '#dc2626'}
            />
            <View style={{ flex: 1 }}>
              {uploadResult.success ? (
                <>
                  <Text style={styles.resultTitle}>Upload Successful! 🎉</Text>
                  <Text style={styles.resultDetail}>Processed: {uploadResult.total_processed}</Text>
                  <Text style={styles.resultDetail}>Successful: {uploadResult.successful}</Text>
                  {uploadResult.failed > 0 && (
                    <Text style={[styles.resultDetail, { color: '#dc2626' }]}>Failed: {uploadResult.failed}</Text>
                  )}
                  <Text style={styles.resultDetail}>Points credited to citizens' wallets!</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.resultTitle, { color: '#dc2626' }]}>Upload Failed</Text>
                  <Text style={styles.resultDetail}>{uploadResult.error}</Text>
                </>
              )}
            </View>
          </View>
        )}

        {/* Pending list preview */}
        {pending.length > 0 && (
          <>
            <Text style={styles.listTitle}>Pending Transactions ({pending.length})</Text>
            {pending.slice(0, 8).map((tx, i) => (
              <View key={tx.id || i} style={styles.txItem}>
                <MaterialCommunityIcons name="recycle" size={18} color="#16a34a" />
                <Text style={styles.txHouseId}>{tx.house_id}</Text>
                <Text style={styles.txWeight}>{tx.weight_grams}g</Text>
                {tx.is_manual_override ? (
                  <Ionicons name="warning" size={14} color="#f59e0b" />
                ) : (
                  <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                )}
              </View>
            ))}
            {pending.length > 8 && (
              <Text style={styles.moreText}>+{pending.length - 8} more...</Text>
            )}
          </>
        )}

        {pending.length === 0 && !uploadResult && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="check-all" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>All Synced!</Text>
            <Text style={styles.emptyText}>No pending transactions to upload.</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
    backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dcfce7',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#14532d' },
  content: { padding: 16 },
  summaryCard: {
    backgroundColor: '#14532d', borderRadius: 16, padding: 20, marginBottom: 14,
    elevation: 4,
  },
  summaryTitle: { fontSize: 14, color: '#86efac', fontWeight: '600', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  summaryItem: { width: '45%' },
  summaryValue: { fontSize: 28, fontWeight: '900', color: '#ffffff' },
  warningValue: { color: '#fbbf24' },
  summaryLabel: { fontSize: 11, color: '#86efac', marginTop: 2 },
  warningCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#fef9c3', borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: '#fde68a',
  },
  warningText: { flex: 1, fontSize: 13, color: '#92400e', fontWeight: '500' },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#16a34a', borderRadius: 14, padding: 18, marginBottom: 16,
    elevation: 4, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  uploadBtnDisabled: { backgroundColor: '#9ca3af', elevation: 0 },
  uploadBtnText: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
  resultCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    borderRadius: 12, padding: 16, marginBottom: 16,
  },
  resultSuccess: { backgroundColor: '#dcfce7' },
  resultError: { backgroundColor: '#fee2e2' },
  resultTitle: { fontSize: 14, fontWeight: '700', color: '#14532d', marginBottom: 4 },
  resultDetail: { fontSize: 12, color: '#374151' },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#14532d', marginBottom: 10 },
  txItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#ffffff', borderRadius: 12, padding: 12, marginBottom: 8,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2,
  },
  txHouseId: { flex: 1, fontSize: 13, fontWeight: '600', color: '#1f2937' },
  txWeight: { fontSize: 14, fontWeight: '700', color: '#16a34a' },
  moreText: { textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#6b7280', marginTop: 8 },
});
