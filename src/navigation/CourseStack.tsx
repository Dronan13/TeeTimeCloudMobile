import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import NotificationHeaderButton from '@/components/NotificationHeaderButton';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import CoursesScreen from '@/screens/CoursesScreen';
import CourseDetailScreen from '@/screens/CourseDetailScreen';
import CourseTeeTimesScreen from '@/screens/CourseTeeTimesScreen';
import ReservationScreen from '@/screens/ReservationScreen';
import { CoursesStackParamList } from '@/types';

const CoursesStack = createStackNavigator<CoursesStackParamList>();

export default function CoursesStackNavigator() {
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