import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, radius, spacing, font, shadow } from '../theme';
import { GardenMood } from '../types';
import { plantStage, MOOD_META, activeResident } from '../data/garden';

/**
 * The hero "desk scene": a virtual desk with a plant (the main avatar),
 * a lamp, and a chair. When neglected, a body "resident" pops in to nag.
 * Uses gentle Animated loops only — no heavy deps, smooth on both platforms.
 */
export function DeskGarden({
  points,
  mood,
}: {
  points: number;
  mood: GardenMood;
}) {
  const sway = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const breath = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 3400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 3400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    breath.start();
    return () => {
      loop.stop();
      breath.stop();
    };
  }, [sway, breathe]);

  const rotate = sway.interpolate({
    inputRange: [0, 1],
    outputRange: ['-3deg', '3deg'],
  });
  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  const meta = MOOD_META[mood];
  const resident = activeResident(mood);
  const wilt = mood === 'wilting' || mood === 'stressed';

  return (
    <View style={[styles.scene, { backgroundColor: meta.sky }]}>
      {/* sun / mood glow */}
      <View style={styles.glow} />

      {resident && (
        <View style={styles.resident}>
          <Text style={{ fontSize: 26 }}>{resident.emoji}</Text>
          <Text style={[font.small, styles.residentLine]}>{resident.line}</Text>
        </View>
      )}

      {/* lamp */}
      <Text style={styles.lamp}>💡</Text>

      {/* plant */}
      <Animated.Text
        style={[
          styles.plant,
          { transform: [{ rotate }, { scale }], opacity: wilt ? 0.78 : 1 },
        ]}
      >
        {plantStage(points)}
      </Animated.Text>

      {/* desk surface */}
      <View style={styles.desk} />
      <View style={styles.deskLegLeft} />
      <View style={styles.deskLegRight} />

      {/* chair peeking */}
      <Text style={styles.chair}>🪑</Text>

      <View style={styles.moodTag}>
        <Text style={[font.tiny, { color: colors.primaryDark }]}>
          {meta.label.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    height: 260,
    borderRadius: radius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    ...shadow.card,
  },
  glow: {
    position: 'absolute',
    top: -50,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.sun + '55',
  },
  lamp: { position: 'absolute', top: 26, left: 34, fontSize: 40 },
  plant: { fontSize: 96, marginBottom: 70 },
  desk: {
    position: 'absolute',
    bottom: 40,
    width: '78%',
    height: 22,
    borderRadius: 8,
    backgroundColor: '#C9A27E',
  },
  deskLegLeft: {
    position: 'absolute',
    bottom: 8,
    left: '16%',
    width: 12,
    height: 34,
    borderRadius: 4,
    backgroundColor: '#B08A66',
  },
  deskLegRight: {
    position: 'absolute',
    bottom: 8,
    right: '16%',
    width: 12,
    height: 34,
    borderRadius: 4,
    backgroundColor: '#B08A66',
  },
  chair: { position: 'absolute', bottom: 4, right: '24%', fontSize: 34 },
  resident: {
    position: 'absolute',
    top: 20,
    right: 16,
    maxWidth: 150,
    alignItems: 'flex-end',
  },
  residentLine: {
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 2,
    fontStyle: 'italic',
  },
  moodTag: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: '#FFFFFFCC',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
});
