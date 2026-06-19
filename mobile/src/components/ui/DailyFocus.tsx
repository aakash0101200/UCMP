import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';

interface DailyFocusProps {
  activeColor: string;
  isDark: boolean;
  studentNameStyle: any;
  appSubtitleStyle: any;
}

export default function DailyFocus({
  activeColor,
  isDark,
  studentNameStyle,
  appSubtitleStyle
}: DailyFocusProps) {
  const breathAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const breathe = Animated.sequence([
      Animated.timing(breathAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(breathAnim, {
        toValue: 0,
        duration: 2500,
        useNativeDriver: true,
      }),
      Animated.delay(800)
    ]);
    Animated.loop(breathe).start();
  }, [breathAnim]);

  const ring3Scale = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] });
  const ring3Opacity = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.45] });
  const ring2Scale = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0.90, 1.25] });
  const ring2Opacity = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.35] });
  const ring1Scale = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.35] });
  const ring1Opacity = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.25] });
  const coreScale = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.05] });

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      <View style={styles.breatheContainer}>
        <Animated.View style={[styles.breatheRing, { transform: [{ scale: ring1Scale }], opacity: ring1Opacity, borderColor: activeColor }]} />
        <Animated.View style={[styles.breatheRing, { transform: [{ scale: ring2Scale }], opacity: ring2Opacity, borderColor: activeColor }]} />
        <Animated.View style={[styles.breatheRing, { transform: [{ scale: ring3Scale }], opacity: ring3Opacity, borderColor: activeColor }]} />
        <Animated.View style={[styles.breatheCore, { transform: [{ scale: coreScale }], backgroundColor: activeColor, shadowColor: activeColor }]} />
      </View>
      <Text style={[styles.breatheTitle, studentNameStyle]}>Daily Focus</Text>
      <Text style={[styles.breatheSubtitle, appSubtitleStyle]}>Breathe to center your study.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 20,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  cardDark: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
  },
  breatheContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  breatheRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
  },
  breatheCore: {
    width: 50,
    height: 50,
    borderRadius: 25,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  breatheTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  breatheSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
});
