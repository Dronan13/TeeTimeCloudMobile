import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Filter } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TournamentsStackParamList, Tournament } from '@/types';
import { tournamentsService } from '@/services/tournaments';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import TournamentCard from '@/components/TournamentCard';

type Props = NativeStackScreenProps<TournamentsStackParamList, 'TournamentsList'>;

type FilterType = 'all' | 'upcoming' | 'past';

export default function TournamentListScreen({ navigation }: Props) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [tournaments, setTournaments] = useState<(Tournament & { courses?: { name: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [userRegistrations, setUserRegistrations] = useState<Set<string>>(new Set());

  const now = new Date();

  const fetchTournaments = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await tournamentsService.fetchTournaments();

      if (fetchError) {
        setError(t('errors.server'));
        setTournaments([]);
        return;
      }

      if (data) {
        setTournaments(data);
        // Fetch user's registrations
        if (user?.id) {
          const registered = new Set<string>();
          for (const tournament of data) {
            const { data: isReg } = await tournamentsService.isUserRegistered(
              tournament.id,
              user.id
            );
            if (isReg) {
              registered.add(tournament.id);
            }
          }
          setUserRegistrations(registered);
        }
      }
    } catch (err) {
      setError(t('errors.unknown'));
      setTournaments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, t]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTournaments();
  }, [fetchTournaments]);

  const getFilteredTournaments = () => {
    return tournaments.filter((tournament) => {
      if (!tournament.start_at) return false;

      const startDate = new Date(tournament.start_at);
      const endDate = tournament.end_at ? new Date(tournament.end_at) : startDate;

      if (filter === 'upcoming') {
        return endDate >= now;
      } else if (filter === 'past') {
        return endDate < now;
      }
      return true;
    });
  };

  const filteredTournaments = getFilteredTournaments();

  const renderTournamentItem = ({ item }: { item: Tournament & { courses?: { name: string } | null } }) => (
    <TournamentCard
      tournament={item}
      registered={userRegistrations.has(item.id)}
      onPress={() =>
        navigation.navigate('TournamentDetail', { tournamentId: item.id })
      }
      onRegisterPress={() =>
        navigation.navigate('TournamentRegistration', {
          tournamentId: item.id,
        })
      }
    />
  );

  const renderEmptyState = () => (
    <View style={[styles.emptyContainer, isDark && styles.emptyContainerDark]}>
      <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
        {filter === 'upcoming'
          ? t('tournament.list.emptyUpcoming')
          : filter === 'past'
            ? t('tournament.list.emptyPast')
            : t('tournament.list.emptyUpcoming')}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, isDark && styles.centerContainerDark]}>
        <ActivityIndicator size="large" color="#2d7a4e" />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (error && tournaments.length === 0) {
    return (
      <View style={[styles.centerContainer, isDark && styles.centerContainerDark]}>
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
          {error}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRefresh}
        >
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Filter Bar */}
      <View style={[styles.filterBar, isDark && styles.filterBarDark]}>
        <Filter size={18} color={isDark ? '#ffffff' : '#1a1d21'} />
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.filterButtonActive,
            isDark && filter === 'all' && styles.filterButtonActiveDark,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            {t('common.viewAll')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'upcoming' && styles.filterButtonActive,
            isDark && filter === 'upcoming' && styles.filterButtonActiveDark,
          ]}
          onPress={() => setFilter('upcoming')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'upcoming' && styles.filterButtonTextActive,
            ]}
          >
            {t('tournament.upcoming')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'past' && styles.filterButtonActive,
            isDark && filter === 'past' && styles.filterButtonActiveDark,
          ]}
          onPress={() => setFilter('past')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'past' && styles.filterButtonTextActive,
            ]}
          >
            {t('tournament.past')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tournament List */}
      <FlatList
        data={filteredTournaments}
        renderItem={renderTournamentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2d7a4e"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  containerDark: {
    backgroundColor: '#1a1d21',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterBarDark: {
    backgroundColor: '#2b3137',
    borderBottomColor: '#495057',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#2d7a4e',
  },
  filterButtonActiveDark: {
    backgroundColor: '#2d7a4e',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
  },
  centerContainerDark: {
    backgroundColor: '#1a1d21',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  loadingTextDark: {
    color: '#d1d5db',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainerDark: {
    backgroundColor: '#1a1d21',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyTextDark: {
    color: '#d1d5db',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorTextDark: {
    color: '#fca5a5',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2d7a4e',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
