import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useStore from '../../store';

const DARK_GREEN = '#1B5E20';
const MED_GREEN = '#2E7D32';
const LIGHT_GREEN = '#A5D6A7';
const BG = '#F5F5F5';
const WHITE = '#FFFFFF';

export default function CitizenOffersScreen({ navigation }) {
  const { citizenWallet } = useStore();
  const balance = citizenWallet?.balance ?? 0;

  const offers = [
    { id: 1, title: 'Mobile Recharge', desc: 'Get ₹50 off on your next top-up', xp: '500 XP', icon: 'cellphone' },
    { id: 2, title: 'Kirana Discount', desc: '10% off at local partner stores', xp: '800 XP', icon: 'storefront-outline' },
    { id: 3, title: 'Shopping Discount', desc: 'Extra ₹200 off on major e-commerce', xp: '1,200 XP', icon: 'shopping-outline' },
    { id: 4, title: 'Electricity Bill Discount', desc: 'Flat ₹100 off on utility bill', xp: '1,000 XP', icon: 'lightning-bolt-outline' },
    { id: 5, title: 'Groceries Discount', desc: 'Free delivery + ₹50 voucher', xp: '600 XP', icon: 'basket-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer?.()}>
          <Ionicons name="menu" size={28} color={DARK_GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SmartWaste AI</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={{ marginRight: 16 }}>
            <Ionicons name="globe-outline" size={24} color={DARK_GREEN} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CitizenNotifications')}>
            <Ionicons name="notifications-outline" size={24} color={DARK_GREEN} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Points Banner */}
        <View style={styles.pointsBanner}>
          <View>
            <Text style={styles.pointsBannerLabel}>Available Points</Text>
            <Text style={styles.pointsBannerValue}>{balance.toLocaleString()} XP</Text>
          </View>
          <View style={styles.pointsBannerIconBox}>
            <MaterialCommunityIcons name="star-four-points-outline" size={28} color={DARK_GREEN} />
          </View>
        </View>

        <View style={styles.sectionHeadingContainer}>
          <Text style={styles.sectionHeading}>Your Rewards</Text>
          <Text style={styles.sectionSubtitle}>Redeem your points for exciting offers</Text>
        </View>

        {/* Offer Cards */}
        <View style={styles.offersList}>
          {offers.map(offer => (
            <TouchableOpacity key={offer.id} style={styles.offerCard}>
              <View style={styles.offerIconBox}>
                <MaterialCommunityIcons name={offer.icon} size={24} color={DARK_GREEN} />
              </View>
              <View style={styles.offerMiddle}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerDesc}>{offer.desc}</Text>
              </View>
              <View style={styles.offerRight}>
                <Text style={styles.offerXp}>{offer.xp}</Text>
                <Ionicons name="chevron-forward" size={16} color={DARK_GREEN} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Banner */}
        <View style={styles.featuredBanner}>
          <View style={styles.featuredPill}>
            <Text style={styles.featuredPillText}>LIMITED TIME</Text>
          </View>
          <Text style={styles.featuredTitle}>Eco-Warrior Pack</Text>
          <Text style={styles.featuredSubtitle}>Exclusive sustainable living kit</Text>
        </View>

        {/* View Reward History Button */}
        <TouchableOpacity style={styles.historyBtn} onPress={() => navigation.navigate('CitizenHistory')}>
          <MaterialCommunityIcons name="history" size={20} color="#666666" style={{ marginRight: 8 }} />
          <Text style={styles.historyBtnText}>View Reward History</Text>
        </TouchableOpacity>
      </ScrollView>
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
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  pointsBanner: {
    backgroundColor: DARK_GREEN, borderRadius: 16, padding: 24, marginBottom: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
  },
  pointsBannerLabel: { fontSize: 14, color: LIGHT_GREEN, marginBottom: 6 },
  pointsBannerValue: { fontSize: 32, fontWeight: 'bold', color: WHITE },
  pointsBannerIconBox: {
    width: 52, height: 52, borderRadius: 12, backgroundColor: LIGHT_GREEN,
    justifyContent: 'center', alignItems: 'center',
  },

  sectionHeadingContainer: { marginBottom: 16 },
  sectionHeading: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: '#666666' },

  offersList: { marginBottom: 24 },
  offerCard: {
    backgroundColor: WHITE, borderRadius: 16, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  offerIconBox: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  offerMiddle: { flex: 1, marginRight: 8 },
  offerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  offerDesc: { fontSize: 12, color: '#666666' },
  offerRight: { flexDirection: 'row', alignItems: 'center' },
  offerXp: { fontSize: 14, fontWeight: 'bold', color: DARK_GREEN, marginRight: 4 },

  featuredBanner: {
    backgroundColor: DARK_GREEN, borderRadius: 16, padding: 24, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
  },
  featuredPill: {
    backgroundColor: LIGHT_GREEN, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
    alignSelf: 'flex-start', marginBottom: 12,
  },
  featuredPillText: { fontSize: 10, fontWeight: 'bold', color: DARK_GREEN, letterSpacing: 0.5 },
  featuredTitle: { fontSize: 20, fontWeight: 'bold', color: WHITE, marginBottom: 4 },
  featuredSubtitle: { fontSize: 14, color: '#D1D5DB' },

  historyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 16, paddingVertical: 16, backgroundColor: BG,
  },
  historyBtnText: { fontSize: 16, fontWeight: '600', color: '#666666' },
});
