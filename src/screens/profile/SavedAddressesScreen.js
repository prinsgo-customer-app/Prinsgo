import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { addAddress, deleteAddress } from '../../api/authApi';

const LABEL_ICONS = { home: 'home', work: 'briefcase', other: 'location' };

const SavedAddressesScreen = ({ navigation }) => {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleAddNew = (label) => {
    navigation.navigate('LocationSearch', {
      title: `Add ${label} address`,
      onSelect: async (place) => {
        setSaving(true);
        try {
          await addAddress({ label, address: place.address, lat: place.lat, lng: place.lng });
          await refreshUser();
        } catch (error) {
          Alert.alert('Failed to save address', error.message);
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleDelete = (addressId) => {
    Alert.alert('Remove address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(addressId);
            await refreshUser();
          } catch (error) {
            Alert.alert('Failed to remove', error.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.addressCard}>
      <Ionicons name={LABEL_ICONS[item.label] || 'location'} size={18} color={colors.primary} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.addressLabel}>{item.label}</Text>
        <Text style={styles.addressText} numberOfLines={2}>{item.address}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item._id)}>
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.quickAddRow}>
        <TouchableOpacity style={styles.quickAddBtn} onPress={() => handleAddNew('home')} disabled={saving}>
          <Ionicons name="home-outline" size={18} color={colors.primary} />
          <Text style={styles.quickAddText}>Add Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAddBtn} onPress={() => handleAddNew('work')} disabled={saving}>
          <Ionicons name="briefcase-outline" size={18} color={colors.primary} />
          <Text style={styles.quickAddText}>Add Work</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAddBtn} onPress={() => handleAddNew('other')} disabled={saving}>
          <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.quickAddText}>Add Other</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={user?.savedAddresses || []}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="location-outline" size={40} color={colors.gray} />
            <Text style={{ color: colors.textMuted, marginTop: 10 }}>No saved addresses yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 10,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  quickAddRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  quickAddBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, gap: 4,
  },
  quickAddText: { fontSize: 11, fontWeight: '600', color: colors.text },
  addressCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, marginBottom: 10,
  },
  addressLabel: { fontSize: 13, fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
  addressText: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});

export default SavedAddressesScreen;
