import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/authApi';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name, email });
      await refreshUser();
      setEditing(false);
    } catch (error) {
      Alert.alert('Update failed', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    { icon: 'location-outline', label: 'Saved Addresses', onPress: () => navigation.navigate('SavedAddresses') },
    { icon: 'bicycle-outline', label: 'Ride History', onPress: () => navigation.navigate('BookingsTab', { screen: 'Bookings', params: { tab: 'ride' } }) },
    { icon: 'cube-outline', label: 'Parcel History', onPress: () => navigation.navigate('BookingsTab', { screen: 'Bookings', params: { tab: 'parcel' } }) },
    { icon: 'wallet-outline', label: 'Wallet', onPress: () => navigation.navigate('WalletTab') },
    { icon: 'headset-outline', label: 'Support', onPress: () => navigation.navigate('Support') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons name={editing ? 'close' : 'create-outline'} size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>

          {editing ? (
            <View style={{ width: '100%', marginTop: 16 }}>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email (optional)"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.phone}>+91 {user?.phone}</Text>
              {user?.email ? <Text style={styles.phone}>{user.email}</Text> : null}
              <View style={styles.referralBadge}>
                <Ionicons name="gift-outline" size={14} color={colors.primary} />
                <Text style={styles.referralText}>Referral Code: {user?.referralCode}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.menuList}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.menuItem} onPress={item.onPress}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.gray} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={[styles.menuLabel, { color: colors.danger }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  profileCard: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 28, fontWeight: '800' },
  name: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 12 },
  phone: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  referralBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: `${colors.primary}1A`,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 12, gap: 6,
  },
  referralText: { fontSize: 12, fontWeight: '600', color: colors.primaryDark },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, marginBottom: 12, fontSize: 14, color: colors.text,
  },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  menuList: { marginTop: 10, paddingHorizontal: 20 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1,
    borderBottomColor: colors.border, gap: 12,
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
});

export default ProfileScreen;
