import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useTranslation } from '../i18n';
import AutoText from './AutoText';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'cg', label: 'Chhattisgarhi', native: 'छत्तीसगढ़ी' },
];

const LanguagePickerModal = ({ visible, onClose }) => {
  const { t, lang, setLang, isLoading } = useTranslation();

  const handleSelect = (code) => {
    if (isLoading) return;
    setLang(code);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity 
        style={styles.overlay} 
        onPress={onClose} 
        activeOpacity={1}
      >
        <View style={styles.sheet}>
          <AutoText style={styles.title}>Select Language</AutoText>

          {isLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#4ade80" size="small" />
              <Text style={styles.loadingText}>
                {lang === 'hi' ? 'हिंदी लोड हो रहा है...' : 'Loading translations...'}
              </Text>
            </View>
          )}

          {LANGUAGES.map(item => (
            <TouchableOpacity
              key={item.code}
              style={[
                styles.option,
                lang === item.code && styles.activeOption,
                isLoading && styles.disabledOption,
              ]}
              onPress={() => handleSelect(item.code)}
              disabled={isLoading}
            >
              <Text style={[
                styles.optionText,
                lang === item.code && styles.activeText
              ]}>
                {item.native}
              </Text>
              {lang === item.code && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
  },
  title: {
    color: '#4ade80', fontSize: 18,
    fontWeight: '700', textAlign: 'center',
    marginBottom: 20,
  },
  loadingRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, padding: 10,
    backgroundColor: 'rgba(74,222,128,0.1)',
    borderRadius: 8, marginBottom: 12,
  },
  loadingText: {
    color: '#4ade80', fontSize: 13,
  },
  option: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 14,
    paddingHorizontal: 16, borderRadius: 10,
    marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeOption: { backgroundColor: 'rgba(74,222,128,0.15)',
    borderWidth: 1, borderColor: '#4ade80' },
  disabledOption: { opacity: 0.5 },
  optionText: { color: '#ffffff', fontSize: 16 },
  activeText: { color: '#4ade80', fontWeight: '700' },
  checkmark: { color: '#4ade80', fontSize: 18, fontWeight: '700' },
});

export default LanguagePickerModal;
