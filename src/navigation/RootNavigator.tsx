import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { RootStackParamList } from '@/types';

// Import navigators
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';

// Loading screen
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();

function LoadingScreen() {
  const { isDark } = useTheme();

  return (
    <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
      <ActivityIndicator size="large" color="#22c55e" />
      <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>Loading...</Text>
    </View>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const { isDark } = useTheme();

  if (loading) {
    return <LoadingScreen />;
  }

  // Create custom theme based on dark mode
  const customTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: '#22c55e',
      background: isDark ? '#111827' : '#f9fafb',
      card: isDark ? '#1f2937' : '#ffffff',
      text: isDark ? '#f9fafb' : '#1f2937',
      border: isDark ? '#374151' : '#e5e7eb',
      notification: '#22c55e',
    },
  };

  return (
    <NavigationContainer theme={customTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="App" component={AppTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingContainerDark: {
    backgroundColor: '#111827',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  loadingTextDark: {
    color: '#9ca3af',
  },
});