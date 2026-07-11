import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const MoreScreen = ({ navigation }) => {
  const items = [
    { icon: 'location-outline', label: 'Favourite Locations', onPress: () => navigation.navigate('SavedAddresses') },
    { icon: 'bicycle-outline', label: 'Ride History', onPress: () => navigation.navigate('BookingsTab', { screen: 'Bookings', params: { tab: 'ride' } }) },
    { icon: 'cube-outline', label: 'Parcel History', onPress: () => navigation.navigate('BookingsTab', { screen: 'Bookings', params: { tab: 'parcel' } }) },
    { icon: 'pricetag-outline', label: 'Offers & Promo Codes', onPress: () => navigation.navigate('Offers') },
    { icon: 'headset-outline', label: 'Support', onPress: () => navigation.navigate('Support') },
    { icon: 'person-outline', label: 'Profile', onPress: () => navigation.navigate('ProfileTab') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.headerTitle}>More</Text>
        <View style={styles.list}>
          {items.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.item} onPress={item.onPress}>
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.label}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.gray} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text, paddingHorizontal: 20, paddingTop: 16, marginBottom: 10 },
  list: { paddingHorizontal: 20 },
  item: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1,
    borderBottomColor: colors.border, gap: 12,
  },
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: `${colors.primary}1A`, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
});

export default MoreScreen;
