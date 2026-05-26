import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useStore from '../../store';
import { citizenApi } from '../../api/citizenApi';

export default function CitizenLeaderboardScreen({ navigation }) {
  const { citizenProfile } = useStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (citizenProfile?.ward_no) {
      citizenApi.getLeaderboard(citizenProfile.ward_no)
        .then(res => setLeaderboard(res.data.leaderboard || []))
        .catch(() => Alert.alert('Error', 'Could not load leaderboard'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [citizenProfile]);

  const myRank = leaderboard.findIndex(e => e.house_id === citizenProfile?.house_id) + 1;

  const rankColors = { 1: '#f59e0b', 2: '#9ca3af', 3: '#b45309' };

  const renderItem = ({ item, index }) => {
    const isMe = item.house_id === citizenProfile?.house_id;
    const rank = item.rank || index + 1;
    return (
      <View style={[styles.leaderItem, isMe && styles.leaderItemMe]}>
        <View style={styles.rankBadge}>
          {rank <= 3
            ? <MaterialCommunityIcons name="trophy" size={22} color={rankColors[rank]} />
            : <Text style={styles.rankText}>{rank}</Text>}
        </View>
        <View style={styles.leaderAvatar}>
          <Text style={styles.leaderAvatarText}>{item.name?.charAt(0) || '?'}</Text>
        </View>
        <View style={styles.leaderInfo}>
          <Text style={[styles.leaderName, isMe && styles.leaderNameMe]}>{item.name}{isMe ? ' (You)' : ''}</Text>
          <Text style={styles.leaderHouseId}>{item.house_id}</Text>
        </View>
        <View style={styles.leaderPoints}>
          <Text style={[styles.leaderPts, isMe && styles.leaderPtsMe]}>{item.points?.toFixed(1)}</Text>
          <Text style={styles.leaderPtsLabel}>pts</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#14532d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ward Leaderboard</Text>
        <View style={{ width: 24 }} />
      </View>

      {myRank > 0 && (
        <View style={styles.myRankBanner}>
          <MaterialCommunityIcons name="trophy-outline" size={20} color="#f59e0b" />
          <Text style={styles.myRankText}>Your Rank: #{myRank} in Ward {citizenProfile?.ward_no}</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item, i) => item.house_id || String(i)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No data yet for this ward</Text>
            </View>
          }
        />
      )}
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
  myRankBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef9c3', padding: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#fde68a',
  },
  myRankText: { fontSize: 14, fontWeight: '700', color: '#92400e' },
  list: { padding: 16, gap: 8 },
  leaderItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
    borderRadius: 14, padding: 12, gap: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  leaderItemMe: { backgroundColor: '#dcfce7', borderWidth: 1.5, borderColor: '#16a34a' },
  rankBadge: { width: 32, alignItems: 'center' },
  rankText: { fontSize: 16, fontWeight: '800', color: '#6b7280' },
  leaderAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#dcfce7',
    justifyContent: 'center', alignItems: 'center',
  },
  leaderAvatarText: { fontSize: 18, fontWeight: '700', color: '#16a34a' },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: 14, fontWeight: '700', color: '#1f2937' },
  leaderNameMe: { color: '#14532d' },
  leaderHouseId: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  leaderPoints: { alignItems: 'flex-end' },
  leaderPts: { fontSize: 20, fontWeight: '800', color: '#6b7280' },
  leaderPtsMe: { color: '#16a34a' },
  leaderPtsLabel: { fontSize: 11, color: '#9ca3af' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
});
