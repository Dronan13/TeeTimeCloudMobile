import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import NotificationHeaderButton from '@/components/NotificationHeaderButton';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import NotificationsScreen from '@/screens/NotificationsScreen';
import { NotificationsStackParamList } from '@/types';

const NotificationsStack = createStackNavigator<NotificationsStackParamList>();

export default function NotificationsStackNavigator() {
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