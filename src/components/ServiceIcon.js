import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const ICONS = {
  bike: { lib: 'material', name: 'motorbike' },
  auto: { lib: 'material', name: 'rickshaw' },
  car_mini: { lib: 'ion', name: 'car-sport' },
  car_sedan: { lib: 'ion', name: 'car' },
  parcel: { lib: 'ion', name: 'cube' },
};

const ServiceIcon = ({ type, label, onPress, active }) => {
  const icon = ICONS[type] || ICONS.parcel;
  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.circle, active && styles.circleActive]}>
        {icon.lib === 'material' ? (
          <MaterialCommunityIcons
            name={icon.name}
            size={26}
            color={active ? colors.white : colors.primary}
          />
        ) : (
          <Ionicons name={icon.name} size={24} color={active ? colors.white : colors.primary} />
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

// Styles
const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', width: 76 },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  circleActive: { backgroundColor: colors.primary },
  label: { fontSize: 12, fontWeight: '600', color: colors.text },
});

export default ServiceIcon;
