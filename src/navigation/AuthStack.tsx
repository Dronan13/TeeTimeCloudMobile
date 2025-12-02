import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '@/types';

// Import screens (to be created)
import LandingScreen from '@/screens/LandingScreen';
import SignInScreen from '@/screens/SignInScreen';
import ForgotPasswordScreen from '@/screens/ForgotPasswordScreen';
import UpdatePasswordScreen from '@/screens/UpdatePasswordScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#22c55e',
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
        options={{ title: 'Sign In' }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: 'Forgot Password' }}
      />
      <Stack.Screen
        name="UpdatePassword"
        component={UpdatePasswordScreen}
        options={{ title: 'Update Password' }}
      />
    </Stack.Navigator>
  );
}