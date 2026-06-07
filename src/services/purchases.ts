/**
 * Subscription layer.
 *
 * DeskZen sells subscriptions on the App Store + Google Play. The recommended
 * cross-platform path is RevenueCat (react-native-purchases), which unifies
 * StoreKit + Google Play Billing and handles receipt validation/entitlements.
 *
 * RevenueCat requires a native build (EAS) and store products, so it can't run
 * in Expo Go. This module exposes a clean interface with a MOCK implementation
 * for development. To go live:
 *
 *   1. npx expo install react-native-purchases
 *   2. Create products in App Store Connect + Google Play Console
 *      (e.g. deskzen.monthly, deskzen.annual) and an "premium" entitlement in RevenueCat.
 *   3. Replace the mock calls below with Purchases.configure / getOfferings /
 *      purchasePackage, and read entitlements.active['premium'].
 *   4. Build with EAS: eas build -p ios / -p android.
 */

export interface Plan {
  id: string;
  /** Store product identifier to register in App Store Connect / Play Console. */
  productId: string;
  title: string;
  price: string;
  period: string;
  /** e.g. "Save 50%" */
  badge?: string;
  highlight?: boolean;
}

/** Pricing from the spec. Annual is highlighted to drive cashflow. */
export const PLANS: Plan[] = [
  {
    id: 'monthly',
    productId: 'deskzen.premium.monthly',
    title: 'Monthly',
    price: '$4.99',
    period: '/ month',
  },
  {
    id: 'annual',
    productId: 'deskzen.premium.annual',
    title: 'Annual',
    price: '$29.99',
    period: '/ year',
    badge: 'Best value · 50% off',
    highlight: true,
  },
];

export interface PurchaseResult {
  success: boolean;
  isPremium: boolean;
  error?: string;
}

/** Swap this flag's effect when wiring RevenueCat. */
const MOCK = true;

export async function getOfferings(): Promise<Plan[]> {
  // Real impl: const offerings = await Purchases.getOfferings();
  return PLANS;
}

export async function purchase(planId: string): Promise<PurchaseResult> {
  if (MOCK) {
    // Simulate a store sheet round-trip.
    await new Promise((r) => setTimeout(r, 900));
    if (!PLANS.some((p) => p.id === planId)) {
      return { success: false, isPremium: false, error: 'Unknown plan' };
    }
    return { success: true, isPremium: true };
  }
  // Real impl:
  //   const offerings = await Purchases.getOfferings();
  //   const pkg = offerings.current?.availablePackages.find(...)
  //   const { customerInfo } = await Purchases.purchasePackage(pkg);
  //   return { success: true, isPremium: !!customerInfo.entitlements.active['premium'] };
  return { success: false, isPremium: false, error: 'Not configured' };
}

export async function restore(): Promise<PurchaseResult> {
  if (MOCK) {
    await new Promise((r) => setTimeout(r, 700));
    // Nothing to restore in mock mode.
    return { success: true, isPremium: false };
  }
  // Real impl:
  //   const customerInfo = await Purchases.restorePurchases();
  //   return { success: true, isPremium: !!customerInfo.entitlements.active['premium'] };
  return { success: false, isPremium: false, error: 'Not configured' };
}
