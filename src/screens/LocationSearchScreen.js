import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../../components/InputField';
import { colors } from '../../theme/colors';
import { searchPlaces, getPlaceDetails } from '../../api/placesApi';

let debounceTimer = null;

const LocationSearchScreen = ({ navigation, route }) => {
  const { onSelect, title = 'Where are you going?' } = route.params;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (text) => {
    setQuery(text);
    if (debounceTimer) clearTimeout(debounceTimer);

    if (text.trim().length < 3) {
      setResults([]);
      return;
    }

    debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const predictions = await searchPlaces(text);
        setResults(predictions);
      } catch (error) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleSelect = async (item) => {
    setLoading(true);
    try {
      const details = await getPlaceDetails(item.place_id);
      onSelect({ address: details.address, lat: details.lat, lng: details.lng });
      navigation.goBack();
    } catch (error) {
      // If it fails, just close - user can retry
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <InputField
          placeholder="Search for an address..."
          value={query}
          onChangeText={handleChange}
          autoFocus
        />
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 10 }} color={colors.primary} />}

      <FlatList
        data={results}
        keyExtractor={(item) => item.place_id}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultRow} onPress={() => handleSelect(item)}>
            <Ionicons name="location-outline" size={18} color={colors.textMuted} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.resultMain} numberOfLines={1}>
                {item.structured_formatting?.main_text || item.description}
              </Text>
              <Text style={styles.resultSecondary} numberOfLines={1}>
                {item.structured_formatting?.secondary_text || ''}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  resultRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  resultMain: { fontSize: 14, fontWeight: '600', color: colors.text },
  resultSecondary: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});

export default LocationSearchScreen;
