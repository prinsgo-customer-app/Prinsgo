import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import HomeScreen from '../screens/home/HomeScreen';
import BookingsStack from './BookingsStack';
import WalletScreen from '../screens/wallet/WalletScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MoreScreen from '../screens/more/MoreScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  HomeTab: 'home',
  BookingsTab: 'swap-horizontal',
  WalletTab: 'wallet',
  ProfileTab: 'person',
  MoreTab: 'grid',
};

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.gray,
      tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      tabBarIcon: ({ color, size, focused }) => (
        <Ionicons name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`} size={size - 2} color={color} />
      ),
    })}
  >
    <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
    <Tab.Screen name="BookingsTab" component={BookingsStack} options={{ title: 'Bookings' }} />
    <Tab.Screen name="WalletTab" component={WalletScreen} options={{ title: 'Wallet' }} />
    <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    <Tab.Screen name="MoreTab" component={MoreScreen} options={{ title: 'More' }} />
  </Tab.Navigator>
);

export default MainTabNavigator;
