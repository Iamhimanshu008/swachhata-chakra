import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const DARK_GREEN = '#1B5E20';
const MED_GREEN = '#2E7D32';
const LIGHT_GREEN = '#A5D6A7';
const BG = '#F5F5F5';
const WHITE = '#FFFFFF';

export default function CitizenNotificationsScreen({ navigation }) {
  const notificationsToday = [
    { id: 1, type: 'waste', title: 'Your waste was collected', desc: 'The pickup for your Organic waste has been completed successfully...', time: '2 hrs ago', icon: 'trash-can-outline', color: MED_GREEN, bg: '#E8F5E9' },
    { id: 2, type: 'reward', title: '50 points added to balance', desc: 'Congratulations! You earned 50 Eco-Points for recycling...', time: '5 hrs ago', icon: 'star-outline', color: '#F59E0B', bg: '#FEF3C7' },
  ];

  const notificationsYesterday = [
    { id: 3, type: 'info', title: 'New Sustainability Tip', desc: 'Learn how to compost in small urban apartments...', time: '1 day ago', icon: 'information-outline', color: '#3B82F6', bg: '#EFF6FF' },
    { id: 4, type: 'eco', title: 'Community Goal Reached!', desc: 'Your neighborhood has recycled 5,000kg...', time: '1 day ago', icon: 'leaf', color: DARK_GREEN, bg: LIGHT_GREEN + '40' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={DARK_GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="dots-vertical" size={28} color={DARK_GREEN} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCardDark}>
            <MaterialCommunityIcons name="bell-ring-outline" size={24} color={LIGHT_GREEN} style={{ marginBottom: 8 }} />
            <Text style={styles.statLabelLight}>Unread</Text>
            <Text style={styles.statValueLight}>2</Text>
          </View>
          <View style={styles.statCardLight}>
            <MaterialCommunityIcons name="star-circle-outline" size={24} color={DARK_GREEN} style={{ marginBottom: 8 }} />
            <Text style={styles.statLabelDark}>Rewards Earned</Text>
            <Text style={styles.statValueDark}>150 XP</Text>
          </View>
        </View>

        {/* TODAY SECTION */}
        <Text style={styles.sectionLabel}>TODAY</Text>
        {notificationsToday.map(item => (
          <TouchableOpacity key={item.id} style={styles.notificationCard}>
            <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
              <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.notificationMiddle}>
              <Text style={styles.notificationTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.notificationDesc} numberOfLines={1}>{item.desc}</Text>
            </View>
            <Text style={styles.notificationTime}>{item.time}</Text>
          </TouchableOpacity>
        ))}

        {/* YESTERDAY SECTION */}
        <Text style={styles.sectionLabel}>YESTERDAY</Text>
        {notificationsYesterday.map(item => (
          <TouchableOpacity key={item.id} style={styles.notificationCard}>
            <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
              <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.notificationMiddle}>
              <Text style={styles.notificationTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.notificationDesc} numberOfLines={1}>{item.desc}</Text>
            </View>
            <Text style={styles.notificationTime}>{item.time}</Text>
          </TouchableOpacity>
        ))}

        {/* Empty / Caught Up State */}
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="bell-off-outline" size={48} color="#CCCCCC" />
          <Text style={styles.emptyHeading}>Caught up!</Text>
          <Text style={styles.emptySubtitle}>Check back later for updates...</Text>
        </View>
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statCardDark: {
    width: '48%', backgroundColor: DARK_GREEN, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2,
  },
  statCardLight: {
    width: '48%', backgroundColor: LIGHT_GREEN, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statLabelLight: { fontSize: 12, color: LIGHT_GREEN, marginBottom: 4 },
  statValueLight: { fontSize: 24, fontWeight: 'bold', color: WHITE },
  statLabelDark: { fontSize: 12, color: DARK_GREEN, marginBottom: 4 },
  statValueDark: { fontSize: 24, fontWeight: 'bold', color: DARK_GREEN },

  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#666666', letterSpacing: 1, marginBottom: 12, marginTop: 8 },

  notificationCard: {
    backgroundColor: WHITE, borderRadius: 16, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  notificationMiddle: { flex: 1, marginRight: 8 },
  notificationTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  notificationDesc: { fontSize: 13, color: '#666666' },
  notificationTime: { fontSize: 12, color: '#999999', alignSelf: 'flex-start', marginTop: 2 },

  emptyState: {
    backgroundColor: '#E5E5E5', borderRadius: 16, padding: 32, marginTop: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyHeading: { fontSize: 18, fontWeight: 'bold', color: '#666666', marginTop: 12, marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#999999' },
});
