import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import PrimaryButton from '../../components/PrimaryButton';
import { getParcelById, cancelParcel } from '../../api/parcelApi';
import { getSocket } from '../../utils/socket';

const STATUS_LABELS = {
  requested: 'Looking for a delivery partner...',
  accepted: 'Partner is heading to pickup',
  picked_up: 'Parcel picked up',
  in_transit: 'On the way to receiver',
  delivered: 'Delivered successfully',
  cancelled: 'Parcel cancelled',
};

const ParcelTrackingScreen = ({ route, navigation }) => {
  const { parcelId } = route.params || {};
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchParcel = useCallback(async () => {
    if (!parcelId) {
      setErrorMsg('No parcel selected');
      setLoading(false);
      return;
    }
    setErrorMsg('');
    try {
      const res = await getParcelById(parcelId);
      setParcel(res.parcel);
    } catch (error) {
      setErrorMsg(error.message || 'Could not load this parcel');
    } finally {
      setLoading(false);
    }
  }, [parcelId]);

  useEffect(() => {
    fetchParcel();
    const socket = getSocket();
    socket.emit('join_parcel_room', parcelId);
    const handleUpdate = () => fetchParcel();
    socket.on('parcel_status_update', handleUpdate);
    return () => socket.off('parcel_status_update', handleUpdate);
  }, [parcelId, fetchParcel]);

  const handleCancel = () => {
    Alert.alert('Cancel Parcel', 'Are you sure you want to cancel this delivery?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelParcel(parcelId, 'Cancelled by customer');
            navigation.replace('MainTabs');
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handleCallDriver = () => {
    if (parcel?.driver?.phone) Linking.openURL(`tel:${parcel.driver.phone}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (errorMsg || !parcel) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.gray} />
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 12, textAlign: 'center' }}>
          {errorMsg || 'Something went wrong'}
        </Text>
        <PrimaryButton title="Try Again" onPress={fetchParcel} style={{ marginTop: 20, width: 160 }} />
        <TouchableOpacity onPress={() => navigation.replace('MainTabs')} style={{ marginTop: 14 }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Back to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const canCancel = parcel.status === 'requested' || parcel.status === 'accepted';
  const isDelivered = parcel.status === 'delivered';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
          <Ionicons name="chevron-down" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{STATUS_LABELS[parcel.status] || parcel.status}</Text>
      </View>

      <View style={styles.mapPlaceholder}>
        <Ionicons name="cube-outline" size={48} color={colors.gray} />
        <Text style={{ color: colors.gray, marginTop: 8 }}>Live tracking</Text>
      </View>

      {(parcel.status === 'picked_up' || parcel.status === 'in_transit') && (
        <View style={styles.otpCard}>
          <Text style={styles.otpLabel}>Share this OTP with receiver on delivery</Text>
          <Text style={styles.otpCode}>{parcel.receiverOtp}</Text>
        </View>
      )}

      {parcel.driver && (
        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <Text style={{ color: colors.white, fontWeight: '700' }}>
              {parcel.driver.name?.charAt(0)?.toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.driverName}>{parcel.driver.name}</Text>
            <Text style={styles.driverSub}>{parcel.driver.vehicleNumber}</Text>
          </View>
          <TouchableOpacity style={styles.callBtn} onPress={handleCallDriver}>
            <Ionicons name="call" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.fareCard}>
        <Text style={styles.fareLabel}>Delivery Charge</Text>
        <Text style={styles.fareValue}>₹{parcel.charges.totalCharge}</Text>
        <Text style={styles.fareSub}>{parcel.pickup.address} → {parcel.drop.address}</Text>
      </View>

      {isDelivered && (
        <View style={styles.doneCard}>
          <Ionicons name="checkmark-circle" size={40} color={colors.success} />
          <Text style={styles.doneText}>Parcel delivered successfully!</Text>
        </View>
      )}

      {canCancel && (
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel Delivery</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 12 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text, flexShrink: 1 },
  mapPlaceholder: {
    height: 180, backgroundColor: colors.lightGray, marginHorizontal: 20, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  otpCard: {
    margin: 20, marginBottom: 0, padding: 16, backgroundColor: `${colors.primary}12`, borderRadius: 14,
    alignItems: 'center',
  },
  otpLabel: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  otpCode: { fontSize: 32, fontWeight: '900', color: colors.primary, letterSpacing: 8, marginTop: 8 },
  driverCard: {
    flexDirection: 'row', alignItems: 'center', margin: 20, padding: 14,
    borderWidth: 1, borderColor: colors.border, borderRadius: 14,
  },
  driverAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  driverName: { fontSize: 15, fontWeight: '700', color: colors.text },
  driverSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  callBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.success,
    alignItems: 'center', justifyContent: 'center',
  },
  fareCard: { marginHorizontal: 20, marginTop: 4 },
  fareLabel: { fontSize: 12, color: colors.textMuted },
  fareValue: { fontSize: 28, fontWeight: '900', color: colors.text, marginTop: 2 },
  fareSub: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  doneCard: { alignItems: 'center', marginTop: 20 },
  doneText: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 8 },
  cancelBtn: { margin: 20, alignItems: 'center', paddingVertical: 14 },
  cancelText: { color: colors.danger, fontWeight: '700', fontSize: 14 },
});

export default ParcelTrackingScreen;
