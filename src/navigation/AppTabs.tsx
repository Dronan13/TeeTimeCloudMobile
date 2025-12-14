import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { AppTabParamList } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, Flag, Calendar, User, Newspaper, Trophy, RotateCcw, Menu } from 'lucide-react-native';
import NotificationHeaderButton from '@/components/NotificationHeaderButton';
import QuickActionsMenu from '@/components/QuickActionsMenu';

// Import screens
import HomeScreen from '@/screens/HomeScreen';
import TeeTimesScreen from '@/screens/TeeTimesScreen';
import RSSArticlesScreen from '@/screens/RSSArticlesScreen';
import { TournamentsStackNavigator } from '@/navigation/TournamentsStack';
import NotificationsStackNavigator from './NavigationStack';
import ProfileStackNavigator from './ProfileStack';
import CoursesStackNavigator from './CourseStack';
import RoundsStackNavigator from './RoundsStack';

const Tab = createBottomTabNavigator<AppTabParamList>();

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

