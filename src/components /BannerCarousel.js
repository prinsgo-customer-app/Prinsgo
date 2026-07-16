import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

const SLIDES = [
  { id: '1', title: 'Ride anytime,\nanywhere.', subtitle: 'Your journey, our priority.' },
  { id: '2', title: 'Moving You.\nDelivering Trust.', subtitle: 'Fast and reliable parcel delivery.' },
  { id: '3', title: 'Every Ride Simple.\nEvery Delivery Safe.', subtitle: 'One app, many possibilities.' },
];

const BannerCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  const onScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    width: CARD_WIDTH,
    height: 140,
    backgroundColor: colors.black,
    borderRadius: 18,
    padding: 20,
    justifyContent: 'center',
  },
  title: { color: colors.white, fontSize: 20, fontWeight: '800', lineHeight: 26 },
  subtitle: { color: colors.gray, fontSize: 13, marginTop: 8 },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginHorizontal: 3,
  },
  dotActive: { backgroundColor: colors.primary, width: 16 },
});

export default BannerCarousel;
