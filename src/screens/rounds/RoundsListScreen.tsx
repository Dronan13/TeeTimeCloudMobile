import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { RoundsStackParamList } from '@/types/personalRound';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { golfRoundsService } from '@/services/golfRounds';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus } from 'lucide-react-native';

type Props = NativeStackScreenProps<RoundsStackParamList, 'RoundsList'>;

interface RoundCardData {
  id: string;
  course_name: string;
  round_date: string;
  total_score: number;
  front_score: number;
  back_score: number;
  score_to_par: number;
  tee_box_name: string;
  tee_box_color?: string;
  greens_in_regulation?: number;
}

export default function RoundsListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [rounds, setRounds] = useState<RoundCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const bgColor = isDark ? '#1e2226' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1e2226';
  const secondaryColor = isDark ? '#adb5bd' : '#6c757d';
  const cardBg = isDark ? '#2b3137' : '#f8f9fa';

  useEffect(() => {
    fetchRounds(1);
  }, [user?.id]);

  // Refresh data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchRounds(1);
    }, [user?.id])
  );

  const fetchRounds = useCallback(
    async (pageNum: number = 1, isRefresh = false) => {
      if (!user?.id) return;

      try {
        if (isRefresh) setRefreshing(true);
        else if (pageNum === 1) setLoading(true);

        const response = await golfRoundsService.fetchGolfRounds(user.id, pageNum, 20);

        if (response.error) {
          console.error('Error fetching rounds:', response.error);
          return;
        }

        if (response.data) {
          const newRounds = response.data.data as RoundCardData[];
          setRounds(pageNum === 1 ? newRounds : [...rounds, ...newRounds]);
          setTotalCount(response.data.total);
          setHasMore(response.data.hasMore);
          setPage(pageNum);
        }
      } catch (error) {
        console.error('Error in fetchRounds:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id, rounds]
  );

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchRounds(page + 1);
    }
  }, [hasMore, loading, page, fetchRounds]);

  const handleRefresh = useCallback(() => {
    fetchRounds(1, true);
  }, [fetchRounds]);

  const handleNewRound = useCallback(() => {
    navigation.navigate('NewRound');
  }, [navigation]);

  const handleRoundPress = useCallback(
    (roundId: string) => {
      navigation.navigate('RoundDetail', { roundId });
    },
    [navigation]
  );

  const RoundCard = ({ item }: { item: RoundCardData }) => {
    const isGood = item.score_to_par <= 0;
    const scoreBgColor = isGood
      ? isDark
        ? '#1e4620'
        : '#d4edda'
      : isDark
      ? '#4a2626'
      : '#f8d7da';
    const scoreTextColor = isGood
      ? isDark
        ? '#90ee90'
        : '#155724'
      : isDark
      ? '#f8a5a5'
      : '#721c24';

    return (
      <TouchableOpacity
        onPress={() => handleRoundPress(item.id)}
        activeOpacity={0.7}
        className="mb-3 rounded-lg border"
        style={{
          backgroundColor: cardBg,
          borderColor: isDark ? '#343a40' : '#dee2e6',
        }}
      >
        <View className="p-4">
          {/* Header: Course name and date */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1 pr-2">
              <Text
                className="font-semibold text-base mb-1"
                style={{ color: textColor }}
              >
                {item.course_name}
              </Text>
              <Text
                className="text-sm"
                style={{ color: secondaryColor }}
              >
                {new Date(item.round_date).toLocaleDateString()}
              </Text>
            </View>
            {item.tee_box_color && (
              <View
                className="w-8 h-8 rounded-full"
                style={{
                  backgroundColor: item.tee_box_color,
                }}
              />
            )}
          </View>

          {/* Scores Grid */}
          <View className="flex-row justify-between mb-2">
            {/* Gross Score */}
            <View className="flex-1 mr-2">
              <Text
                className="text-xs"
                style={{ color: secondaryColor }}
              >
                {t('rounds.detail.score')}
              </Text>
              <Text
                className="text-xl font-bold"
                style={{ color: textColor }}
              >
                {item.total_score}
              </Text>
            </View>

            {/* Score to Par */}
            <View
              className="flex-1 rounded-lg p-2 items-center"
              style={{ backgroundColor: scoreBgColor }}
            >
              <Text
                className="text-xs"
                style={{ color: scoreTextColor }}
              >
                {t('rounds.detail.vsPar')}
              </Text>
              <Text
                className="text-xl font-bold"
                style={{ color: scoreTextColor }}
              >
                {item.score_to_par > 0 ? '+' : ''}
                {item.score_to_par}
              </Text>
            </View>

            {/* GIR Count */}
            <View className="flex-1 ml-2">
              <Text
                className="text-xs"
                style={{ color: secondaryColor }}
              >
                {t('rounds.detail.gir')}
              </Text>
              <Text
                className="text-xl font-bold"
                style={{ color: textColor }}
              >
                {item.greens_in_regulation || '0'}
              </Text>
            </View>
          </View>

          {/* Nine-hole scores */}
          <View className="flex-row justify-between">
            <Text
              className="text-xs"
              style={{ color: secondaryColor }}
            >
              {t('rounds.detail.front9')}: <Text style={{ color: textColor }}>{item.front_score}</Text>
            </Text>
            <Text
              className="text-xs"
              style={{ color: secondaryColor }}
            >
              {t('rounds.detail.back9')}: <Text style={{ color: textColor }}>{item.back_score}</Text>
            </Text>
          </View>

          {/* Status badge */}
          {!item.total_score && (
            <View className="mt-2 pt-2 border-t" style={{ borderColor: isDark ? '#343a40' : '#dee2e6' }}>
              <Text className="text-xs" style={{ color: '#ffc107' }}>
                {t('rounds.detail.inProgress')}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyList = () => (
    <View className="flex-1 justify-center items-center py-12">
      <Text
        className="text-lg font-semibold mb-2"
        style={{ color: textColor }}
      >
        {t('rounds.noRounds')}
      </Text>
      <Text
        className="text-sm text-center px-6"
        style={{ color: secondaryColor }}
      >
        {t('rounds.noRoundsMessage')}
      </Text>
      <TouchableOpacity
        onPress={handleNewRound}
        className="mt-6 px-6 py-3 rounded-lg"
        style={{ backgroundColor: '#2d7a4e' }}
      >
        <Text className="text-white font-semibold">{t('rounds.startFirstRound')}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && rounds.length === 0) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: bgColor }}
      >
        <ActivityIndicator size="large" color="#2d7a4e" />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      <FlatList
        data={rounds}
        renderItem={({ item }) => <RoundCard item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2d7a4e"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<EmptyList />}
        ListFooterComponent={
          loading && rounds.length > 0 ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#2d7a4e" />
            </View>
          ) : null
        }
      />

      {/* Floating action button */}
      <TouchableOpacity
        onPress={handleNewRound}
        className="absolute bottom-8 right-6 w-14 h-14 rounded-full justify-center items-center shadow-lg"
        style={{ backgroundColor: '#2d7a4e' }}
      >
        <Plus size={28} color="#ffffff" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}
