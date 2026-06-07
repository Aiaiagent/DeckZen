# DeskZen 🌿

**Reset your workday in 2 minutes.**

DeskZen is a personalized micro-break assistant for office workers. Instead of
10-minute meditations or yoga between desks, it serves 30–120 second resets based
on how you feel right now — stressed, sleepy, eye-strained, stiff-necked, or in
deadline mode — and turns the habit into a growing **Desk Garden**.

Built with Expo (SDK 56) + React Native + TypeScript. Ships to the App Store and
Google Play with subscriptions.

---

## The core loop

```
Check-in (5s)  →  Smart Nudge  →  2-min Reset  →  Reward (garden grows)  →  Insight
```

- **Smart Check-in** — one tap among 5 states.
- **Stress Context Engine (Lite)** — picks the reset most likely to be both
  relevant *and* completed, using state, equipment, premium access, and your
  break history (`src/data/engine.ts`).
- **2-min Reset player** — big breathing focal point, circular timer, one-line
  instructions, haptics, and a **"Too awkward at the office? Swap it"** button
  that switches to a stealth (desk-discreet) exercise.
- **Desk Garden** — a plant avatar that thrives or wilts; comedic "body residents"
  (spine 🦴, brain 🧠) pop in when you've neglected a break.
- **Insights** — honest, self-reported signals (no medical claims).

## Feature map

| Free | Premium |
| --- | --- |
| 1 garden, core resets | AI-matched resets (full library) |
| 2 nudge voices (Sen the Plant, Minimal) | All voices (Gen Z Roast, Corporate, Calm Coach) |
| 7-day streak | Meeting Recovery + Deadline Survival modes |
| Basic stats | Weekly Health Insights + patterns |
| | Equipment-based routines |

Pricing (in `src/services/purchases.ts`): **$4.99/mo** or **$29.99/yr** (highlighted).

## Project structure

```
src/
  theme/            Design tokens (colors, spacing, type)
  types/            Domain types
  data/
    checkins.ts     The 5 check-in states
    exercises.ts    30 micro-resets (10 physical / 10 mental / 10 visual)
    tones.ts        Notification voice packs + nudge copy formula
    engine.ts       Stress Context Engine (recommendation ranking)
    garden.ts       Desk Garden mood + plant growth logic
  store/useStore.ts Zustand + AsyncStorage persistence
  services/
    haptics.ts      Safe haptic wrappers
    notifications.ts Smart Nudge scheduling (local notifications)
    purchases.ts    Subscription abstraction (RevenueCat-ready, mock for dev)
  navigation/nav.ts Lightweight route store
  components/       UI kit, DeskGarden, CircleTimer, TabBar
  screens/          Onboarding, Home, CheckIn, Reset, Reward, Insights, Settings, Paywall
  App.tsx           Root + routing
```

## Run it

```bash
npm install
npx expo start            # press i (iOS), a (Android), or scan with Expo Go
```

Local notifications and haptics work in Expo Go. Push notifications and real
in-app purchases require a development/production build (see below).

## Going live with subscriptions

Subscriptions are abstracted in `src/services/purchases.ts` with a **mock** that
unlocks Premium locally so you can develop the full paywall flow. To ship real
billing on both stores, use **RevenueCat** (unifies StoreKit + Google Play Billing):

1. `npx expo install react-native-purchases`
2. Create products in **App Store Connect** and **Google Play Console**
   (`deskzen.premium.monthly`, `deskzen.premium.annual`) and a **`premium`**
   entitlement in RevenueCat.
3. In `purchases.ts`, flip `MOCK` off and replace the stubbed calls with
   `Purchases.configure`, `getOfferings`, `purchasePackage`, and
   `restorePurchases`; read `customerInfo.entitlements.active['premium']`.
4. Build with EAS: `eas build -p ios` / `eas build -p android`.

## Store build notes

- Bundle IDs are set in `app.json` (`com.deskzen.app`). Change before submitting.
- `expo-notifications` is configured as a plugin; push tokens need an EAS
  `projectId` (added automatically by `eas build`).
- Replace the placeholder icons in `assets/` with final brand art.

## Health & safety positioning

DeskZen uses **non-medical** language throughout: "ease", "release", "reset",
"self-reported". It does not claim to cure, diagnose, or prevent conditions.
Breathing exercises are intentionally gentle, with a disclaimer in Settings.

## Roadmap (post-MVP)

- Real AI personalization once retention data exists
- Calendar context (auto Meeting Recovery)
- B2B Team Garden + anonymized HR completion reports
- Collectible desk items & soundscapes
