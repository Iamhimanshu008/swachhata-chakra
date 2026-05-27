import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import useStore from '../../store';

const DARK_GREEN = '#1B5E20';
const MED_GREEN = '#2E7D32';
const LIGHT_GREEN = '#A5D6A7';
const BG = '#F5F5F5';
const WHITE = '#FFFFFF';

export default function CitizenEditProfileScreen({ navigation }) {
  const { user, citizenProfile, setCitizenProfile } = useStore();
  
  const [name, setName] = useState(citizenProfile?.name || user?.full_name || '');
  const [ward, setWard] = useState(citizenProfile?.ward_no || '');
  const [about, setAbout] = useState('');

  const handleSave = () => {
    // Optimistic local update
    if (citizenProfile) {
      setCitizenProfile({ ...citizenProfile, name, ward_no: ward });
    }
    Alert.alert('Profile Updated', 'Your changes have been saved successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const initials = name ? name.charAt(0).toUpperCase() : 'C';
  const phone = user?.phone_number || '+91 9XXXX XXXXX';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={DARK_GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={DARK_GREEN} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color={WHITE} />
            </View>
          </View>
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter full name"
            />
            <Ionicons name="pencil" size={20} color="#999999" />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={[styles.inputWrapper, styles.inputReadOnly]}>
            <TextInput
              style={[styles.input, { color: '#666666' }]}
              value={phone}
              editable={false}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ward / Village</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={ward}
              onChangeText={setWard}
              placeholder="Enter ward or village name"
            />
            <Ionicons name="location-outline" size={20} color="#999999" />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>About Me</Text>
          <TextInput
            style={styles.textArea}
            value={about}
            onChangeText={setAbout}
            placeholder="Tell us about your green habits..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="save-outline" size={20} color={WHITE} style={{ marginRight: 8 }} />
          <Text style={styles.saveBtnText}>Save Changes</Text>
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
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  avatarSection: { alignItems: 'center', marginTop: 24, marginBottom: 32 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 100, height: 100, borderRadius: 32, backgroundColor: '#E8F5E9',
    borderWidth: 2, borderColor: MED_GREEN,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: DARK_GREEN },
  cameraBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 32, height: 32, borderRadius: 16, backgroundColor: MED_GREEN,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: BG,
  },
  changePhotoText: { fontSize: 14, fontWeight: '600', color: MED_GREEN },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WHITE, borderWidth: 1, borderColor: '#E5E5E5',
    borderRadius: 12, paddingHorizontal: 16,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1A1A1A' },
  inputReadOnly: { backgroundColor: '#F0F0F0' },

  textArea: {
    backgroundColor: WHITE, borderWidth: 1, borderColor: '#E5E5E5',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: '#1A1A1A', minHeight: 100,
  },

  footer: { padding: 20, backgroundColor: BG },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: DARK_GREEN, borderRadius: 16, paddingVertical: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  saveBtnText: { fontSize: 16, fontWeight: 'bold', color: WHITE },
});
