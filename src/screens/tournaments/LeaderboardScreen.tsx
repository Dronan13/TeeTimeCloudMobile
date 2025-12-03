import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TournamentsStackParamList } from '@/types';
import { tournamentsService } from '@/services/tournaments';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

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
}

export default function LeaderboardScreen({ route }: Props) {
  const { tournamentId } = route.params;
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => (
    <View style={[styles.leaderboardRow, isDark && styles.leaderboardRowDark]}>
      <Text style={[styles.placement, isDark && styles.placementDark]}>
        {item.place}
      </Text>
      <View style={styles.playerInfo}>
        <Text style={[styles.playerName, isDark && styles.playerNameDark]}>
          {item.first_name} {item.last_name}
        </Text>
        <Text style={[styles.groupName, isDark && styles.groupNameDark]}>
          {item.group_name}
        </Text>
      </View>
      <View style={styles.scoreInfo}>
        <Text style={[styles.netScore, isDark && styles.netScoreDark]}>
          {item.net_score ?? '—'}
        </Text>
        <Text style={[styles.parInfo, isDark && styles.parInfoDark]}>
          {item.score_vs_par !== null && item.score_vs_par >= 0 ? '+' : ''}
          {item.score_vs_par}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, isDark && styles.centerContainerDark]}>
        <ActivityIndicator size="large" color="#2d7a4e" />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <FlatList
        data={leaderboard}
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
  listContent: {
    padding: 16,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  leaderboardRowDark: {
    backgroundColor: '#2b3137',
    borderColor: '#495057',
  },
  placement: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d7a4e',
    marginRight: 12,
    minWidth: 30,
    textAlign: 'center',
  },
  placementDark: {
    color: '#86efac',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1d21',
    marginBottom: 4,
  },
  playerNameDark: {
    color: '#ffffff',
  },
  groupName: {
    fontSize: 12,
    color: '#6b7280',
  },
  groupNameDark: {
    color: '#d1d5db',
  },
  scoreInfo: {
    alignItems: 'flex-end',
  },
  netScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1d21',
    marginBottom: 2,
  },
  netScoreDark: {
    color: '#ffffff',
  },
  parInfo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  parInfoDark: {
    color: '#d1d5db',
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
