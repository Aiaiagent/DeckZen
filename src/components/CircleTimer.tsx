import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, font } from '../theme';

/** A clean circular countdown ring with a gently breathing focal emoji + seconds. */
export function CircleTimer({
  size = 240,
  progress,
  secondsLeft,
  emoji,
  running,
}: {
  size?: number;
  /** 0..1 of total session elapsed */
  progress: number;
  secondsLeft: number;
  emoji: string;
  running: boolean;
}) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * (1 - Math.min(1, Math.max(0, progress)));

  const breathe = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!running) {
      breathe.stopAnimation();
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [running, breathe]);

  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.12] });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.surfaceAlt}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dash}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Animated.Text style={{ fontSize: 64, transform: [{ scale }] }}>
          {emoji}
        </Animated.Text>
        <Text style={[font.h2, { color: colors.textMuted, marginTop: 4 }]}>
          {secondsLeft}s
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
