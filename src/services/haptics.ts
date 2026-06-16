import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Thin, safe wrappers — haptics are best-effort and never throw. */
const safe = (fn: () => Promise<void>) => {
  if (Platform.OS === 'web') return;
  fn().catch(() => {});
};

export const hapticSelect = () => safe(() => Haptics.selectionAsync());

export const hapticTap = () =>
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

export const hapticStep = () =>
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft));

export const hapticSuccess = () =>
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));

export const hapticWarning = () =>
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
