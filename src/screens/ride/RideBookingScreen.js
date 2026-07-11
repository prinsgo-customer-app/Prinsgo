import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import PrimaryButton from '../../components/PrimaryButton';
import { estimateRideFare, bookRide } from '../../api/rideApi';

const VEHICLE_OPTIONS = [
  { type: 'bike', label: 'Bike', icon: 'motorbike' },
  { type: 'auto', label: 'Auto', icon: 'rickshaw' },
  { type: 'car_mini', label: 'Cab Mini', icon: 'car' },
  { type: 'car_sedan', label: 'Cab Sedan', icon: 'car-side' },
];

const PAYMENT_OPTIONS = [
  { key: 'cash', label: 'Cash', icon: 'cash-outline' },
  { key: 'wallet', label: 'Wallet', icon: 'wallet-outline' },
];

const RideBookingScreen = ({ route, navigation }) => {
  const { pickupCoords, pickupAddress, vehicleType: initialVehicle } = route.params;

  const [pickup, setPickup] = useState({ address: pickupAddress, ...pickupCoords });
  const [drop, setDrop] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(initialVehicle || 'bike');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [estimates, setEstimates] = useState(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (drop && pickup?.lat) {
      fetchEstimate();
    }
  }, [drop]);

  const fetchEstimate = async () => {
    setLoadingEstimate(true);
    setEstimates(null);
    try {
      const res = await estimateRideFare({
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        dropLat: drop.lat,
        dropLng: drop.lng,
      });
      setEstimates(res);
    } catch (error) {
      Alert.alert('Could not calculate fare', error.message);
    } finally {
      setLoadingEstimate(false);
    }
  };

  const openLocationSearch = () => {
    navigation.navigate('LocationSearch', {
      title: 'Where to?',
      onSelect: (location) => setDrop(location),
    });
  };

  const handleBook = async () => {
    if (!drop) {
      Alert.alert('Select drop location', 'Please choose where you want to go');
      return;
    }
    setBooking(true);
    try {
      const res = await bookRide({
        pickup,
        drop,
        vehicleType: selectedVehicle,
        paymentMethod,
      });
      navigation.replace('RideTracking', { rideId: res.ride._id });
    } catch (error) {
      Alert.alert('Booking failed', error.message);
    } finally {
      setBooking(false);
    }
  };

  const selectedEstimate = estimates?.estimates?.find((e) => e.vehicleType === selectedVehicle);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Ride</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
        {/* Location card */}
        <View style={styles.locationCard}>
          <View style={styles.rowItem}>
            <View style={styles.dotFilled} />
            <Text style={styles.rowValue} numberOfLines={1}>{pickup?.address || 'Fetching...'}</Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.rowItem} onPress={openLocationSearch}>
            <View style={styles.dotOutline} />
            <Text style={drop ? styles.rowValue : styles.placeholder} numberOfLines={1}>
              {drop?.address || 'Enter drop location'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle options */}
        <Text style={styles.sectionTitle}>Choose a ride</Text>
        {VEHICLE_OPTIONS.map((v) => {
          const est = estimates?.estimates?.find((e) => e.vehicleType === v.type);
          return (
            <TouchableOpacity
              key={v.type}
              style={[styles.vehicleRow, selectedVehicle === v.type && styles.vehicleRowActive]}
              onPress={() => setSelectedVehicle(v.type)}
            >
              <MaterialCommunityIcons name={v.icon} size={28} color={colors.text} />
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={styles.vehicleLabel}>{v.label}</Text>
                {estimates && <Text style={styles.vehicleSub}>{estimates.durationMin} min • {estimates.distanceKm} km</Text>}
              </View>
              {loadingEstimate ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                est && <Text style={styles.vehicleFare}>₹{est.totalFare}</Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Payment method */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentRow}>
          {PAYMENT_OPTIONS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[styles.paymentChip, paymentMethod === p.key && styles.paymentChipActive]}
              onPress={() => setPaymentMethod(p.key)}
            >
              <Ionicons name={p.icon} size={16} color={paymentMethod === p.key ? colors.white : colors.text} />
              <Text style={[styles.paymentLabel, paymentMethod === p.key && { color: colors.white }]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title={selectedEstimate ? `Book Now • ₹${selectedEstimate.totalFare}` : 'Book Now'}
          onPress={handleBook}
          loading={booking}
          disabled={!drop || loadingEstimate}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  locationCard: {
    backgroundColor: colors.lightGray, borderRadius: 16, padding: 16, marginTop: 8,
  },
  rowItem: { flexDirection: 'row', alignItems: 'center' },
  dotFilled: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginRight: 10 },
  dotOutline: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.primary, marginRight: 10 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12, marginLeft: 20 },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1 },
  placeholder: { fontSize: 14, color: colors.gray, flex: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 24, marginBottom: 10 },
  vehicleRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.border, marginBottom: 10,
  },
  vehicleRowActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}0D` },
  vehicleLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  vehicleSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  vehicleFare: { fontSize: 16, fontWeight: '800', color: colors.text },
  paymentRow: { flexDirection: 'row', gap: 10 },
  paymentChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border,
  },
  paymentChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  paymentLabel: { fontSize: 13, fontWeight: '600', color: colors.text },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: colors.border },
});

export default RideBookingScreen;
