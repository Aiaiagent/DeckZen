import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CheckInState,
  CheckInLog,
  ResetLog,
  NotificationTone,
  Equipment,
  WorkRhythm,
  Exercise,
} from '../types';

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

interface PersistedState {
  // Onboarding & profile
  onboarded: boolean;
  workRhythm: WorkRhythm;
  equipment: Equipment[];
  tone: NotificationTone;

  // Monetization
  isPremium: boolean;

  // Engagement
  gardenPoints: number;
  streak: number;
  lastResetDay: number | null;
  nudgesEnabled: boolean;

  // History
  checkIns: CheckInLog[];
  resets: ResetLog[];
}

interface Actions {
  completeOnboarding: (p: {
    workRhythm: WorkRhythm;
    equipment: Equipment[];
    tone: NotificationTone;
  }) => void;
  setTone: (tone: NotificationTone) => void;
  setEquipment: (equipment: Equipment[]) => void;
  setWorkRhythm: (workRhythm: WorkRhythm) => void;
  setNudgesEnabled: (enabled: boolean) => void;
  setPremium: (value: boolean) => void;

  logCheckIn: (state: CheckInState) => void;
  logReset: (exercise: Exercise, completed: boolean, stateBefore?: CheckInState) => void;

  // Derived helpers
  resetsToday: () => number;
  hoursSinceLastReset: () => number;

  // Dev / account
  resetAll: () => void;
}

export type StoreState = PersistedState & Actions;

const initialPersisted: PersistedState = {
  onboarded: false,
  workRhythm: 'nineToSix',
  equipment: ['none'],
  tone: 'cute',
  isPremium: false,
  gardenPoints: 0,
  streak: 0,
  lastResetDay: null,
  nudgesEnabled: true,
  checkIns: [],
  resets: [],
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...initialPersisted,

      completeOnboarding: ({ workRhythm, equipment, tone }) =>
        set({ onboarded: true, workRhythm, equipment, tone }),

      setTone: (tone) => set({ tone }),
      setEquipment: (equipment) =>
        set({ equipment: equipment.length ? equipment : ['none'] }),
      setWorkRhythm: (workRhythm) => set({ workRhythm }),
      setNudgesEnabled: (nudgesEnabled) => set({ nudgesEnabled }),
      setPremium: (isPremium) => set({ isPremium }),

      logCheckIn: (state) =>
        set((s) => ({
          checkIns: [...s.checkIns, { at: Date.now(), state }].slice(-200),
        })),

      logReset: (exercise, completed, stateBefore) =>
        set((s) => {
          const now = Date.now();
          const today = startOfDay(now);
          const log: ResetLog = {
            at: now,
            exerciseId: exercise.id,
            category: exercise.category,
            zone: exercise.zone,
            durationSec: exercise.durationSec,
            completed,
            stateBefore,
          };

          let { streak, lastResetDay, gardenPoints } = s;

          if (completed) {
            gardenPoints += Math.round(exercise.durationSec / 6) + 5;
            if (lastResetDay === null) {
              streak = 1;
            } else if (today === lastResetDay) {
              // same day, streak unchanged
            } else if (today - lastResetDay <= DAY) {
              streak += 1;
            } else {
              streak = 1;
            }
            lastResetDay = today;
          }

          return {
            resets: [...s.resets, log].slice(-300),
            streak,
            lastResetDay,
            gardenPoints,
          };
        }),

      resetsToday: () => {
        const today = startOfDay(Date.now());
        return get().resets.filter((r) => r.completed && startOfDay(r.at) === today).length;
      },

      hoursSinceLastReset: () => {
        const completed = get().resets.filter((r) => r.completed);
        if (completed.length === 0) return 99;
        const last = completed[completed.length - 1].at;
        return (Date.now() - last) / (60 * 60 * 1000);
      },

      resetAll: () => set({ ...initialPersisted }),
    }),
    {
      name: 'deskzen-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s): PersistedState => ({
        onboarded: s.onboarded,
        workRhythm: s.workRhythm,
        equipment: s.equipment,
        tone: s.tone,
        isPremium: s.isPremium,
        gardenPoints: s.gardenPoints,
        streak: s.streak,
        lastResetDay: s.lastResetDay,
        nudgesEnabled: s.nudgesEnabled,
        checkIns: s.checkIns,
        resets: s.resets,
      }),
    },
  ),
);
