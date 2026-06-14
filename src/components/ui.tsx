import React from 'react';
import {
  Text,
  TextProps,
  Pressable,
  PressableProps,
  View,
  ViewProps,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, font, shadow } from '../theme';
import { hapticTap } from '../services/haptics';

type TxtVariant = keyof typeof font;

export function Txt({
  variant = 'body',
  color = colors.text,
  style,
  ...rest
}: TextProps & { variant?: TxtVariant; color?: string }) {
  return <Text style={[font[variant], { color }, style]} {...rest} />;
}

export function Card({ style, ...rest }: ViewProps) {
  return <View style={[styles.card, style]} {...rest} />;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  haptic = true,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: PressableProps['style'];
  haptic?: boolean;
}) {
  const isDisabled = disabled || loading;
  const palette = {
    primary: { bg: colors.primary, fg: colors.onPrimary },
    secondary: { bg: colors.surfaceAlt, fg: colors.primaryDark },
    ghost: { bg: 'transparent', fg: colors.textMuted },
    danger: { bg: colors.danger, fg: '#fff' },
  }[variant];
  const lifts = variant === 'primary' || variant === 'danger';

  return (
    <Pressable
      onPress={() => {
        if (isDisabled) return;
        if (haptic) hapticTap();
        onPress?.();
      }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        lifts && shadow.button,
        {
          backgroundColor: palette.bg,
          opacity: isDisabled ? 0.5 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        },
        variant === 'secondary' && styles.btnSecondary,
        variant === 'ghost' && styles.btnGhost,
        style as object,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <Text style={[font.bodyStrong, styles.btnLabel, { color: palette.fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        hapticTap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        { transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <Text
        style={[
          font.small,
          { color: active ? colors.onPrimary : colors.textMuted, fontWeight: active ? '700' : '500' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Screen({
  children,
  scroll,
  style,
  contentStyle,
  ...rest
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewProps['style'];
  contentStyle?: ScrollViewProps['contentContainerStyle'];
} & ViewProps) {
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top, paddingBottom: insets.bottom };
  if (scroll) {
    return (
      <View style={[styles.screen, pad, style]} {...rest}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{ padding: spacing.lg, paddingBottom: spacing.xxxl }, contentStyle]}
        >
          {children}
        </ScrollView>
      </View>
    );
  }
  return (
    <View style={[styles.screen, pad, style]} {...rest}>
      {children}
    </View>
  );
}

export function Tag({ text, color = colors.primary }: { text: string; color?: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: color + '22' }]}>
      <Text style={[font.tiny, { color }]}>{text.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadow.card,
  },
  btn: {
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnGhost: { height: 44 },
  btnLabel: { letterSpacing: 0.2 },
  pill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
});
