import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ActivityIndicator, ScrollView, TextInput
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useStore from '../../store';
import { syncApi } from '../../api/syncApi';
import { saveCitizens, getCitizenCount } from '../../services/localDB';

export default function MorningSyncScreen({ navigation }) {
  const { user } = useStore();
  const [wardNo, setWardNo] = useState(user?.ward_no?.toString() || '');
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [cachedCount, setCachedCount] = useState(0);

  useEffect(() => {
    getCitizenCount().then(setCachedCount);
  }, []);

  const handleSync = async () => {
    if (!wardNo || isNaN(parseInt(wardNo))) {
      Alert.alert('Error', 'Please enter a valid ward number');
      return;
    }
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncApi.downloadRoute(parseInt(wardNo));
      const { citizens, total_citizens, date } = res.data;
      const saved = await saveCitizens(citizens);
      const newCount = await getCitizenCount();
      setCachedCount(newCount);
      setSyncResult({
        success: true,
        count: saved,
        date,
        ward_no: wardNo,
      });
    } catch (err) {
      setSyncResult({ success: false, error: err.message });
      Alert.alert('Sync Failed', 'Could not connect to server. Check internet connection.');
    } finally {
      setSyncing(false);
    }
  };

  const handleGoOffline = () => {
    if (cachedCount === 0) {
      Alert.alert('No Data', 'Please sync citizen list first before going offline.');
      return;
    }
    navigation.navigate('CollectionScreen', { ward_no: parseInt(wardNo || '0') });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#14532d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Morning Sync</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, cachedCount > 0 ? styles.dotGreen : styles.dotGray]} />
            <Text style={styles.statusText}>
              {cachedCount > 0
                ? `${cachedCount} citizens cached — Ready for field`
                : 'No data cached — Sync required'}
            </Text>
          </View>
          <Text style={styles.statusDate}>
            Today: {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>

        {/* How it works */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Today's Workflow</Text>
          {[
            { step: '1', label: 'Morning Sync', desc: 'Download citizen list here (needs internet)', icon: 'cloud-download-outline', active: true },
            { step: '2', label: 'Field Collection', desc: 'Scan QR + weigh waste (works offline)', icon: 'qr-code-outline', active: false },
            { step: '3', label: 'Afternoon Sync', desc: 'Upload all collections to server', icon: 'cloud-upload-outline', active: false },
          ].map(item => (
            <View key={item.step} style={styles.stepItem}>
              <View style={[styles.stepBadge, item.active && styles.stepBadgeActive]}>
                <Text style={[styles.stepNum, item.active && styles.stepNumActive]}>{item.step}</Text>
              </View>
              <View style={styles.stepInfo}>
                <View style={styles.stepLabelRow}>
                  <Ionicons name={item.icon} size={16} color={item.active ? '#16a34a' : '#9ca3af'} />
                  <Text style={[styles.stepLabel, item.active && styles.stepLabelActive]}>{item.label}</Text>
                </View>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Ward Input */}
        <Text style={styles.inputLabel}>Ward Number</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="location-outline" size={20} color="#16a34a" style={{ marginLeft: 12 }} />
          <TextInput
            style={styles.input}
            value={wardNo}
            onChangeText={setWardNo}
            placeholder="Enter ward number (e.g. 4)"
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Sync Button */}
        <TouchableOpacity
          style={[styles.syncBtn, syncing && styles.syncBtnDisabled]}
          onPress={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Ionicons name="cloud-download-outline" size={22} color="#ffffff" />
          )}
          <Text style={styles.syncBtnText}>
            {syncing ? 'Downloading...' : 'Download Citizen List'}
          </Text>
        </TouchableOpacity>

        {/* Sync Result */}
        {syncResult && (
          <View style={[styles.resultCard, syncResult.success ? styles.resultSuccess : styles.resultError]}>
            <Ionicons
              name={syncResult.success ? 'checkmark-circle' : 'alert-circle'}
              size={24}
              color={syncResult.success ? '#16a34a' : '#dc2626'}
            />
            <View style={{ flex: 1 }}>
              {syncResult.success ? (
                <>
                  <Text style={styles.resultTitle}>Sync Successful!</Text>
                  <Text style={styles.resultDetail}>{syncResult.count} citizens loaded for Ward {syncResult.ward_no}</Text>
                  <Text style={styles.resultDetail}>Date: {syncResult.date}</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.resultTitle, { color: '#dc2626' }]}>Sync Failed</Text>
                  <Text style={styles.resultDetail}>{syncResult.error}</Text>
                </>
              )}
            </View>
          </View>
        )}

        {/* Go Offline Button */}
        <TouchableOpacity
          style={[styles.offlineBtn, cachedCount === 0 && styles.offlineBtnDisabled]}
          onPress={handleGoOffline}
          disabled={cachedCount === 0}
        >
          <MaterialCommunityIcons name="wifi-off" size={22} color={cachedCount > 0 ? '#14532d' : '#9ca3af'} />
          <Text style={[styles.offlineBtnText, cachedCount === 0 && styles.offlineBtnTextDisabled]}>
            Start Field Collection ({cachedCount} citizens)
          </Text>
          <Ionicons name="arrow-forward" size={20} color={cachedCount > 0 ? '#14532d' : '#9ca3af'} />
        </TouchableOpacity>

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
  statusCard: {
    backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 16,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  dotGreen: { backgroundColor: '#16a34a' },
  dotGray: { backgroundColor: '#d1d5db' },
  statusText: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  statusDate: { fontSize: 12, color: '#9ca3af' },
  stepsCard: {
    backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 20,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  stepsTitle: { fontSize: 14, fontWeight: '700', color: '#14532d', marginBottom: 14 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  stepBadge: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6',
    justifyContent: 'center', alignItems: 'center',
  },
  stepBadgeActive: { backgroundColor: '#dcfce7' },
  stepNum: { fontSize: 14, fontWeight: '800', color: '#9ca3af' },
  stepNumActive: { color: '#16a34a' },
  stepInfo: { flex: 1 },
  stepLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  stepLabel: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  stepLabelActive: { color: '#16a34a' },
  stepDesc: { fontSize: 12, color: '#9ca3af' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#dcfce7', marginBottom: 16,
  },
  input: { flex: 1, padding: 14, fontSize: 15, color: '#1f2937' },
  syncBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#16a34a', borderRadius: 14, padding: 16, marginBottom: 16,
  },
  syncBtnDisabled: { backgroundColor: '#9ca3af' },
  syncBtnText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  resultCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: 12, padding: 14, marginBottom: 16,
  },
  resultSuccess: { backgroundColor: '#dcfce7' },
  resultError: { backgroundColor: '#fee2e2' },
  resultTitle: { fontSize: 14, fontWeight: '700', color: '#14532d', marginBottom: 4 },
  resultDetail: { fontSize: 12, color: '#374151' },
  offlineBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#f0fdf4', borderRadius: 14, padding: 16,
    borderWidth: 2, borderColor: '#16a34a',
  },
  offlineBtnDisabled: { borderColor: '#d1d5db', backgroundColor: '#f9fafb' },
  offlineBtnText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#14532d', textAlign: 'center' },
  offlineBtnTextDisabled: { color: '#9ca3af' },
});
