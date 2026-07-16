import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { getWalletTransactions } from '../../api/walletApi';

const WalletScreen = () => {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getWalletTransactions();
      setTransactions(res.transactions);
      await refreshUser();
    } catch (error) {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddMoney = () => {
    Alert.alert(
      'Coming Soon',
      'Online wallet top-up via UPI/Card will be available once payment gateway integration is complete.'
    );
  };

  const renderItem = ({ item }) => {
    const isCredit = item.type === 'credit';
    return (
      <View style={styles.txnCard}>
        <View style={[styles.txnIcon, { backgroundColor: isCredit ? '#22C55E1A' : '#EF44441A' }]}>
          <Ionicons
            name={isCredit ? 'arrow-down-circle' : 'arrow-up-circle'}
            size={22}
            color={isCredit ? colors.success : colors.danger}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.txnReason}>{item.reason.replace(/_/g, ' ')}</Text>
          <Text style={styles.txnDate}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        <Text style={[styles.txnAmount, { color: isCredit ? colors.success : colors.danger }]}>
          {isCredit ? '+' : '-'}₹{item.amount}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Wallet</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>₹{user?.walletBalance ?? 0}</Text>
        <TouchableOpacity style={styles.addMoneyBtn} onPress={handleAddMoney}>
          <Ionicons name="add-circle-outline" size={18} color={colors.white} />
          <Text style={styles.addMoneyText}>Add Money</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Transaction History</Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} colors={[colors.primary]} />}
        ListEmptyComponent={
          !loading && (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="wallet-outline" size={40} color={colors.gray} />
              <Text style={{ color: colors.textMuted, marginTop: 10 }}>No transactions yet</Text>
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
  balanceCard: {
    backgroundColor: colors.black, borderRadius: 18, margin: 20, padding: 22, alignItems: 'flex-start',
  },
  balanceLabel: { color: colors.gray, fontSize: 13 },
  balanceValue: { color: colors.white, fontSize: 32, fontWeight: '900', marginTop: 6 },
  addMoneyBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 16,
    paddingVertical: 10, borderRadius: 24, marginTop: 16, gap: 6,
  },
  addMoneyText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginHorizontal: 20, marginBottom: 10 },
  txnCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, marginBottom: 10,
  },
  txnIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txnReason: { fontSize: 13, fontWeight: '600', color: colors.text, textTransform: 'capitalize' },
  txnDate: { fontSize: 11, color: colors.textMuted, marginTop: 3 },
  txnAmount: { fontSize: 15, fontWeight: '800' },
});

export default WalletScreen;
