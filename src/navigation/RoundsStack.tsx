import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RoundsStackParamList } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Import screens (will create these next)
import RoundsListScreen from '@/screens/rounds/RoundsListScreen';
import NewRoundScreen from '@/screens/rounds/NewRoundScreen';
import PersonalScorecardScreen from '@/screens/rounds/PersonalScorecardScreen';
import RoundDetailScreen from '@/screens/rounds/RoundDetailScreen';
import NotificationHeaderButton from '@/components/NotificationHeaderButton';
import { Pressable, Text } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
const RoundsStack = createStackNavigator<RoundsStackParamList>();

export default function RoundsStackNavigator() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <RoundsStack.Navigator
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
      <RoundsStack.Screen
        name="RoundsList"
        component={RoundsListScreen}
        options={({ navigation }) => ({
          title: t('rounds.title'),
          headerLeft: () => (
            <Pressable 
              onPress={() => navigation.navigate('Courses')}
              style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}
            >
              <ChevronLeft size={28} color='#fff' />
              <Text style={{ color: '#fff', fontSize: 17, marginLeft: -4 }}>{t('courses.title')}</Text>
            </Pressable>
          ),
        })}
      />
      <RoundsStack.Screen
        name="NewRound"
        component={NewRoundScreen}
        options={({ navigation }) => ({
          title: t('rounds.newRound'),
          headerLeft: () => (
            <Pressable 
              onPress={() => navigation.navigate('RoundsList')}
              style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}
            >
              <ChevronLeft size={28} color='#fff' />
              <Text style={{ color: '#fff', fontSize: 17, marginLeft: -4 }}>{t('rounds.title')}</Text>
            </Pressable>
          ),
        })}
      />
      <RoundsStack.Screen
        name="PersonalScorecard"
        component={PersonalScorecardScreen}
        options={{ title: t('rounds.scorecard') || 'Scorecard' }}
      />
      <RoundsStack.Screen
        name="RoundDetail"
        component={RoundDetailScreen}
        options={{ title: t('rounds.details') || 'Round Details' }}
      />
    </RoundsStack.Navigator>
  );
}
