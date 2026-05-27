import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useStore from '../../store';
import { citizenApi } from '../../api/citizenApi';

const DARK_GREEN = '#1B5E20';
const MED_GREEN = '#2E7D32';
const LIGHT_GREEN = '#A5D6A7';
const BG = '#F5F5F5';
const WHITE = '#FFFFFF';

export default function CitizenQRScreen({ navigation }) {
  const { user, citizenProfile } = useStore();

  const houseId = citizenProfile?.house_id || 'SW-XXXXX';
  const name = citizenProfile?.name || user?.full_name || 'Citizen';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={DARK_GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My QR Code</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={DARK_GREEN} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* White Card */}
        <View style={styles.card}>
          <Text style={styles.heading}>Your Digital ID</Text>
          
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code" size={120} color={DARK_GREEN} />
          </View>
          
          <Text style={styles.houseId}>{houseId}</Text>
          <Text style={styles.userName}>{name}</Text>
          <Text style={styles.helperText}>Collector scans this to record your waste</Text>
        </View>

        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-social-outline" size={20} color={WHITE} style={{ marginRight: 8 }} />
          <Text style={styles.shareButtonText}>Share QR Code</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, backgroundColor: BG,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: DARK_GREEN },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  card: {
    backgroundColor: WHITE, borderRadius: 24, padding: 32, width: '100%',
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
    marginBottom: 32,
  },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 24 },
  qrPlaceholder: {
    width: 200, height: 200, backgroundColor: '#F0FDF4', borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    borderWidth: 2, borderColor: LIGHT_GREEN, borderStyle: 'dashed'
  },
  houseId: { fontSize: 24, fontWeight: 'bold', color: MED_GREEN, marginBottom: 8 },
  userName: { fontSize: 18, color: '#1A1A1A', marginBottom: 12 },
  helperText: { fontSize: 14, color: '#666666', textAlign: 'center', paddingHorizontal: 20 },
  shareButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: DARK_GREEN, borderRadius: 16, width: '100%', paddingVertical: 18,
  },
  shareButtonText: { fontSize: 16, fontWeight: 'bold', color: WHITE },
});
