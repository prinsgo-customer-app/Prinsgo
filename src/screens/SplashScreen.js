import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        Prins<Text style={styles.logoAccent}>Go</Text>
      </Text>
      <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 40, fontWeight: '900', color: colors.black },
  logoAccent: { color: colors.primary },
});

export default SplashScreen;
