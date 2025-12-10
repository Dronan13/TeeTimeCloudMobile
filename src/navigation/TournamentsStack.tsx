import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TournamentsStackParamList } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Import screens
import TournamentListScreen from '@/screens/tournaments/TournamentListScreen';
import TournamentDetailScreen from '@/screens/tournaments/TournamentDetailScreen';
import TournamentGroupListScreen from '@/screens/tournaments/TournamentGroupListScreen';
import TournamentRegistrationScreen from '@/screens/tournaments/TournamentRegistrationScreen';
import ScorecardScreen from '@/screens/tournaments/ScorecardScreen';
import LeaderboardScreen from '@/screens/tournaments/LeaderboardScreen';

const TournamentsStack = createStackNavigator<TournamentsStackParamList>();

export function TournamentsStackNavigator() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <TournamentsStack.Navigator
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
      <TournamentsStack.Screen
        name="TournamentsList"
        component={TournamentListScreen}
        options={{ title: t('tournament.title') }}
      />
      <TournamentsStack.Screen
        name="TournamentDetail"
        component={TournamentDetailScreen}
        options={{ title: t('tournament.details') }}
      />
      <TournamentsStack.Screen
        name="TournamentGroupList"
        component={TournamentGroupListScreen}
        options={({ route }) => ({
          title: route.params.groupName,
        })}
      />
      <TournamentsStack.Screen
        name="TournamentRegistration"
        component={TournamentRegistrationScreen}
        options={{ title: t('tournament.registration.title') }}
      />
      <TournamentsStack.Screen
        name="Scorecard"
        component={ScorecardScreen}
        options={{ title: t('tournament.scorecard.title') }}
      />
      <TournamentsStack.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ title: t('tournament.leaderboard.title') }}
      />
    </TournamentsStack.Navigator>
  );
}
