import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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

const TabNavigator = Tab.Navigator as any;
const TabScreen = Tab.Screen as any;
const StackNavigator = Stack.Navigator as any;
const StackScreen = Stack.Screen as any;
const NavContainer = NavigationContainer as any;

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
  },
};

function MainTabNavigator() {
  return (
    <TabNavigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
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
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <TabScreen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }: { color: string }) => (
            <Text style={{ color, fontSize: 18 }}>🏠</Text>
          ),
        }}
      />
      <TabScreen
        name="Timer"
        component={TimerScreen}
        options={{
          title: 'Focus Timer',
          tabBarLabel: 'Timer',
          tabBarIcon: ({ color }: { color: string }) => (
            <Text style={{ color, fontSize: 18 }}>⏱️</Text>
          ),
        }}
      />
      <TabScreen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Learning History',
          tabBarLabel: 'History',
          tabBarIcon: ({ color }: { color: string }) => (
            <Text style={{ color, fontSize: 18 }}>📜</Text>
          ),
        }}
      />
      <TabScreen
        name="Progress"
        component={ProgressScreen}
        options={{
          title: 'Study Progress',
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color }: { color: string }) => (
            <Text style={{ color, fontSize: 18 }}>📊</Text>
          ),
        }}
      />
      <TabScreen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings & Profile',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }: { color: string }) => (
            <Text style={{ color, fontSize: 18 }}>⚙️</Text>
          ),
        }}
      />
    </TabNavigator>
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
    <NavContainer theme={darkTheme}>
      <StackNavigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <StackScreen name="Main" component={MainTabNavigator} />
        ) : (
          <>
            <StackScreen name="Login" component={LoginScreen} />
            <StackScreen name="Register" component={RegisterScreen} />
          </>
        )}
      </StackNavigator>
    </NavContainer>
  );
}
