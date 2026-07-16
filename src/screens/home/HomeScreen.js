import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import ServiceIcon from '../../components/ServiceIcon';
import QuickActionCard from '../../components/QuickActionCard';
import BannerCarousel from '../../components/BannerCarousel';
import { reverseGeocode } from '../../api/placesApi';
import { getActiveRide } from '../../api/rideApi';
import { getActiveParcels } from '../../api/parcelApi';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [currentAddress, setCurrentAddress] = useState('Fetching location...');
  const [coords, setCoords] = useState(null);
  const [checkingActive, setCheckingActive] = useState(true);

  useEffect(() => {
    detectLocation();
    checkActiveTrip();
  }, []);

  const detectLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentAddress('Location permission denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCoords({ lat: latitude, lng: longitude });
      const address = await reverseGeocode(latitude, longitude);
      setCurrentAddress(address);
    } catch (error) {
      setCurrentAddress('Could not fetch location');
    }
  };

  const checkActiveTrip = async () => {
    try {
      const [rideRes, parcelRes] = await Promise.all([getActiveRide(), getActiveParcels()]);
      if (rideRes.ride) {
        navigation.navigate('RideTracking', { rideId: rideRes.ride._id });
      } else if (parcelRes.parcels?.length > 0) {
        navigation.navigate('ParcelTracking', { parcelId: parcelRes.parcels[0]._id });
      }
    } catch (error) {
      // silently ignore - not critical for home screen load
    } finally {
      setCheckingActive(false);
    }
  };

  const goToRideBooking = (vehicleType) => {
    if (!coords) {
      Alert.alert('Fetching your location', 'Please wait a moment while we detect your location, then try again.');
      return;
    }
    navigation.navigate('RideBooking', { vehicleType, pickupCoords: coords, pickupAddress: currentAddress });
  };

  const goToParcelBooking = () => {
    if (!coords) {
      Alert.alert('Fetching your location', 'Please wait a moment while we detect your location, then try again.');
      return;
    }
    navigation.navigate('ParcelBooking', { pickupCoords: coords, pickupAddress: currentAddress });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>
            Prins<Text style={{ color: colors.primary }}>Go</Text>
          </Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current location */}
        <TouchableOpacity style={styles.locationRow}>
          <Ionicons name="location" size={16} color={colors.primary} />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={styles.locationLabel}>Current Location</Text>
            <Text style={styles.locationText} numberOfLines={1}>{currentAddress}</Text>
          </View>
        </TouchableOpacity>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Hero banner */}
          <BannerCarousel />

          {/* Service icons */}
          <View style={styles.serviceRow}>
            <ServiceIcon type="bike" label="Bike" onPress={() => goToRideBooking('bike')} />
            <ServiceIcon type="auto" label="Auto" onPress={() => goToRideBooking('auto')} />
            <ServiceIcon type="car_mini" label="Cab" onPress={() => goToRideBooking('car_mini')} />
            <ServiceIcon type="parcel" label="Parcel" onPress={goToParcelBooking} />
          </View>

          {/* Pickup / Drop card */}
          <View style={styles.card}>
            <View style={styles.rowItem}>
              <View style={styles.dotFilled} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.rowLabel}>Pickup Location</Text>
                <Text style={styles.rowValue} numberOfLines={1}>{currentAddress}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.rowItem} onPress={() => goToRideBooking('bike')}>
              <View style={styles.dotOutline} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.rowLabel}>Drop Location</Text>
                <Text style={styles.rowValuePlaceholder}>Enter drop location</Text>
              </View>
              <Ionicons name="add-circle" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Favourite Locations */}
          <Text style={styles.sectionTitle}>Favourite Locations</Text>
          <View style={styles.favRow}>
            <TouchableOpacity style={styles.favCard} onPress={() => navigation.navigate('SavedAddresses')}>
              <Ionicons name="home-outline" size={18} color={colors.primary} />
              <Text style={styles.favTitle}>Home</Text>
              <Text style={styles.favSubtitle}>Add address</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.favCard} onPress={() => navigation.navigate('SavedAddresses')}>
              <Ionicons name="briefcase-outline" size={18} color={colors.primary} />
              <Text style={styles.favTitle}>Work</Text>
              <Text style={styles.favSubtitle}>Add address</Text>
            </TouchableOpacity>
          </View>

          {/* Quick actions */}
          <View style={styles.quickRow}>
            <QuickActionCard icon="pricetag-outline" title="Offers" subtitle="Best deals" onPress={() => navigation.navigate('Offers')} />
            <QuickActionCard icon="gift-outline" title="Promo Codes" subtitle="Save more" onPress={() => navigation.navigate('Offers')} color={colors.success} />
            <QuickActionCard icon="wallet-outline" title="Wallet" subtitle={`₹${user?.walletBalance ?? 0}`} onPress={() => navigation.navigate('WalletTab')} color={colors.warning} />
          </View>

          <View style={styles.quickRow}>
            <QuickActionCard icon="bicycle-outline" title="Ride History" subtitle="View your rides" onPress={() => navigation.navigate('BookingsTab', { screen: 'Bookings', params: { tab: 'ride' } })} />
            <QuickActionCard icon="cube-outline" title="Parcel History" subtitle="View your parcels" onPress={() => navigation.navigate('BookingsTab', { screen: 'Bookings', params: { tab: 'parcel' } })} color="#8B5CF6" />
          </View>

          <TouchableOpacity style={styles.supportCard} onPress={() => navigation.navigate('Support')}>
            <Ionicons name="headset-outline" size={20} color={colors.primary} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.favTitle}>Support</Text>
              <Text style={styles.favSubtitle}>We are here to help</Text>
            </View>
          </TouchableOpacity>
        </View>

        {checkingActive && (
          <View style={{ paddingVertical: 10, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  logo: { fontSize: 22, fontWeight: '900', color: colors.black },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 6 },
  avatar: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '700' },
  locationRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10,
  },
  locationLabel: { fontSize: 11, color: colors.textMuted },
  locationText: { fontSize: 14, fontWeight: '600', color: colors.text },
  serviceRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    marginTop: 20, padding: 14,
  },
  rowItem: { flexDirection: 'row', alignItems: 'center' },
  dotFilled: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  dotOutline: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.primary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12, marginLeft: 20 },
  rowLabel: { fontSize: 11, color: colors.textMuted },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 2 },
  rowValuePlaceholder: { fontSize: 14, color: colors.gray, marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 24, marginBottom: 10 },
  favRow: { flexDirection: 'row', gap: 12 },
  favCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    padding: 14,
  },
  favTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 8 },
  favSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  quickRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  supportCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, padding: 14, marginTop: 12,
  },
});

export default HomeScreen;
