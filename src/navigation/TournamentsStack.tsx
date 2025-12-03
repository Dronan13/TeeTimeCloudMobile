import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TournamentsStackParamList } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Import screens (these will be created in Phase 2 onwards)
// For now, we'll create placeholder screens

const TournamentsStack = createStackNavigator<TournamentsStackParamList>();

// Placeholder screens
const TournamentListScreen = () => null;
const TournamentDetailScreen = () => null;
const TournamentGroupListScreen = () => null;
const TournamentRegistrationScreen = () => null;
const ScorecardScreen = () => null;
const LeaderboardScreen = () => null;

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
