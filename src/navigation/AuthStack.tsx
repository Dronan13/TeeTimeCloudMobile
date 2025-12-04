import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

// Import screens (to be created)
import LandingScreen from '@/screens/LandingScreen';
import SignInScreen from '@/screens/SignInScreen';
import ForgotPasswordScreen from '@/screens/ForgotPasswordScreen';
import UpdatePasswordScreen from '@/screens/UpdatePasswordScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AuthStack() {
  const { isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#1f2937' : '#22c55e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Landing"
        component={LandingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: false  }}
      />
      <Stack.Screen
        name="UpdatePassword"
        component={UpdatePasswordScreen}
        options={{ headerShown: false  }}
      />
    </Stack.Navigator>
  );
}