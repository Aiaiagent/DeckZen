import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from './theme';
import { useStore } from './store/useStore';
import { useNav, TABS } from './navigation/nav';
import { configureNotificationHandler } from './services/notifications';

import { TabBar } from './components/TabBar';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HomeScreen } from './screens/HomeScreen';
import { InsightsScreen } from './screens/InsightsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { CheckInScreen } from './screens/CheckInScreen';
import { ResetScreen } from './screens/ResetScreen';
import { RewardScreen } from './screens/RewardScreen';
import { PaywallScreen } from './screens/PaywallScreen';

export default function App() {
  const onboarded = useStore((s) => s.onboarded);
  const route = useNav((s) => s.route);

  useEffect(() => {
    configureNotificationHandler();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={styles.root}>
        {!onboarded ? (
          <OnboardingScreen />
        ) : (
          <>
            <View style={styles.content}>{renderRoute(route)}</View>
            {TABS.includes(route) && <TabBar />}
          </>
        )}
      </View>
    </SafeAreaProvider>
  );
}

function renderRoute(route: string) {
  switch (route) {
    case 'home':
      return <HomeScreen />;
    case 'insights':
      return <InsightsScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'checkin':
      return <CheckInScreen />;
    case 'reset':
      return <ResetScreen />;
    case 'reward':
      return <RewardScreen />;
    case 'paywall':
      return <PaywallScreen />;
    default:
      return <HomeScreen />;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
});
