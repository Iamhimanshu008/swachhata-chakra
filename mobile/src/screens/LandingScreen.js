import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, StatusBar, Dimensions, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14532D" />
      
      {/* Background gradient effect */}
      <View style={styles.bgGradient} />
      
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo.png')} style={{ width: 120, height: 120, borderRadius: 60 }} resizeMode="contain" />
        </View>
        <Text style={styles.appName}>Swachhata Chakra</Text>
        <Text style={styles.slogan}>स्वच्छ छत्तीसगढ़, समृद्ध छत्तीसगढ़</Text>
        <Text style={styles.subtitle}>Digital Waste Management System</Text>
      </View>
      
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statPill}><Text style={styles.statText}>🚪 Door-to-Door Collection</Text></View>
        <View style={styles.statPill}><Text style={styles.statText}>🏘️ Gram Panchayats</Text></View>
        <View style={styles.statPill}><Text style={styles.statText}>🤖 IoT + AI Enabled</Text></View>
      </View>

      {/* Main Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Ionicons name="log-in-outline" size={28} color="white" />
          <View style={styles.btnTextContainer}>
            <Text style={styles.primaryBtnTitle}>Login / Register</Text>
            <Text style={styles.primaryBtnSub}>Collectors, SHG Workers, Citizens</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('PublicStack')}
          activeOpacity={0.8}
        >
          <Ionicons name="map-outline" size={28} color="#16A34A" />
          <View style={styles.btnTextContainer}>
            <Text style={styles.secondaryBtnTitle}>Public Map & Updates</Text>
            <Text style={styles.secondaryBtnSub}>Report a bin — no login needed</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Features Pills */}
      <View style={styles.featuresRow}>
        <View style={styles.featurePill}><Text style={styles.featureText}>📵 Works Offline</Text></View>
        <View style={styles.featurePill}><Text style={styles.featureText}>🔒 Fraud-Proof</Text></View>
        <View style={styles.featurePill}><Text style={styles.featureText}>🌱 SBM 2026</Text></View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <Text style={styles.portalText}>Swachhata Chakra Portal</Text>
        <Text style={styles.urlText}>swachhata-chakra.vercel.app</Text>
        <View style={styles.govtRow}>
          <Image source={require('../../assets/cg-govt-logo.png')} style={{ width: 40, height: 40 }} resizeMode="contain" />
          <Text style={styles.govtText}>Govt. of Chhattisgarh | UNICEF Supported</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bgGradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#14532D',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainer: {
    width: 120, height: 120,
    borderRadius: 60,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  slogan: {
    fontSize: 18,
    fontWeight: '700',
    color: '#86efac',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#bbf7d0',
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statPill: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionSection: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 16,
    marginTop: 40,
  },
  primaryBtn: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  btnTextContainer: {
    marginLeft: 16,
  },
  primaryBtnTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  primaryBtnSub: {
    color: '#bbf7d0',
    fontSize: 13,
    marginTop: 2,
  },
  secondaryBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryBtnTitle: {
    color: '#16A34A',
    fontSize: 20,
    fontWeight: '800',
  },
  secondaryBtnSub: {
    color: '#15803d',
    fontSize: 13,
    marginTop: 2,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 40,
  },
  featurePill: {
    backgroundColor: 'transparent',
  },
  featureText: {
    color: '#86efac',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 30,
    marginTop: 'auto',
  },
  portalText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
  },
  urlText: {
    color: '#9ca3af',
    fontSize: 11,
    marginBottom: 16,
  },
  govtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  govtText: {
    color: '#d1fae5',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 12,
  },
});

export default LandingScreen;
