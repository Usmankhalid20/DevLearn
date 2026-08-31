import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Home,
  Timer as TimerIcon,
  BookOpen,
  BarChart2,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import { useAuth } from '../context/auth-context';
import { colors } from '../theme/colors';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TimerScreen } from '../screens/TimerScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Monochrome navigation theme
const darkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.white,
    notification: colors.white,
  },
};

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },

        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 16,
          color: colors.white,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
          paddingBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'DevLearn',
          tabBarLabel: 'Home',
          tabBarAccessibilityLabel: 'Home Tab',
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Timer"
        component={TimerScreen}
        options={{
          title: 'Focus Timer',
          tabBarLabel: 'Timer',
          tabBarAccessibilityLabel: 'Timer Tab',
          tabBarIcon: ({ color, size }) => <TimerIcon size={size - 2} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Learning History',
          tabBarLabel: 'History',
          tabBarAccessibilityLabel: 'History Tab',
          tabBarIcon: ({ color, size }) => <BookOpen size={size - 2} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          title: 'Progress & Streaks',
          tabBarLabel: 'Progress',
          tabBarAccessibilityLabel: 'Progress Tab',
          tabBarIcon: ({ color, size }) => <BarChart2 size={size - 2} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarAccessibilityLabel: 'Settings Tab',
          tabBarIcon: ({ color, size }) => <SettingsIcon size={size - 2} color={color} strokeWidth={2} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={darkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

