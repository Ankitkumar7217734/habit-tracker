import { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HabitProvider } from './src/HabitContext';
import RewardToast from './src/components/RewardToast';
import OnboardingModal from './src/components/OnboardingModal';
import TodayScreen from './src/screens/TodayScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import StatsScreen from './src/screens/StatsScreen';
import ChallengesScreen from './src/screens/ChallengesScreen';
import { COLORS } from './src/constants';

// Fix web background — without this, light text is invisible on white HTML body
if (Platform.OS === 'web') {
  const s = document.createElement('style');
  s.textContent = 'html,body,#root{background:#FFFFFF;margin:0;padding:0;height:100%}*{box-sizing:border-box}';
  document.head?.appendChild(s);
}

const Tab = createBottomTabNavigator();
const TAB_ICON_NAMES = {
  Today: 'today-outline',
  History: 'calendar-outline',
  Stats: 'bar-chart-outline',
  Challenges: 'trophy-outline',
};

function TabIcon({ name, color }) {
  return <Ionicons name={TAB_ICON_NAMES[name]} size={22} color={color} />;
}

const ONBOARDED_KEY = '@onboarded_v1';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDED_KEY).then(v => {
      if (!v) setShowOnboarding(true);
    });
  }, []);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, '1');
    setShowOnboarding(false);
  };

  return (
    <HabitProvider>
      <View style={styles.root}>
        <StatusBar style="dark" />
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarIcon: ({ color }) => <TabIcon name={route.name} color={color} />,
              tabBarStyle: {
                backgroundColor: COLORS.tabBar,
                borderTopColor: COLORS.border,
                height: 62,
                paddingBottom: 8,
              },
              tabBarActiveTintColor: COLORS.accent,
              tabBarInactiveTintColor: COLORS.subtext,
              tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            })}
          >
            <Tab.Screen name="Today" component={TodayScreen} />
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Stats" component={StatsScreen} />
            <Tab.Screen name="Challenges" component={ChallengesScreen} />
          </Tab.Navigator>
        </NavigationContainer>
        <RewardToast />
        {showOnboarding && <OnboardingModal onDone={finishOnboarding} />}
      </View>
    </HabitProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
});
