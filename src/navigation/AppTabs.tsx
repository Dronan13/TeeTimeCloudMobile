import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { AppTabParamList, CoursesStackParamList, ProfileStackParamList, NotificationsStackParamList } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, Flag, Calendar, User, Newspaper, Trophy, RotateCcw, Menu } from 'lucide-react-native';
import NotificationHeaderButton from '@/components/NotificationHeaderButton';
import QuickActionsMenu from '@/components/QuickActionsMenu';

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
import RSSArticlesScreen from '@/screens/RSSArticlesScreen';
import { TournamentsStackNavigator } from '@/navigation/TournamentsStack';
import { RoundsStackNavigator } from '@/navigation/RoundsStack';

const Tab = createBottomTabNavigator<AppTabParamList>();
const CoursesStack = createStackNavigator<CoursesStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const NotificationsStack = createStackNavigator<NotificationsStackParamList>();

function NotificationsStackNavigator() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <NotificationsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#2b3137' : '#2d7a4e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerRight: () => <NotificationHeaderButton />,
      }}
    >
      <NotificationsStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: t('navigation.notifications') }}
      />
    </NotificationsStack.Navigator>
  );
}

function CoursesStackNavigator() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <CoursesStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#2b3137' : '#2d7a4e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerRight: () => <NotificationHeaderButton />,
      }}
    >
      <CoursesStack.Screen
        name="CoursesList"
        component={CoursesScreen}
        options={{ title: t('courses.title') }}
      />
      <CoursesStack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{ title: t('courses.details.title') }}
      />
      <CoursesStack.Screen
        name="CourseTeeTimesScreen"
        component={CourseTeeTimesScreen}
        options={{ title: t('courses.teeTimes.title') }}
      />
      <CoursesStack.Screen
        name="ReservationScreen"
        component={ReservationScreen}
        options={{ title: t('reservation.title') }}
      />
    </CoursesStack.Navigator>
  );
}

function ProfileStackNavigator() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#2b3137' : '#2d7a4e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerRight: () => <NotificationHeaderButton />,
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: t('profile.title') }}
      />
      <ProfileStack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ title: t('profile.edit.title') }}
      />
      <ProfileStack.Screen
        name="UpdatePassword"
        component={UpdatePasswordScreen}
        options={{ title: t('auth.updatePassword.title') }}
      />
      <ProfileStack.Screen
        name="Support"
        component={SupportScreen}
        options={{ title: t('profile.support.title') }}
      />
      <ProfileStack.Screen
        name="TermsOfUse"
        component={TermsOfUseScreen}
        options={{ title: t('profile.termsOfUse.title') }}
      />
    </ProfileStack.Navigator>
  );
}

export default function AppTabs() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2d7a4e',
        tabBarInactiveTintColor: isDark ? '#adb5bd' : '#868e96',
        tabBarStyle: {
          backgroundColor: isDark ? '#2b3137' : '#ffffff',
          borderTopColor: isDark ? '#343a40' : '#d1d6db',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: isDark ? '#2b3137' : '#2d7a4e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerRight: () => <NotificationHeaderButton />,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Home
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          title: t('navigation.home'),
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesStackNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Flag
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          title: t('navigation.courses'),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="TeeTimes"
        component={TeeTimesScreen}
        options={{
          tabBarButton: () => null,
          tabBarIcon: ({ color, focused }) => (
            <Calendar
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          title: t('teeTimes.title'),
        }}
      />
      <Tab.Screen
        name="Tournaments"
        component={TournamentsStackNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Trophy
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          title: t('navigation.tournaments') || 'Tournaments',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Rounds"
        component={RoundsStackNavigator}
        options={{
          tabBarButton: () => null,
          tabBarIcon: ({ color, focused }) => (
            <RotateCcw
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          title: t('navigation.rounds') || 'Rounds',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="RSSArticles"
        component={RSSArticlesScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Newspaper
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          title: t('navigation.articles') || 'Articles',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <User
              size={24}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
          title: t('navigation.profile'),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsStackNavigator}
        options={{
          tabBarButton: () => null,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Menu"
        component={View}
        options={{
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              style={styles.menuTabButton}
              onPress={() => setMenuVisible(true)}
              activeOpacity={0.7}
            >
              <Menu
                size={24}
                color={isDark ? '#adb5bd' : '#868e96'}
                strokeWidth={2}
              />
              <Text style={[styles.menuTabLabel, { color: isDark ? '#adb5bd' : '#868e96' }]}>
                {t('navigation.menu') || 'Menu'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Tab.Navigator>
    <QuickActionsMenu
      visible={menuVisible}
      onClose={() => setMenuVisible(false)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  menuTabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  menuTabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});

