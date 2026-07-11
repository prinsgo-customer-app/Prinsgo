import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import MainTabNavigator from './MainTabNavigator';
import RideBookingScreen from '../screens/ride/RideBookingScreen';
import RideTrackingScreen from '../screens/ride/RideTrackingScreen';
import ParcelBookingScreen from '../screens/parcel/ParcelBookingScreen';
import ParcelTrackingScreen from '../screens/parcel/ParcelTrackingScreen';
import LocationSearchScreen from '../screens/location/LocationSearchScreen';
import SavedAddressesScreen from '../screens/profile/SavedAddressesScreen';
import OffersScreen from '../screens/more/OffersScreen';
import SupportScreen from '../screens/more/SupportScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Otp" component={OtpScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          <Stack.Screen name="RideBooking" component={RideBookingScreen} />
          <Stack.Screen name="RideTracking" component={RideTrackingScreen} />
          <Stack.Screen name="ParcelBooking" component={ParcelBookingScreen} />
          <Stack.Screen name="ParcelTracking" component={ParcelTrackingScreen} />
          <Stack.Screen name="LocationSearch" component={LocationSearchScreen} />
          <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
          <Stack.Screen name="Offers" component={OffersScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
