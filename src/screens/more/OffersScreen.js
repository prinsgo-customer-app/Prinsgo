import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const OffersScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offers & Promo Codes</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.emptyState}>
        <Ionicons name="pricetag-outline" size={48} color={colors.gray} />
        <Text style={styles.emptyTitle}>No active offers right now</Text>
        <Text style={styles.emptySubtitle}>
          Check back soon — new promo codes and discounts will show up here as soon as they're live.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 10,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 8, textAlign: 'center', lineHeight: 20 },
});

export default OffersScreen;
