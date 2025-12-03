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

const RoundsStack = createStackNavigator<RoundsStackParamList>();

export function RoundsStackNavigator() {
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
      }}
    >
      <RoundsStack.Screen
        name="RoundsList"
        component={RoundsListScreen}
        options={{ title: t('rounds.title') || 'My Rounds' }}
      />
      <RoundsStack.Screen
        name="NewRound"
        component={NewRoundScreen}
        options={{ title: t('rounds.newRound') || 'New Round' }}
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

export default RoundsStackNavigator;
