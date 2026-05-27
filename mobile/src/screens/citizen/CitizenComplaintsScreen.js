import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const DARK_GREEN = '#1B5E20';
const MED_GREEN = '#2E7D32';
const LIGHT_GREEN = '#A5D6A7';
const BG = '#F5F5F5';
const WHITE = '#FFFFFF';

export default function CitizenComplaintsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('active');

  const complaints = [
    { id: 1, ref: 'REF-88219', date: 'Oct 24', status: 'Pending', desc: 'Missed pickup at Maple Ave, building 42. Scheduled for Tuesday morning.', type: 'active' },
    { id: 2, ref: 'REF-88104', date: 'Oct 22', status: 'In Progress', desc: 'Overflowing public bin at Central Park East entrance near the fountain.', type: 'active' },
    { id: 3, ref: 'REF-87990', date: 'Oct 15', status: 'Resolved', desc: 'Broken smart bin sensor on 5th avenue.', type: 'resolved' },
  ];

  const filteredComplaints = complaints.filter(c => c.type === activeTab);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return { bg: '#FCE7F3', color: '#BE185D', icon: 'clock-outline' };
      case 'In Progress':
        return { bg: '#E8F5E9', color: DARK_GREEN, icon: 'file-document-outline' };
      case 'Resolved':
        return { bg: LIGHT_GREEN, color: DARK_GREEN, icon: 'check-circle-outline' };
      default:
        return { bg: '#F3F4F6', color: '#6B7280', icon: 'information-outline' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={DARK_GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Complaints</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={DARK_GREEN} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'active' && styles.tabActive]} onPress={() => setActiveTab('active')}>
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'resolved' && styles.tabActive]} onPress={() => setActiveTab('resolved')}>
          <Text style={[styles.tabText, activeTab === 'resolved' && styles.tabTextActive]}>Resolved</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredComplaints.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyHeading}>No {activeTab} complaints</Text>
          </View>
        ) : (
          filteredComplaints.map(item => {
            const badge = getStatusBadge(item.status);
            return (
              <View key={item.id} style={styles.complaintCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <Text style={styles.refText}>{item.ref}</Text>
                    <Text style={styles.dateText}> • {item.date}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <MaterialCommunityIcons name={badge.icon} size={14} color={badge.color} style={{ marginRight: 4 }} />
                    <Text style={[styles.badgeText, { color: badge.color }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.descText}>{item.desc}</Text>
                <TouchableOpacity style={styles.viewDetailsBtn}>
                  <Text style={styles.viewDetailsText}>View Details &gt;</Text>
                </TouchableOpacity>
              </View>
            )
          })
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('CitizenSubmitComplaint')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color={WHITE} />
      </TouchableOpacity>
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
  
  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E5E5', backgroundColor: BG },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 3, borderBottomColor: MED_GREEN },
  tabText: { fontSize: 16, fontWeight: '600', color: '#999999' },
  tabTextActive: { color: MED_GREEN },

  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },

  complaintCard: {
    backgroundColor: WHITE, borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  refText: { fontSize: 13, fontWeight: 'bold', color: '#666666' },
  dateText: { fontSize: 13, color: '#999999' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  
  descText: { fontSize: 15, color: '#1A1A1A', lineHeight: 22, marginBottom: 16 },
  
  viewDetailsBtn: { alignSelf: 'flex-end' },
  viewDetailsText: { fontSize: 14, fontWeight: 'bold', color: MED_GREEN },

  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyHeading: { fontSize: 16, fontWeight: 'bold', color: '#999999', marginTop: 12 },

  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 60, height: 60, borderRadius: 20, backgroundColor: MED_GREEN,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: MED_GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
});
