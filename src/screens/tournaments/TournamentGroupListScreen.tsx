import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TournamentsStackParamList } from '@/types';
import { tournamentsService } from '@/services/tournaments';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

type Props = NativeStackScreenProps<TournamentsStackParamList, 'TournamentGroupList'>;

interface PlayerItem {
  id: string;
  user_id: string;
  is_complete: boolean;
  gross_score: number | null;
  net_score: number | null;
  handicap_index: number | null;
  golfer_profiles?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export default function TournamentGroupListScreen({
  route,
  navigation,
}: Props) {
  const { groupId, groupName } = route.params;
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [players, setPlayers] = useState<PlayerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      title: groupName,
    });
  }, [navigation, groupName]);

  const fetchGroupPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } =
        await tournamentsService.fetchTournamentGroupPlayers(groupId);

      if (error) {
        Alert.alert(t('common.error'), t('errors.server'));
        return;
      }

      setPlayers(data || []);
    } catch (err) {
      Alert.alert(t('common.error'), t('errors.unknown'));
    } finally {
      setLoading(false);
    }
  }, [groupId, t]);

  useEffect(() => {
    fetchGroupPlayers();
  }, [fetchGroupPlayers]);

  const renderPlayerItem = ({ item }: { item: PlayerItem }) => {
    const profile = item.golfer_profiles;
    const playerName = profile
      ? `${profile.first_name} ${profile.last_name}`
      : 'Unknown';

    return (
      <View style={[styles.playerCard, isDark && styles.playerCardDark]}>
        <View style={styles.playerHeader}>
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, isDark && styles.avatarPlaceholderDark]}>
              <Text style={[styles.avatarText, isDark && styles.avatarTextDark]}>
                {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
              </Text>
            </View>
          )}
          <View style={styles.playerInfo}>
            <Text style={[styles.playerName, isDark && styles.playerNameDark]}>
              {playerName}
            </Text>
            {item.handicap_index !== null && (
              <Text style={[styles.handicap, isDark && styles.handicapDark]}>
                {t('tournament.groupList.handicap')}: {item.handicap_index.toFixed(1)}
              </Text>
            )}
          </View>
        </View>

        {item.gross_score !== null && (
          <View style={styles.scoreSection}>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreLabel, isDark && styles.scoreLabelDark]}>
                Gross
              </Text>
              <Text style={[styles.scoreValue, isDark && styles.scoreValueDark]}>
                {item.gross_score}
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreLabel, isDark && styles.scoreLabelDark]}>
                Net
              </Text>
              <Text style={[styles.scoreValue, isDark && styles.scoreValueDark]}>
                {item.net_score}
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={[styles.scoreLabel, isDark && styles.scoreLabelDark]}>
                {t('tournament.groupList.status')}
              </Text>
              <Text
                style={[
                  styles.scoreValue,
                  isDark && styles.scoreValueDark,
                  { color: item.is_complete ? '#10b981' : '#f59e0b' },
                ]}
              >
                {item.is_complete ? 'Done' : 'Playing'}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

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
        data={players}
        renderItem={renderPlayerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              {t('tournament.groupList.players')}
            </Text>
          </View>
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
  playerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  playerCardDark: {
    backgroundColor: '#2b3137',
    borderColor: '#495057',
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarPlaceholderDark: {
    backgroundColor: '#495057',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  avatarTextDark: {
    color: '#d1d5db',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1d21',
    marginBottom: 4,
  },
  playerNameDark: {
    color: '#ffffff',
  },
  handicap: {
    fontSize: 12,
    color: '#6b7280',
  },
  handicapDark: {
    color: '#d1d5db',
  },
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTopVertical: 12,
    gap: 12,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  scoreLabelDark: {
    color: '#d1d5db',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1d21',
  },
  scoreValueDark: {
    color: '#ffffff',
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
    textAlign: 'center',
  },
  emptyTextDark: {
    color: '#d1d5db',
  },
});
