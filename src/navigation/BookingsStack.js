import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookingsScreen from '../screens/bookings/BookingsScreen';

const Stack = createNativeStackNavigator();

const BookingsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Bookings" component={BookingsScreen} />
  </Stack.Navigator>
);

export default BookingsStack;
