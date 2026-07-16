import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { getRideHistory } from '../../api/rideApi';
import { getParcelHistory } from '../../api/parcelApi';

const STATUS_COLORS = {
  completed: colors.success,
  delivered: colors.success,
  cancelled: colors.danger,
};

const BookingsScreen = ({ route, navigation }) => {
  const [tab, setTab] = useState(route.params?.tab || 'ride');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'ride') {
        const res = await getRideHistory();
        setItems(res.rides);
      } else {
        const res = await getParcelHistory();
        setItems(res.parcels);
      }
    } catch (error) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderItem = ({ item }) => {
    const isRide = tab === 'ride';
    const amount = isRide ? item.fare.totalFare : item.charges.totalCharge;
    return (
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name={isRide ? 'bicycle' : 'cube'} size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.route} numberOfLines={1}>
            {item.pickup.address} → {item.drop.address}
          </Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.amount}>₹{amount}</Text>
          <Text style={[styles.status, { color: STATUS_COLORS[item.status] || colors.textMuted }]}>
            {item.status}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>My Bookings</Text>

      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab === 'ride' && styles.tabActive]} onPress={() => setTab('ride')}>
          <Text style={[styles.tabText, tab === 'ride' && styles.tabTextActive]}>Rides</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'parcel' && styles.tabActive]} onPress={() => setTab('parcel')}>
          <Text style={[styles.tabText, tab === 'parcel' && styles.tabTextActive]}>Parcels</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={[colors.primary]} />}
        ListEmptyComponent={
          !loading && (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Ionicons name="receipt-outline" size={40} color={colors.gray} />
              <Text style={{ color: colors.textMuted, marginTop: 10 }}>No {tab} history yet</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.text, paddingHorizontal: 20, paddingTop: 16 },
  tabRow: { flexDirection: 'row', marginHorizontal: 20, marginVertical: 16, backgroundColor: colors.lightGray, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: colors.white },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.text },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, marginBottom: 12,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.primary}1A`, alignItems: 'center', justifyContent: 'center' },
  route: { fontSize: 13, fontWeight: '600', color: colors.text },
  date: { fontSize: 11, color: colors.textMuted, marginTop: 3 },
  amount: { fontSize: 15, fontWeight: '800', color: colors.text },
  status: { fontSize: 11, fontWeight: '600', marginTop: 3, textTransform: 'capitalize' },
});

export default BookingsScreen;
