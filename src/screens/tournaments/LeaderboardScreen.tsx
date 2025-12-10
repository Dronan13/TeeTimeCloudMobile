import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TournamentsStackParamList } from '@/types';
import { tournamentsService } from '@/services/tournaments';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import LeaderboardCard from '@/components/LeaderboardCard';
import { LeaderboardItemSkeleton } from '@/components/skeletons';

type Props = NativeStackScreenProps<TournamentsStackParamList, 'Leaderboard'>;

interface LeaderboardEntry {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  place: number;
  gross_score: number | null;
  net_score: number | null;
  score_vs_par: number | null;
  group_name: string;
  user_id?: string;
}

export default function LeaderboardScreen({ route, navigation }: Props) {
  const { tournamentId } = route.params;
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scoreType, setScoreType] = useState<'net' | 'gross'>('net');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const uniqueGroups = useMemo(() => {
    const groups = new Set(leaderboard.map((item) => item.group_name));
    return Array.from(groups);
  }, [leaderboard]);

  const filteredLeaderboard = useMemo(() => {
    let filtered = leaderboard;

    // Filter by group if selected
    if (selectedGroup) {
      filtered = filtered.filter((item) => item.group_name === selectedGroup);
    }

    // Sort by selected score type
    return filtered.sort((a, b) => {
      const scoreA = scoreType === 'net' ? a.net_score : a.gross_score;
      const scoreB = scoreType === 'net' ? b.net_score : b.gross_score;

      if (scoreA === null) return 1;
      if (scoreB === null) return -1;
      return scoreA - scoreB;
    });
  }, [leaderboard, scoreType, selectedGroup]);

  const userPosition = useMemo(() => {
    if (!user?.id) return null;
    const index = filteredLeaderboard.findIndex(
      (item) => item.user_id === user.id
    );
    return index !== -1 ? filteredLeaderboard[index] : null;
  }, [filteredLeaderboard, user?.id]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data } = await tournamentsService.fetchLeaderboard(tournamentId);
      setLeaderboard(data || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [tournamentId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => {
    const score = scoreType === 'net' ? item.net_score : item.gross_score;
    const isCurrentUser = user?.id === item.user_id;

    const handlePress = () => {
      navigation.navigate('GolferScorecardPreview', {
        roundId: item.id,
        golferInfo: {
          firstName: item.first_name,
          lastName: item.last_name,
          avatarUrl: item.avatar_url,
          groupName: item.group_name,
        },
      });
    };

    return (
      <LeaderboardCard
        place={item.place}
        firstName={item.first_name}
        lastName={item.last_name}
        avatarUrl={item.avatar_url}
        groupName={item.group_name}
        score={score ?? 0}
        vsPar={item.score_vs_par ?? 0}
        holesComplete={score ? 18 : 0}
        isCurrentUser={isCurrentUser}
        onPress={handlePress}
      />
    );
  };

  const renderLoadingState = () => (
    <View style={styles.listContent}>
      <LeaderboardItemSkeleton />
      <LeaderboardItemSkeleton />
      <LeaderboardItemSkeleton />
      <LeaderboardItemSkeleton />
      <LeaderboardItemSkeleton />
      <LeaderboardItemSkeleton />
      <LeaderboardItemSkeleton />
      <LeaderboardItemSkeleton />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      {/* Filter Bar */}
      <View style={[styles.filterBar, isDark && styles.filterBarDark]}>
        {/* Score Type Toggle */}
        <View style={styles.toggleGroup}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              scoreType === 'net' && styles.toggleButtonActive,
              isDark && scoreType === 'net' && styles.toggleButtonActiveDark,
            ]}
            onPress={() => setScoreType('net')}
          >
            <Text
              style={[
                styles.toggleButtonText,
                scoreType === 'net' && styles.toggleButtonTextActive,
              ]}
            >
              {t('tournament.leaderboard.netScore')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              scoreType === 'gross' && styles.toggleButtonActive,
              isDark && scoreType === 'gross' && styles.toggleButtonActiveDark,
            ]}
            onPress={() => setScoreType('gross')}
          >
            <Text
              style={[
                styles.toggleButtonText,
                scoreType === 'gross' && styles.toggleButtonTextActive,
              ]}
            >
              {t('tournament.leaderboard.grossScore')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Group Filter */}
        {uniqueGroups.length > 1 && (
          <TouchableOpacity
            style={[styles.filterButton, isDark && styles.filterButtonDark]}
            onPress={() =>
              setSelectedGroup(selectedGroup ? null : uniqueGroups[0])
            }
          >
            <Text
              style={[
                styles.filterButtonText,
                isDark && styles.filterButtonTextDark,
              ]}
            >
              {selectedGroup || t('tournament.leaderboard.allFlights')}
            </Text>
            <ChevronDown size={16} color={isDark ? '#ffffff' : '#1a1d21'} />
          </TouchableOpacity>
        )}
      </View>

      {/* User Position Highlight */}
      {userPosition && (
        <View style={[styles.userPositionSection, isDark && styles.userPositionSectionDark]}>
          <Text
            style={[
              styles.userPositionLabel,
              isDark && styles.userPositionLabelDark,
            ]}
          >
            {t('tournament.leaderboard.yourPosition')}
          </Text>
          <LeaderboardCard
            place={userPosition.place}
            firstName={userPosition.first_name}
            lastName={userPosition.last_name}
            avatarUrl={userPosition.avatar_url}
            groupName={userPosition.group_name}
            score={
              scoreType === 'net'
                ? userPosition.net_score ?? 0
                : userPosition.gross_score ?? 0
            }
            vsPar={userPosition.score_vs_par ?? 0}
            holesComplete={
              scoreType === 'net'
                ? userPosition.net_score ? 18 : 0
                : userPosition.gross_score ? 18 : 0
            }
            isCurrentUser={true}
          />
        </View>
      )}

      {/* Leaderboard List */}
      <FlatList
        data={filteredLeaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              {t('tournament.leaderboard.emptyLeaderboard')}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2d7a4e"
          />
        }
      />
    </SafeAreaView>
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterBarDark: {
    backgroundColor: '#2b3137',
    borderBottomColor: '#495057',
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#2d7a4e',
  },
  toggleButtonActiveDark: {
    backgroundColor: '#22c55e',
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  toggleButtonTextActive: {
    color: '#ffffff',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonDark: {
    backgroundColor: '#1a1d21',
    borderColor: '#495057',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1d21',
  },
  filterButtonTextDark: {
    color: '#ffffff',
  },
  userPositionSection: {
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 2,
    borderBottomColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userPositionSectionDark: {
    backgroundColor: '#1a3a1a',
    borderBottomColor: '#22c55e',
  },
  userPositionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d7a4e',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userPositionLabelDark: {
    color: '#86efac',
  },
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  centerContainerDark: {
    backgroundColor: '#1a1d21',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyTextDark: {
    color: '#d1d5db',
  },
});
