import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import NotificationHeaderButton from '@/components/NotificationHeaderButton';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import ProfileScreen from '@/screens/ProfileScreen';
import ProfileEditScreen from '@/screens/ProfileEditScreen';
import UpdatePasswordScreen from '@/screens/UpdatePasswordScreen';
import SupportScreen from '@/screens/SupportScreen';
import TermsOfUseScreen from '@/screens/TermsOfUseScreen';
import { ProfileStackParamList } from '@/types';

const ProfileStack = createStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
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