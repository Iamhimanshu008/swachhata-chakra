import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const DARK_GREEN = '#1B5E20';
const MED_GREEN = '#2E7D32';
const LIGHT_GREEN = '#A5D6A7';
const BG = '#F5F5F5';
const WHITE = '#FFFFFF';

export default function CitizenSubmitComplaintScreen({ navigation }) {
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    Alert.alert('Complaint Submitted', 'We have received your complaint and will look into it shortly.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={DARK_GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit a Complaint</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={28} color={DARK_GREEN} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>
          Help us keep the city clean. Provide details about the issue and we'll resolve it as soon as possible.
        </Text>

        {/* Form Fields */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Type of Complaint</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>Select or describe your complaint</Text>
            <Ionicons name="chevron-down" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Provide more details..."
            placeholderTextColor="#999999"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Upload Photo</Text>
          <TouchableOpacity style={styles.uploadBox}>
            <View style={styles.cameraIconBox}>
              <Ionicons name="camera" size={24} color={DARK_GREEN} />
            </View>
            <Text style={styles.uploadText}>Attach Photo (optional)</Text>
            <Text style={styles.uploadSubtext}>JPG, PNG up to 5MB</Text>
          </TouchableOpacity>
        </View>

        {/* Location Card */}
        <View style={styles.locationCard}>
          <View style={styles.mapThumbnail}>
            <MaterialCommunityIcons name="map" size={32} color="#CCCCCC" />
          </View>
          <View style={styles.locationMiddle}>
            <Text style={styles.locationLabel}>DETECTED LOCATION</Text>
            <Text style={styles.locationAddress}>Maple Avenue 42, Central District</Text>
          </View>
          <Ionicons name="location" size={24} color={MED_GREEN} style={{ marginLeft: 8 }} />
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>SUBMIT COMPLAINT</Text>
          <Ionicons name="send" size={18} color={WHITE} style={{ marginLeft: 8 }} />
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
  
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  
  subtitle: { fontSize: 15, color: '#666666', lineHeight: 22, marginBottom: 24 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: MED_GREEN, marginBottom: 8 },
  
  dropdown: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: WHITE, borderWidth: 1, borderColor: '#E5E5E5',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  dropdownText: { fontSize: 15, color: '#666666' },

  textArea: {
    backgroundColor: WHITE, borderWidth: 1, borderColor: '#E5E5E5',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: '#1A1A1A', minHeight: 100,
  },

  uploadBox: {
    backgroundColor: WHITE, borderWidth: 2, borderColor: '#E8F5E9', borderStyle: 'dashed',
    borderRadius: 12, padding: 24, alignItems: 'center', justifyContent: 'center',
  },
  cameraIconBox: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  uploadText: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  uploadSubtext: { fontSize: 12, color: '#999999' },

  locationCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E5E5E5', borderRadius: 12, padding: 12,
    marginTop: 8,
  },
  mapThumbnail: {
    width: 60, height: 60, borderRadius: 8, backgroundColor: '#D4D4D4',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  locationMiddle: { flex: 1 },
  locationLabel: { fontSize: 10, fontWeight: 'bold', color: MED_GREEN, letterSpacing: 0.5, marginBottom: 4 },
  locationAddress: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },

  footer: { padding: 20, backgroundColor: BG },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: DARK_GREEN, borderRadius: 16, paddingVertical: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  submitBtnText: { fontSize: 16, fontWeight: 'bold', color: WHITE },
});
