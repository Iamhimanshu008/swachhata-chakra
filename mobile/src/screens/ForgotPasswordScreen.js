import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import client from '../api/client'; // wait, user had `import { apiClient } from '../api/client';` but the default export is client! Let me check client.js again. Ah, `import client from '../api/client'` is what authApi.js used. I will use `import client from '../api/client'`. Wait, I will stick to what works for the project. Let me look at `client.js`. Yes, it exports default client.

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) { 
      Alert.alert('Error', 'Please enter your email address'); 
      return; 
    }
    setLoading(true);
    try {
      await client.post('/auth/forgot-password', { email: email.trim() });
      Alert.alert(
        'Email Sent ✅', 
        'Password reset link has been sent to your email address.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.detail || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your registered email address and we'll send you a reset link.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleReset} 
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1B4332' },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  subtitle: { color: '#B7E4C7', marginBottom: 32, fontSize: 14, lineHeight: 22 },
  input: { 
    backgroundColor: '#fff', borderRadius: 12, padding: 14, 
    marginBottom: 20, fontSize: 16, color: '#222' 
  },
  button: { 
    backgroundColor: '#40916C', padding: 16, borderRadius: 12, 
    alignItems: 'center', marginBottom: 16 
  },
  buttonDisabled: { backgroundColor: '#2D6A4F', opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backBtn: { alignItems: 'center', padding: 10 },
  backText: { color: '#74C69D', fontSize: 14 }
});
