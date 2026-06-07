import React, { useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Dimensions, ScrollView, Alert, Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from '../i18n';
import useStore from '../store';

const { width } = Dimensions.get('window');

const SideDrawer = ({ visible, onClose, user, navigation }) => {
  const { t } = useTranslation();
  const logout = useStore(state => state.logout);

  const { citizenProfile } = useStore();

  const getMenuItems = () => {
    if (user?.role === 'citizen') {
      return [
        { icon: <MaterialCommunityIcons name="account-edit-outline" size={22} color="#16a34a" />, key: 'Edit Profile', screen: 'CitizenEditProfile' },
        { icon: <MaterialCommunityIcons name="clock-outline" size={22} color="#16a34a" />, key: 'History', screen: 'CitizenHistory' },
        { icon: <MaterialCommunityIcons name="chart-bar" size={22} color="#16a34a" />, key: 'Statistics', screen: 'CitizenLeaderboard' },
        { icon: <MaterialCommunityIcons name="bell-outline" size={22} color="#16a34a" />, key: 'Notifications', screen: 'CitizenNotifications' },
        { divider: true },
        { icon: <MaterialCommunityIcons name="cog-outline" size={22} color="#16a34a" />, key: 'Settings', screen: 'CitizenSettings' },
        { icon: <MaterialCommunityIcons name="bullhorn-outline" size={22} color="#16a34a" />, key: 'Complaints', screen: 'CitizenComplaints' },
        { icon: <MaterialCommunityIcons name="refresh" size={22} color="#16a34a" />, key: 'Check for Update', action: 'update' },
      ];
    }
    return [
      { icon: <Ionicons name="home-outline" size={22} color="#16a34a" />, key: 'dashboard', screen: 'Home' },
      { icon: <MaterialCommunityIcons name="map-marker-path" size={22} color="#16a34a" />, key: 'my_route', screen: 'Map' },
      { icon: <Ionicons name="stats-chart-outline" size={22} color="#16a34a" />, key: 'stats', screen: 'Stats' },
      { icon: <MaterialCommunityIcons name="clipboard-list-outline" size={22} color="#16a34a" />, key: 'history', screen: 'History' },
      { icon: <MaterialCommunityIcons name="shield-check-outline" size={22} color="#16a34a" />, key: 'Safety Checklist', screen: 'SafetyChecklist' },
      { icon: <MaterialCommunityIcons name="newspaper-variant-outline" size={22} color="#16a34a" />, key: 'News & Updates', screen: 'NewsFeed' },
    ];
  };

  const menuItems = getMenuItems();

  const handleNavigate = (item) => {
    onClose();
    if (item.action === 'update') {
      // Do update check logic here
      Alert.alert('Update Check', 'You are on the latest version.');
      return;
    }
    if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: () => {
            onClose();
            setTimeout(() => logout(), 500);
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          onPress={onClose} 
          activeOpacity={1}
        />
        <View style={styles.drawer}>
          <Image source={require('../../assets/logo.png')} style={{ width: 60, height: 60, alignSelf: 'center', marginTop: 10, marginBottom: 5 }} resizeMode="contain" />
          {/* User Profile Section */}
          <View style={styles.profileSection}>
            <View style={user?.role === 'citizen' ? styles.avatarCitizen : styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.role === 'citizen' 
                  ? (citizenProfile?.name?.[0] || user?.full_name?.[0]?.toUpperCase() || '?')
                  : (user?.full_name?.[0]?.toUpperCase() || '?')}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {user?.role === 'citizen' ? (citizenProfile?.name || user?.full_name || 'Citizen') : (user?.full_name || 'Staff')}
              </Text>
              
              {user?.role === 'citizen' ? (
                <>
                  <Text style={styles.userEmail} numberOfLines={1}>
                    House ID: #{citizenProfile?.house_id || 'SW-XXXXX'}
                  </Text>
                  <View style={styles.citizenBadge}>
                    <Text style={styles.citizenBadgeText}>CITIZEN</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.userRole}>
                    {user?.role?.replace('_', ' ')?.toUpperCase()}
                  </Text>
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {user?.email}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Menu Items */}
          <ScrollView style={styles.menuList}>
            {menuItems.map((item, index) => {
              if (item.divider) {
                return <View key={`div-${index}`} style={styles.divider} />;
              }
              return (
                <TouchableOpacity
                  key={item.key}
                  style={styles.menuItem}
                  onPress={() => handleNavigate(item)}
                >
                  <View style={{ width: 28, marginRight: 8, alignItems: 'center' }}>{item.icon}</View>
                  <Text style={styles.menuLabel}>{t(item.key) || item.key}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Logout */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <View style={{ marginRight: 8 }}>
                <MaterialIcons name="logout" size={22} color="#dc2626" />
              </View>
              <Text style={styles.logoutText}>{t('logout') || 'Logout'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'
  },
  drawer: {
    width: width * 0.75,
    backgroundColor: '#0f172a',
    position: 'absolute', left: 0, top: 0, bottom: 0,
    paddingTop: 50,
  },
  profileSection: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, gap: 12,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#16a34a',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarCitizen: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#0f172a',
    borderWidth: 2, borderColor: '#16a34a',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: {
    color: '#fff', fontSize: 22, fontWeight: '800',
  },
  profileInfo: { flex: 1 },
  userName: {
    color: '#ffffff', fontSize: 16, fontWeight: '700',
  },
  userRole: {
    color: '#4ade80', fontSize: 11,
    fontWeight: '600', marginTop: 2,
  },
  citizenBadge: {
    backgroundColor: '#16a34a20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', marginTop: 4, borderWidth: 1, borderColor: '#16a34a40',
  },
  citizenBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#4ade80', letterSpacing: 0.5 },
  userEmail: {
    color: '#94a3b8', fontSize: 12, marginTop: 2,
  },
  divider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16, marginVertical: 8,
  },
  menuList: { flex: 1 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 20, gap: 14,
  },
  menuIcon: { fontSize: 20, width: 28 },
  menuLabel: {
    color: '#e2e8f0', fontSize: 15, fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, gap: 14,
    backgroundColor: 'rgba(220,38,38,0.1)',
    margin: 12, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(220,38,38,0.3)',
  },
  logoutIcon: { fontSize: 20 },
  logoutText: {
    color: '#ef4444', fontSize: 15, fontWeight: '700',
  },
});

export default SideDrawer;
