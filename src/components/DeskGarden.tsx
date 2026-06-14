import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, radius, spacing, font, shadow } from '../theme';
import { GardenMood } from '../types';
import { plantStage, MOOD_META, activeResident } from '../data/garden';

/**
 * The hero "desk scene": a cozy little workspace built from soft React Native
 * shapes — a warm desk, a potted plant (the growth avatar), a sage desk lamp
 * with a pool of light, and a steaming mug. When neglected, a body "resident"
 * peeks in to nag. Gentle Animated loops only — no heavy deps.
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
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (val: Animated.Value, duration: number, easing: (v: number) => number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration, easing, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration, easing, useNativeDriver: true }),
        ]),
      );
    const a = loop(sway, 2600, Easing.inOut(Easing.sin));
    const b = loop(breathe, 3400, Easing.inOut(Easing.ease));
    const c = loop(glow, 4200, Easing.inOut(Easing.ease));
    a.start();
    b.start();
    c.start();
    return () => {
      a.stop();
      b.stop();
      c.stop();
    };
  }, [sway, breathe, glow]);

  const rotate = sway.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] });
  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.92] });

  const meta = MOOD_META[mood];
  const resident = activeResident(mood);
  const wilt = mood === 'wilting' || mood === 'stressed';

  return (
    <View style={[styles.scene, { backgroundColor: meta.sky }]}>
      {/* warm floor band grounding the desk */}
      <View style={styles.floor} />

      {/* sun / mood glow */}
      <Animated.View style={[styles.glowOuter, { opacity: glowOpacity }]} />
      <Animated.View style={[styles.glowInner, { opacity: glowOpacity }]} />

      {/* mood label */}
      <View style={styles.moodTag}>
        <Text style={[font.tiny, { color: colors.primaryDark }]}>
          {meta.label.toUpperCase()}
        </Text>
      </View>

      {/* nagging resident */}
      {resident && (
        <View style={styles.resident}>
          <View style={styles.bubble}>
            <Text style={[font.small, styles.residentLine]}>{resident.line}</Text>
          </View>
          <Text style={styles.residentEmoji}>{resident.emoji}</Text>
        </View>
      )}

      {/* desk */}
      <View style={styles.deskLegLeft} />
      <View style={styles.deskLegRight} />
      <View style={styles.desk}>
        <View style={styles.deskHighlight} />
      </View>

      {/* desk lamp (left) */}
      <View style={styles.lamp}>
        <Animated.View style={[styles.lampGlow, { opacity: glowOpacity }]} />
        <View style={styles.lampShade} />
        <View style={styles.lampStem} />
        <View style={styles.lampBase} />
      </View>

      {/* potted plant (center) */}
      <View style={styles.plantGroup}>
        <Animated.Text
          style={[
            styles.plant,
            { transform: [{ rotate }, { scale }], opacity: wilt ? 0.8 : 1 },
          ]}
        >
          {plantStage(points)}
        </Animated.Text>
        <View style={styles.potRim} />
        <View style={styles.potBody} />
      </View>

      {/* steaming mug (right) */}
      <View style={styles.mug}>
        <View style={styles.steam} />
        <View style={[styles.steam, styles.steam2]} />
        <View style={styles.mugBody}>
          <View style={styles.mugBand} />
        </View>
        <View style={styles.mugHandle} />
      </View>
    </View>
  );
}

const WOOD = '#CBA47C';
const WOOD_DARK = '#B0865E';

const styles = StyleSheet.create({
  scene: {
    height: 300,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadow.card,
  },
  floor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 96,
    backgroundColor: colors.bgWarm,
    opacity: 0.9,
  },
  glowOuter: {
    position: 'absolute',
    top: -46,
    right: -34,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.sun + '44',
  },
  glowInner: {
    position: 'absolute',
    top: -8,
    right: 8,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.sun + '66',
  },
  moodTag: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: '#FFFFFFD0',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  resident: {
    position: 'absolute',
    top: 46,
    right: 14,
    maxWidth: 168,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bubble: {
    flex: 1,
    backgroundColor: '#FFFFFFE0',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadow.soft,
  },
  residentEmoji: { fontSize: 24 },
  residentLine: {
    color: colors.textMuted,
    textAlign: 'right',
    fontStyle: 'italic',
  },

  desk: {
    position: 'absolute',
    bottom: 56,
    alignSelf: 'center',
    width: '84%',
    height: 20,
    borderRadius: 9,
    backgroundColor: WOOD,
  },
  deskHighlight: {
    position: 'absolute',
    top: 3,
    left: 10,
    right: 10,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF55',
  },
  deskLegLeft: {
    position: 'absolute',
    bottom: 14,
    left: '20%',
    width: 12,
    height: 44,
    borderRadius: 5,
    backgroundColor: WOOD_DARK,
  },
  deskLegRight: {
    position: 'absolute',
    bottom: 14,
    right: '20%',
    width: 12,
    height: 44,
    borderRadius: 5,
    backgroundColor: WOOD_DARK,
  },

  lamp: {
    position: 'absolute',
    bottom: 74,
    left: '14%',
    alignItems: 'center',
  },
  lampGlow: {
    position: 'absolute',
    top: 6,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.sun + '55',
  },
  lampShade: {
    width: 32,
    height: 17,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    backgroundColor: colors.primary,
  },
  lampStem: { width: 5, height: 40, backgroundColor: colors.primaryDark },
  lampBase: { width: 28, height: 7, borderRadius: 4, backgroundColor: colors.primaryDark },

  plantGroup: {
    position: 'absolute',
    bottom: 74,
    alignSelf: 'center',
    alignItems: 'center',
  },
  plant: { fontSize: 66, marginBottom: -6 },
  potRim: {
    width: 58,
    height: 14,
    borderRadius: 5,
    backgroundColor: WOOD_DARK,
    marginBottom: -2,
  },
  potBody: {
    width: 46,
    height: 38,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: colors.clay,
  },

  mug: {
    position: 'absolute',
    bottom: 76,
    right: '15%',
    alignItems: 'center',
  },
  steam: {
    position: 'absolute',
    top: -14,
    left: 9,
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#FFFFFF99',
  },
  steam2: { left: 18, top: -11, height: 11 },
  mugBody: {
    width: 30,
    height: 26,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: 'hidden',
  },
  mugBand: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: colors.primary,
  },
  mugHandle: {
    position: 'absolute',
    right: -6,
    top: 7,
    width: 12,
    height: 15,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: colors.textFaint,
    backgroundColor: 'transparent',
  },
});
