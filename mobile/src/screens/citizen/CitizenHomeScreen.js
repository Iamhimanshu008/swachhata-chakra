import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useStore from '../../store';
import { citizenApi } from '../../api/citizenApi';

export default function CitizenHomeScreen({ navigation }) {
  const { user, citizenWallet, setCitizenWallet, citizenProfile, setCitizenProfile } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [profileRes, walletRes] = await Promise.all([
        citizenApi.getProfile(),
        citizenApi.getWallet(),
      ]);
      setCitizenProfile(profileRes.data);
      setCitizenWallet(walletRes.data);
    } catch (err) {
      Alert.alert('Error', 'Could not load profile. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const balance = citizenWallet?.balance ?? 0;
  const inrValue = (balance * 0.10).toFixed(2);
  const recentTransactions = (citizenWallet?.transactions ?? []).slice(0, 3);
  const initials = (user?.full_name || citizenProfile?.name || 'C').charAt(0).toUpperCase();

  const quickActions = [
    { label: 'My QR Code', icon: 'qr-code-outline', lib: 'Ionicons', color: '#16a34a', screen: 'CitizenQR' },
    { label: 'History', icon: 'history', lib: 'MCI', color: '#0891b2', screen: 'CitizenHistory' },
    { label: 'Offers', icon: 'tag-outline', lib: 'MCI', color: '#f59e0b', screen: 'CitizenOffers' },
    { label: 'Leaderboard', icon: 'trophy-outline', lib: 'MCI', color: '#8b5cf6', screen: 'CitizenLeaderboard' },
  ];

  const renderIcon = (item) => {
    if (item.lib === 'Ionicons')
      return <Ionicons name={item.icon} size={28} color={item.color} />;
    return <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading your wallet...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer?.()}>
          <Ionicons name="menu-outline" size={28} color="#16a34a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SmartWaste AI</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CitizenQR')}>
          <Ionicons name="qr-code-outline" size={26} color="#16a34a" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16a34a']} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{citizenProfile?.name || user?.full_name || 'Citizen'}</Text>
              <Text style={styles.profileHouseId}>{citizenProfile?.house_id || '—'}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>Citizen</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.qrButton} onPress={() => navigation.navigate('CitizenQR')}>
            <Ionicons name="qr-code" size={32} color="#ffffff" />
            <Text style={styles.qrButtonLabel}>Show QR</Text>
          </TouchableOpacity>
        </View>

        {/* Points Balance Card */}
        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>Green Points Balance</Text>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsValue}>{balance.toFixed(1)}</Text>
            <Text style={styles.pointsUnit}>pts</Text>
          </View>
          <Text style={styles.pointsInr}>≈ ₹{inrValue} value</Text>
          <View style={styles.pointsDivider} />
          <Text style={styles.pointsHint}>
            <MaterialCommunityIcons name="recycle" size={14} color="#86efac" /> 100g plastic = 1 Green Point
          </Text>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBg, { backgroundColor: action.color + '15' }]}>
                {renderIcon(action)}
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Collections</Text>
        <View style={styles.activityCard}>
          {recentTransactions.length === 0 ? (
            <View style={styles.emptyActivity}>
              <MaterialCommunityIcons name="recycle" size={40} color="#d1d5db" />
              <Text style={styles.emptyText}>No collections yet</Text>
              <Text style={styles.emptySubText}>Start bringing plastic waste to earn points!</Text>
            </View>
          ) : (
            recentTransactions.map((t, i) => (
              <View key={t.id || i} style={[styles.activityItem, i < recentTransactions.length - 1 && styles.activityItemBorder]}>
                <View style={styles.activityIconBg}>
                  <MaterialCommunityIcons name="recycle" size={20} color="#16a34a" />
                </View>
                <View style={styles.activityMiddle}>
                  <Text style={styles.activityTitle}>Plastic Collected • {t.weight_grams}g</Text>
                  <Text style={styles.activityDate}>{formatDate(t.collected_at)}</Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsBadgeText}>+{t.points_awarded}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4' },
  loadingText: { marginTop: 12, color: '#16a34a', fontSize: 14 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
    backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dcfce7',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#14532d' },
  scrollContent: { padding: 16 },

  // Profile Card
  profileCard: {
    backgroundColor: '#16a34a', borderRadius: 16, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    elevation: 3, shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8,
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#ffffff30',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 2 },
  profileHouseId: { fontSize: 12, color: '#dcfce7', marginBottom: 6 },
  roleBadge: { backgroundColor: '#ffffff25', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start' },
  roleBadgeText: { fontSize: 11, color: '#ffffff', fontWeight: '600' },
  qrButton: { alignItems: 'center', padding: 8 },
  qrButtonLabel: { fontSize: 11, color: '#dcfce7', marginTop: 4, fontWeight: '600' },

  // Points Card
  pointsCard: {
    backgroundColor: '#14532d', borderRadius: 16, padding: 20, marginBottom: 20,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  pointsLabel: { fontSize: 12, color: '#86efac', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  pointsRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 },
  pointsValue: { fontSize: 56, fontWeight: '900', color: '#ffffff', lineHeight: 60 },
  pointsUnit: { fontSize: 20, color: '#86efac', fontWeight: '700', marginBottom: 8, marginLeft: 6 },
  pointsInr: { fontSize: 15, color: '#bbf7d0', marginBottom: 12 },
  pointsDivider: { height: 1, backgroundColor: '#ffffff20', marginBottom: 10 },
  pointsHint: { fontSize: 12, color: '#86efac' },

  // Quick Actions
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#14532d', marginBottom: 12, marginTop: 4 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  actionCard: {
    width: '47.5%', backgroundColor: '#ffffff', borderRadius: 14, padding: 16,
    alignItems: 'center', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  actionIconBg: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', textAlign: 'center' },

  // Activity
  activityCard: {
    backgroundColor: '#ffffff', borderRadius: 14, overflow: 'hidden', marginBottom: 8,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  emptyActivity: { alignItems: 'center', padding: 28 },
  emptyText: { fontSize: 15, color: '#9ca3af', fontWeight: '600', marginTop: 10 },
  emptySubText: { fontSize: 12, color: '#d1d5db', marginTop: 4, textAlign: 'center' },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  activityItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f0fdf4' },
  activityIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center' },
  activityMiddle: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  activityDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  pointsBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pointsBadgeText: { fontSize: 13, fontWeight: '700', color: '#16a34a' },
});
