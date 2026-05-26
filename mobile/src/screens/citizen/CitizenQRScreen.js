import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Share, Alert, ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useStore from '../../store';
import { citizenApi } from '../../api/citizenApi';

export default function CitizenQRScreen({ navigation }) {
  const { citizenProfile, setCitizenProfile, user } = useStore();
  const [loading, setLoading] = useState(!citizenProfile);

  useEffect(() => {
    if (!citizenProfile) {
      citizenApi.getProfile()
        .then(res => { setCitizenProfile(res.data); })
        .catch(() => Alert.alert('Error', 'Could not load QR data'))
        .finally(() => setLoading(false));
    }
  }, []);

  const qrValue = citizenProfile?.qr_hash || citizenProfile?.house_id || 'LOADING';
  const houseId = citizenProfile?.house_id || '—';
  const wardNo = citizenProfile?.ward_no || '—';
  const name = citizenProfile?.name || user?.full_name || 'Citizen';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `SmartWaste AI — My House ID: ${houseId}\nWard: ${wardNo}\nPresent this QR code to the waste collector.`,
      });
    } catch (err) {}
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#14532d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My QR Card</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#16a34a" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* QR Card */}
        <View style={styles.qrCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.logoRow}>
              <MaterialCommunityIcons name="recycle" size={22} color="#16a34a" />
              <Text style={styles.logoText}>SmartWaste AI</Text>
            </View>
            <Text style={styles.cardSubtitle}>Swachh Chhattisgarh Mission</Text>
          </View>

          {/* QR Code */}
          <View style={styles.qrWrapper}>
            {loading ? (
              <View style={styles.qrPlaceholder}>
                <MaterialCommunityIcons name="qrcode" size={80} color="#d1d5db" />
                <Text style={styles.qrLoadingText}>Loading QR...</Text>
              </View>
            ) : (
              <View style={styles.qrFallback}>
                <MaterialCommunityIcons name="qrcode" size={180} color="#14532d" />
                <Text style={styles.qrHashText}>{qrValue}</Text>
              </View>
            )}
          </View>

          {/* Citizen Info */}
          <View style={styles.citizenInfo}>
            <Text style={styles.citizenName}>{name}</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoChip}>
                <Ionicons name="home-outline" size={14} color="#16a34a" />
                <Text style={styles.infoChipText}>{houseId}</Text>
              </View>
              <View style={styles.infoChip}>
                <Ionicons name="location-outline" size={14} color="#16a34a" />
                <Text style={styles.infoChipText}>Ward {wardNo}</Text>
              </View>
            </View>
          </View>

          {/* Card Footer */}
          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>
              Show this QR to your waste collector
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to use</Text>
          {[
            { icon: 'qr-code-outline', text: 'Show this QR code to the collector when they visit your home' },
            { icon: 'scale-outline', text: 'Collector will weigh your plastic waste on the smart scale' },
            { icon: 'leaf-outline', text: 'Green Points will be added to your wallet after afternoon sync' },
            { icon: 'gift-outline', text: 'Redeem points at partner merchants for discounts and benefits' },
          ].map((item, i) => (
            <View key={i} style={styles.instructionItem}>
              <View style={styles.instructionIconBg}>
                <Ionicons name={item.icon} size={18} color="#16a34a" />
              </View>
              <Text style={styles.instructionText}>{item.text}</Text>
            </View>
          ))}
        </View>

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
  scrollContent: { padding: 20, alignItems: 'center' },

  qrCard: {
    backgroundColor: '#ffffff', borderRadius: 20, width: '100%', overflow: 'hidden',
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12, shadowRadius: 12, marginBottom: 16,
  },
  cardHeader: { backgroundColor: '#f0fdf4', padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#dcfce7' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  logoText: { fontSize: 16, fontWeight: '800', color: '#14532d' },
  cardSubtitle: { fontSize: 11, color: '#16a34a', fontWeight: '500' },

  qrWrapper: { padding: 28, alignItems: 'center' },
  qrPlaceholder: { alignItems: 'center', padding: 20 },
  qrLoadingText: { color: '#9ca3af', marginTop: 8, fontSize: 13 },
  qrFallback: { alignItems: 'center', padding: 20 },
  qrHashText: { fontSize: 11, color: '#9ca3af', marginTop: 8, fontFamily: 'monospace' },

  citizenInfo: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  citizenName: { fontSize: 20, fontWeight: '800', color: '#14532d', marginBottom: 8 },
  infoRow: { flexDirection: 'row', gap: 8 },
  infoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#dcfce7', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  infoChipText: { fontSize: 13, color: '#16a34a', fontWeight: '600' },

  cardFooter: { backgroundColor: '#14532d', padding: 12, alignItems: 'center' },
  cardFooterText: { fontSize: 13, color: '#86efac', fontWeight: '500' },

  instructionsCard: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 16, width: '100%',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  instructionsTitle: { fontSize: 15, fontWeight: '700', color: '#14532d', marginBottom: 14 },
  instructionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  instructionIconBg: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center' },
  instructionText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 18 },
});
