import { create } from 'zustand';
import { CheckInState, Exercise, SessionMode } from '../types';

/** App routes. Tabs live in the bottom bar; the rest are pushed full-screen. */
export type Route =
  | 'home'
  | 'insights'
  | 'settings'
  | 'checkin'
  | 'reset'
  | 'reward'
  | 'paywall';

export const TABS: Route[] = ['home', 'insights', 'settings'];

interface NavParams {
  exercise?: Exercise;
  stateBefore?: CheckInState;
  mode?: SessionMode;
  /** points gained, for the reward screen. */
  gained?: number;
  /** where the paywall was opened from, for analytics/messaging. */
  paywallSource?: string;
}

interface NavState {
  route: Route;
  params: NavParams;
  /** non-tab screen stacked above tabs */
  go: (route: Route, params?: NavParams) => void;
  /** return to last tab */
  back: () => void;
  lastTab: Route;
}

export const useNav = create<NavState>((set, get) => ({
  route: 'home',
  params: {},
  lastTab: 'home',
  go: (route, params = {}) =>
    set((s) => ({
      route,
      params,
      lastTab: TABS.includes(route) ? route : s.lastTab,
    })),
  back: () => set((s) => ({ route: s.lastTab, params: {} })),
}));
