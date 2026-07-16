import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { SUPPORT_PHONE, SUPPORT_EMAIL } from '../../config';

const SupportScreen = ({ navigation }) => {
  const options = [
    {
      icon: 'call-outline',
      title: 'Call Support',
      subtitle: `+${SUPPORT_PHONE.slice(0, 2)} ${SUPPORT_PHONE.slice(2)}`,
      onPress: () => Linking.openURL(`tel:+${SUPPORT_PHONE}`),
    },
    {
      icon: 'logo-whatsapp',
      title: 'WhatsApp Support',
      subtitle: 'Chat with us instantly',
      onPress: () => Linking.openURL(`https://wa.me/${SUPPORT_PHONE}`),
    },
    {
      icon: 'mail-outline',
      title: 'Email Support',
      subtitle: SUPPORT_EMAIL,
      onPress: () => Linking.openURL(`mailto:${SUPPORT_EMAIL}`),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.banner}>
        <Ionicons name="headset" size={28} color={colors.primary} />
        <Text style={styles.bannerTitle}>Need Help?</Text>
        <Text style={styles.bannerSubtitle}>We are here to assist you, 24/7</Text>
      </View>

      {options.map((opt, idx) => (
        <TouchableOpacity key={idx} style={styles.optionCard} onPress={opt.onPress}>
          <View style={styles.iconWrap}>
            <Ionicons name={opt.icon} size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.optionTitle}>{opt.title}</Text>
            <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.gray} />
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, paddingHorizontal: 20 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  banner: {
    backgroundColor: `${colors.primary}12`, borderRadius: 16, padding: 20, alignItems: 'center',
    marginBottom: 20,
  },
  bannerTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 8 },
  bannerSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, marginBottom: 12,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.primary}1A`, alignItems: 'center', justifyContent: 'center' },
  optionTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  optionSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});

export default SupportScreen;
