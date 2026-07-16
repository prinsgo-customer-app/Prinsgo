import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { sendOtp, verifyOtp } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const OtpScreen = ({ route, navigation }) => {
  const { phone } = route.params;
  const { login } = useAuth();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (code.length < 6) {
      Alert.alert('Invalid OTP', 'Enter the 6-digit OTP sent to your phone');
      return;
    }
    if (isNewUser && !name.trim()) {
      Alert.alert('Name required', 'Please enter your name to create an account');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(phone, code, name.trim() || undefined);
      await login(res.token, res.user);
    } catch (error) {
      if (error.message.toLowerCase().includes('name is required')) {
        setIsNewUser(true);
      } else {
        Alert.alert('Verification failed', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await sendOtp(phone);
      Alert.alert('OTP sent', 'A new OTP has been sent to your phone');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Verify your number</Text>
        <Text style={styles.subheading}>Enter the OTP sent to +91 {phone}</Text>

        <InputField
          placeholder="6-digit OTP"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
          style={{ marginTop: 20 }}
        />

        {isNewUser && (
          <InputField placeholder="Your full name" value={name} onChangeText={setName} autoFocus />
        )}

        <PrimaryButton title="Verify & Continue" onPress={handleVerify} loading={loading} style={{ marginTop: 8 }} />

        <TouchableOpacity onPress={handleResend} disabled={resending} style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>
            {resending ? 'Resending...' : "Didn't receive OTP? Resend"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subheading: { fontSize: 14, color: colors.textMuted, marginBottom: 10 },
});

export default OtpScreen;
