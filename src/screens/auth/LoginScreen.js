import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { sendOtp } from '../../api/authApi';
import { API_BASE_URL } from '../../config';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Hit the server's root '/' (not '/api'), which responds with a simple JSON status - no auth needed
        // Timeout is generous because Render's free tier "spins down" when idle and can take
        // 30-50 seconds to wake up on the first request after inactivity.
        const rootUrl = API_BASE_URL.replace(/\/api\/?$/, '/');
        await axios.get(rootUrl, { timeout: 45000 });
      } catch (error) {
        if (!error.response) {
          setConnectionError(
            `Cannot reach ${API_BASE_URL}. Check that your backend is running, src/config.js has your computer's correct LAN IP (not localhost), and your phone + computer are on the same WiFi.`
          );
        }
        // If we got a response (even an error one), the server IS reachable — no banner needed
      }
    };
    checkConnection();
  }, []);

  const handleContinue = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      Alert.alert('Invalid number', 'Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      await sendOtp(phone);
      navigation.navigate('Otp', { phone });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.content}>
          <Text style={styles.logo}>
            Prins<Text style={{ color: colors.primary }}>Go</Text>
          </Text>
          <Text style={styles.heading}>Enter your mobile number</Text>
          <Text style={styles.subheading}>We'll send you a one-time OTP to verify</Text>

          {connectionError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerTitle}>⚠️ Can't reach the backend</Text>
              <Text style={styles.errorBannerText}>{connectionError}</Text>
              <Text style={styles.errorBannerText}>Current API_BASE_URL: {API_BASE_URL}</Text>
            </View>
          ) : null}

          <View style={styles.phoneRow}>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>+91</Text>
            </View>
            <InputField
              style={{ flex: 1, marginBottom: 0 }}
              placeholder="98765 43210"
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <PrimaryButton title="Continue" onPress={handleContinue} loading={loading} style={{ marginTop: 24 }} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  logo: { fontSize: 32, fontWeight: '900', color: colors.black, marginBottom: 40, textAlign: 'center' },
  heading: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subheading: { fontSize: 14, color: colors.textMuted, marginBottom: 24 },
  phoneRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  codeBox: {
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: { fontSize: 16, fontWeight: '700', color: colors.text },
  errorBanner: {
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 12,
    padding: 12, marginBottom: 20,
  },
  errorBannerTitle: { fontSize: 13, fontWeight: '800', color: colors.danger, marginBottom: 4 },
  errorBannerText: { fontSize: 11, color: '#991B1B', lineHeight: 16 },
});

export default LoginScreen;
