import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import InputField from '../../components/InputField';
import PrimaryButton from '../../components/PrimaryButton';
import { estimateParcelCharge, bookParcel } from '../../api/parcelApi';

const PARCEL_TYPES = [
  { key: 'document', label: 'Document' },
  { key: 'food', label: 'Food' },
  { key: 'electronics', label: 'Electronics' },
  { key: 'clothing', label: 'Clothing' },
  { key: 'fragile', label: 'Fragile' },
  { key: 'other', label: 'Other' },
];

const WEIGHT_OPTIONS = [
  { key: 'upto_1kg', label: 'Up to 1kg' },
  { key: 'upto_5kg', label: 'Up to 5kg' },
  { key: 'upto_10kg', label: 'Up to 10kg' },
  { key: 'upto_20kg', label: 'Up to 20kg' },
];

const ParcelBookingScreen = ({ route, navigation }) => {
  const { pickupCoords, pickupAddress } = route.params;

  const [pickup, setPickup] = useState({
    address: pickupAddress,
    ...pickupCoords,
    contactName: '',
    contactPhone: '',
  });
  const [drop, setDrop] = useState(null);
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [parcelType, setParcelType] = useState('document');
  const [weightCategory, setWeightCategory] = useState('upto_1kg');
  const [charges, setCharges] = useState(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (drop?.lat && pickup?.lat) fetchEstimate();
  }, [drop, weightCategory]);

  const fetchEstimate = async () => {
    setLoadingEstimate(true);
    setCharges(null);
    try {
      const res = await estimateParcelCharge({
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        dropLat: drop.lat,
        dropLng: drop.lng,
        weightCategory,
      });
      setCharges(res.charges);
    } catch (error) {
      Alert.alert('Could not calculate charge', error.message);
    } finally {
      setLoadingEstimate(false);
    }
  };

  const openLocationSearch = () => {
    navigation.navigate('LocationSearch', {
      title: 'Drop location',
      onSelect: (location) => setDrop({ ...location }),
    });
  };

  const handleBook = async () => {
    if (!drop) return Alert.alert('Select drop location');
    if (!pickup.contactName || !/^[6-9]\d{9}$/.test(pickup.contactPhone)) {
      return Alert.alert('Sender details missing', 'Enter valid sender name and phone number');
    }
    if (!receiverName || !/^[6-9]\d{9}$/.test(receiverPhone)) {
      return Alert.alert('Receiver details missing', 'Enter valid receiver name and phone number');
    }

    setBooking(true);
    try {
      const res = await bookParcel({
        pickup,
        drop: { ...drop, contactName: receiverName, contactPhone: receiverPhone },
        parcelType,
        weightCategory,
        paymentMethod: 'cash',
      });
      navigation.replace('ParcelTracking', { parcelId: res.parcel._id });
    } catch (error) {
      Alert.alert('Booking failed', error.message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send a Parcel</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
        <View style={styles.locationCard}>
          <View style={styles.rowItem}>
            <View style={styles.dotFilled} />
            <Text style={styles.rowValue} numberOfLines={1}>{pickup.address}</Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.rowItem} onPress={openLocationSearch}>
            <View style={styles.dotOutline} />
            <Text style={drop ? styles.rowValue : styles.placeholder} numberOfLines={1}>
              {drop?.address || 'Enter drop location'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Sender Details</Text>
        <InputField
          placeholder="Sender name"
          value={pickup.contactName}
          onChangeText={(t) => setPickup({ ...pickup, contactName: t })}
        />
        <InputField
          placeholder="Sender phone number"
          keyboardType="number-pad"
          maxLength={10}
          value={pickup.contactPhone}
          onChangeText={(t) => setPickup({ ...pickup, contactPhone: t })}
        />

        <Text style={styles.sectionTitle}>Receiver Details</Text>
        <InputField placeholder="Receiver name" value={receiverName} onChangeText={setReceiverName} />
        <InputField
          placeholder="Receiver phone number"
          keyboardType="number-pad"
          maxLength={10}
          value={receiverPhone}
          onChangeText={setReceiverPhone}
        />

        <Text style={styles.sectionTitle}>Parcel Type</Text>
        <View style={styles.chipWrap}>
          {PARCEL_TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.chip, parcelType === t.key && styles.chipActive]}
              onPress={() => setParcelType(t.key)}
            >
              <Text style={[styles.chipText, parcelType === t.key && { color: colors.white }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Weight</Text>
        <View style={styles.chipWrap}>
          {WEIGHT_OPTIONS.map((w) => (
            <TouchableOpacity
              key={w.key}
              style={[styles.chip, weightCategory === w.key && styles.chipActive]}
              onPress={() => setWeightCategory(w.key)}
            >
              <Text style={[styles.chipText, weightCategory === w.key && { color: colors.white }]}>{w.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loadingEstimate && <ActivityIndicator style={{ marginTop: 16 }} color={colors.primary} />}
        {charges && (
          <View style={styles.chargeCard}>
            <Text style={styles.chargeLabel}>Delivery Charge</Text>
            <Text style={styles.chargeValue}>₹{charges.totalCharge}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title={charges ? `Book Now • ₹${charges.totalCharge}` : 'Book Now'}
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
  locationCard: { backgroundColor: colors.lightGray, borderRadius: 16, padding: 16, marginTop: 8 },
  rowItem: { flexDirection: 'row', alignItems: 'center' },
  dotFilled: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginRight: 10 },
  dotOutline: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: colors.primary, marginRight: 10 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12, marginLeft: 20 },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.text, flex: 1 },
  placeholder: { fontSize: 14, color: colors.gray, flex: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 10 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  chargeCard: { marginTop: 20, alignItems: 'center' },
  chargeLabel: { fontSize: 12, color: colors.textMuted },
  chargeValue: { fontSize: 26, fontWeight: '900', color: colors.text, marginTop: 4 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: colors.border },
});

export default ParcelBookingScreen;
