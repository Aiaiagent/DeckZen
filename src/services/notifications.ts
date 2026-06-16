import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
// Type-only import: erased at compile time, so it NEVER triggers the native
// module to load. The real module is require()'d lazily below.
import type * as NotificationsModule from 'expo-notifications';
import { NotificationTone, WorkRhythm } from '../types';
import { buildNudge } from '../data/tones';

/**
 * Smart Nudge engine.
 *
 * IMPORTANT: As of SDK 53+, expo-notifications is unavailable in Expo Go on
 * Android and THROWS as soon as the module is imported. So we must not import
 * it statically — we lazy-require it only in environments where it works
 * (development / production builds, native platforms). In Expo Go and on web,
 * every function here is a safe no-op, and nudges come alive in a real build.
 *
 * SDK 56 note: the handler uses shouldShowBanner / shouldShowList
 * (shouldShowAlert is deprecated), and triggers are typed.
 */

/** True when running inside the Expo Go sandbox (no custom native modules). */
export const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/** Notifications are usable only in dev/standalone builds, not Expo Go / web. */
const notificationsAvailable = Platform.OS !== 'web' && !isExpoGo;

/** Lazily load the native module, only where it's safe to. */
let _N: typeof NotificationsModule | null = null;
function N(): typeof NotificationsModule | null {
  if (!notificationsAvailable) return null;
  if (!_N) {
    try {
      _N = require('expo-notifications') as typeof NotificationsModule;
    } catch {
      _N = null;
    }
  }
  return _N;
}

let handlerSet = false;

export function configureNotificationHandler() {
  const Notifications = N();
  if (handlerSet || !Notifications) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerSet = true;
  } catch {
    // unsupported environment — nudges simply stay off.
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const Notifications = N();
  if (!Notifications) return false;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('deskzen-nudges', {
        name: 'Micro-break nudges',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 120],
        lightColor: '#2F9E6E',
      });
    }
    const existing = await Notifications.getPermissionsAsync();
    let granted = existing.granted;
    if (!granted && existing.canAskAgain) {
      const req = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowBadge: false, allowSound: false },
      });
      granted = req.granted;
    }
    return granted;
  } catch {
    return false;
  }
}

/** Hours we should nudge during, based on work rhythm. */
function activeHours(rhythm: WorkRhythm): number[] {
  switch (rhythm) {
    case 'nightShift':
      return [21, 23, 1, 3, 5];
    case 'freelance':
      return [10, 12, 15, 17, 20];
    case 'hybrid':
      return [9, 11, 14, 16];
    case 'nineToSix':
    default:
      return [10, 11, 13, 15, 16, 17];
  }
}

/**
 * Reschedule the day's nudges. We cancel everything first to avoid pile-ups,
 * then schedule one daily reminder per active hour with rotating, tone-aware copy.
 */
export async function rescheduleNudges(params: {
  enabled: boolean;
  tone: NotificationTone;
  rhythm: WorkRhythm;
}): Promise<void> {
  const Notifications = N();
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!params.enabled) return;

    const granted = await requestNotificationPermission();
    if (!granted) return;

    const hours = activeHours(params.rhythm);
    const signals = ['sitting', 'eyeTimer', 'stress', 'stiffNeck'] as const;

    for (let i = 0; i < hours.length; i++) {
      const signal = signals[i % signals.length];
      const body = buildNudge(params.tone, signal);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'DeskZen',
          body,
          data: { signal },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours[i],
          minute: 0,
          ...(Platform.OS === 'android' ? { channelId: 'deskzen-nudges' } : {}),
        },
      });
    }
  } catch {
    // best-effort
  }
}

/** Fire a local nudge a few seconds from now — used for the in-app demo button. */
export async function sendDemoNudge(tone: NotificationTone): Promise<boolean> {
  const Notifications = N();
  if (!Notifications) return false;
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return false;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'DeskZen',
        body: buildNudge(tone, 'sitting'),
        data: { demo: true },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
        ...(Platform.OS === 'android' ? { channelId: 'deskzen-nudges' } : {}),
      },
    });
    return true;
  } catch {
    return false;
  }
}
