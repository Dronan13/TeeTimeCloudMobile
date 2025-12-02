import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { AppTabParamList, CoursesStackParamList, ProfileStackParamList } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

// Import screens
import HomeScreen from '@/screens/HomeScreen';
import CoursesScreen from '@/screens/CoursesScreen';
import CourseDetailScreen from '@/screens/CourseDetailScreen';
import CourseTeeTimesScreen from '@/screens/CourseTeeTimesScreen';
import ReservationScreen from '@/screens/ReservationScreen';
import TeeTimesScreen from '@/screens/TeeTimesScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import ProfileEditScreen from '@/screens/ProfileEditScreen';
import UpdatePasswordScreen from '@/screens/UpdatePasswordScreen';
import SupportScreen from '@/screens/SupportScreen';
import TermsOfUseScreen from '@/screens/TermsOfUseScreen';

// Icons (using text for now, you can replace with icon library later)
import { Text } from 'react-native';

const Tab = createBottomTabNavigator<AppTabParamList>();
const CoursesStack = createStackNavigator<CoursesStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

function CoursesStackNavigator() {
  const { isDark } = useTheme();

  return (
    <CoursesStack.Navigator
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
      <CoursesStack.Screen
        name="CoursesList"
        component={CoursesScreen}
        options={{ title: 'Golf Courses' }}
      />
      <CoursesStack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{ title: 'Course Details' }}
      />
      <CoursesStack.Screen
        name="CourseTeeTimesScreen"
        component={CourseTeeTimesScreen}
        options={{ title: 'Available Tee Times' }}
      />
      <CoursesStack.Screen
        name="ReservationScreen"
        component={ReservationScreen}
        options={{ title: 'Book Tee Time' }}
      />
    </CoursesStack.Navigator>
  );
}

function ProfileStackNavigator() {
  const { isDark } = useTheme();

  return (
    <ProfileStack.Navigator
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
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
      <ProfileStack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ title: 'Edit Profile' }}
      />
      <ProfileStack.Screen
        name="UpdatePassword"
        component={UpdatePasswordScreen}
        options={{ title: 'Update Password' }}
      />
      <ProfileStack.Screen
        name="Support"
        component={SupportScreen}
        options={{ title: 'Support' }}
      />
      <ProfileStack.Screen
        name="TermsOfUse"
        component={TermsOfUseScreen}
        options={{ title: 'Terms of Use' }}
      />
    </ProfileStack.Navigator>
  );
}

export default function AppTabs() {
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
        tabBarStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderTopColor: isDark ? '#374151' : '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
          backgroundColor: isDark ? '#1f2937' : '#22c55e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🏠</Text>,
          title: 'Home',
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesStackNavigator}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>⛳</Text>,
          title: 'Courses',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="TeeTimes"
        component={TeeTimesScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>📅</Text>,
          title: 'My Tee Times',
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🔔</Text>,
          title: 'Notifications',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>👤</Text>,
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}
