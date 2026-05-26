import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const SAMPLE_OFFERS = [
  { id: 1, title: '10% off at Sharma Kirana Store', points: 50, category: 'Grocery', icon: 'store' },
  { id: 2, title: 'Free Mobile Recharge ₹20', points: 200, category: 'Mobile', icon: 'cellphone' },
  { id: 3, title: 'Village Tax Rebate ₹50', points: 500, category: 'Government', icon: 'bank' },
  { id: 4, title: 'School Stationery Kit', points: 300, category: 'Education', icon: 'school' },
];

export default function CitizenOffersScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#14532d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offers & Rewards</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.comingSoonBanner}>
        <MaterialCommunityIcons name="clock-outline" size={18} color="#f59e0b" />
        <Text style={styles.comingSoonText}>Live redemption coming soon — points safe!</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Available Offers</Text>
        {SAMPLE_OFFERS.map(offer => (
          <View key={offer.id} style={styles.offerCard}>
            <View style={styles.offerIcon}>
              <MaterialCommunityIcons name={offer.icon} size={28} color="#16a34a" />
            </View>
            <View style={styles.offerInfo}>
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <View style={styles.offerMeta}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{offer.category}</Text>
                </View>
                <Text style={styles.offerPoints}>{offer.points} pts required</Text>
              </View>
            </View>
            <View style={styles.redeemBtn}>
              <Text style={styles.redeemText}>Redeem</Text>
            </View>
          </View>
        ))}
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
  comingSoonBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef9c3', padding: 12, paddingHorizontal: 16,
  },
  comingSoonText: { fontSize: 13, color: '#92400e', fontWeight: '600' },
  content: { padding: 16 },
  sectionLabel: { fontSize: 13, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  offerCard: {
    backgroundColor: '#ffffff', borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  offerIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center' },
  offerInfo: { flex: 1 },
  offerTitle: { fontSize: 14, fontWeight: '700', color: '#1f2937', marginBottom: 6 },
  offerMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryBadge: { backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  categoryText: { fontSize: 11, color: '#16a34a', fontWeight: '600' },
  offerPoints: { fontSize: 12, color: '#9ca3af' },
  redeemBtn: { backgroundColor: '#dcfce7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  redeemText: { fontSize: 12, color: '#16a34a', fontWeight: '700' },
});
