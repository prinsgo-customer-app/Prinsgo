import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import PrimaryButton from '../../components/PrimaryButton';
import { getRideById, cancelRide, rateRide } from '../../api/rideApi';
import { getSocket } from '../../utils/socket';

const STATUS_LABELS = {
  requested: 'Looking for a driver...',
  accepted: 'Driver is on the way',
  driver_arrived: 'Driver has arrived',
  started: 'Ride in progress',
  completed: 'Ride completed',
  cancelled: 'Ride cancelled',
};

const RideTrackingScreen = ({ route, navigation }) => {
  const { rideId } = route.params || {};
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [rating, setRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchRide = useCallback(async () => {
    if (!rideId) {
      setErrorMsg('No ride selected');
      setLoading(false);
      return;
    }
    setErrorMsg('');
    try {
      const res = await getRideById(rideId);
      setRide(res.ride);
    } catch (error) {
      setErrorMsg(error.message || 'Could not load this ride');
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  useEffect(() => {
    fetchRide();

    const socket = getSocket();
    socket.emit('join_ride_room', rideId);

    const handleStatusUpdate = () => fetchRide();
    socket.on('ride_status_update', handleStatusUpdate);

    return () => {
      socket.off('ride_status_update', handleStatusUpdate);
    };
  }, [rideId, fetchRide]);

  const handleCancel = () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel this ride?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelRide(rideId, 'Cancelled by customer');
            navigation.replace('MainTabs');
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handleCallDriver = () => {
    if (ride?.driver?.phone) {
      Linking.openURL(`tel:${ride.driver.phone}`);
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert('Select a rating', 'Please tap a star to rate your ride');
      return;
    }
    setSubmittingRating(true);
    try {
      await rateRide(rideId, rating);
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (errorMsg || !ride) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.gray} />
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 12, textAlign: 'center' }}>
          {errorMsg || 'Something went wrong'}
        </Text>
        <PrimaryButton title="Try Again" onPress={fetchRide} style={{ marginTop: 20, width: 160 }} />
        <TouchableOpacity onPress={() => navigation.replace('MainTabs')} style={{ marginTop: 14 }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Back to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const canCancel = ['requested', 'accepted', 'driver_arrived'].includes(ride.status);
  const isCompleted = ride.status === 'completed';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {!isCompleted && (
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
            <Ionicons name="chevron-down" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{STATUS_LABELS[ride.status] || ride.status}</Text>
      </View>

      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={48} color={colors.gray} />
        <Text style={{ color: colors.gray, marginTop: 8 }}>Live map view</Text>
      </View>

      {ride.status === 'driver_arrived' || ride.status === 'accepted' ? (
        <View style={styles.otpCard}>
          <Text style={styles.otpLabel}>Share this OTP with your driver to start the ride</Text>
          <Text style={styles.otpCode}>{ride.startOtp}</Text>
        </View>
      ) : null}

      {ride.driver && (
        <View style={styles.driverCard}>
          <View style={styles.driverAvatar}>
            <Text style={{ color: colors.white, fontWeight: '700' }}>
              {ride.driver.name?.charAt(0)?.toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.driverName}>{ride.driver.name}</Text>
            <Text style={styles.driverSub}>
              {ride.driver.vehicleNumber} • ⭐ {ride.driver.rating?.toFixed(1)}
            </Text>
          </View>
          <TouchableOpacity style={styles.callBtn} onPress={handleCallDriver}>
            <Ionicons name="call" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.fareCard}>
        <Text style={styles.fareLabel}>Trip Fare</Text>
        <Text style={styles.fareValue}>₹{ride.fare.totalFare}</Text>
        <Text style={styles.fareSub}>{ride.pickup.address} → {ride.drop.address}</Text>
      </View>

      {isCompleted && !ride.customerRating && (
        <View style={styles.ratingCard}>
          <Text style={styles.sectionTitle}>Rate your ride</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 12 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={32}
                  color={colors.warning}
                  style={{ marginHorizontal: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <PrimaryButton title="Submit Rating" onPress={handleSubmitRating} loading={submittingRating} />
        </View>
      )}

      {canCancel && (
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel Ride</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 12 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  mapPlaceholder: {
    height: 220, backgroundColor: colors.lightGray, marginHorizontal: 20, borderRadius: 16,
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
  ratingCard: { margin: 20, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'center' },
  cancelBtn: { margin: 20, alignItems: 'center', paddingVertical: 14 },
  cancelText: { color: colors.danger, fontWeight: '700', fontSize: 14 },
});

export default RideTrackingScreen;
