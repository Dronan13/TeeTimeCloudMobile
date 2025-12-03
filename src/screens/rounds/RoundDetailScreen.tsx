import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { RoundsStackParamList } from '@/types/personalRound';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/contexts/ThemeContext';
import { golfRoundsService, RoundStatistics } from '@/services/golfRounds';
import { calculateStatistics } from '@/utils/personalRoundSync';
import { Edit2, Trash2 } from 'lucide-react-native';

type Props = NativeStackScreenProps<RoundsStackParamList, 'RoundDetail'>;

interface HoleDetail {
  number: number;
  score: number;
  par: number;
  yards: number;
  putts: number;
  fairway_hit: boolean | null;
  sand_save: boolean | null;
  penalties: number;
}

interface RoundDetail {
  id: string;
  course_name: string;
  tee_box_name: string;
  tee_box_color?: string;
  round_date: string;
  start_time?: string;
  end_time?: string;
  course_rating?: number;
  slope_rating?: number;
  total_score: number;
  front_score: number;
  back_score: number;
}

export default function RoundDetailScreen({ navigation, route }: Props) {
  const { roundId } = route.params;
  const { isDark } = useTheme();

  const [round, setRound] = useState<RoundDetail | null>(null);
  const [holes, setHoles] = useState<HoleDetail[]>([]);
  const [stats, setStats] = useState<RoundStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const bgColor = isDark ? '#1e2226' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1e2226';
  const secondaryColor = isDark ? '#adb5bd' : '#6c757d';
  const cardBg = isDark ? '#2b3137' : '#f8f9fa';
  const borderColor = isDark ? '#343a40' : '#dee2e6';

  useEffect(() => {
    loadRoundDetails();
  }, [roundId]);

  const loadRoundDetails = useCallback(async () => {
    try {
      setLoading(true);

      const roundResponse = await golfRoundsService.fetchGolfRound(roundId);
      if (roundResponse.error || !roundResponse.data) {
        console.error('Error fetching round:', roundResponse.error);
        return;
      }

      const roundData = roundResponse.data as any;
      setRound({
        id: roundData.id,
        course_name: roundData.course_name,
        tee_box_name: roundData.tee_box_name,
        tee_box_color: roundData.tee_box_color,
        round_date: roundData.round_date,
        start_time: roundData.start_time,
        end_time: roundData.end_time,
        course_rating: roundData.course_rating,
        slope_rating: roundData.slope_rating,
        total_score: roundData.total_score,
        front_score: roundData.front_score,
        back_score: roundData.back_score,
      });

      const holesResponse = await golfRoundsService.fetchGolfRoundHoles(roundId);
      if (holesResponse.data) {
        const holesData = (holesResponse.data as any[])
          .map((h) => ({
            number: h.hole_number,
            score: h.strokes,
            par: h.course_par || h.par,
            yards: h.course_yards || h.yards,
            putts: h.putts || 0,
            fairway_hit: h.fairway_hit,
            sand_save: h.sand_save,
            penalties: h.penalties || 0,
          }))
          .sort((a, b) => a.number - b.number);

        setHoles(holesData);

        const calculatedStats = calculateStatistics(
          holesData,
          roundData.course_rating,
          roundData.slope_rating
        );
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Error loading round details:', error);
    } finally {
      setLoading(false);
    }
  }, [roundId]);

  const handleEdit = useCallback(() => {
    navigation.navigate('PersonalScorecard', { roundId, isEditing: true });
  }, [navigation, roundId]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Round', 'Are you sure you want to delete this round?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            await golfRoundsService.deleteGolfRound(roundId);
            navigation.navigate('RoundsList');
          } catch (error) {
            console.error('Error deleting round:', error);
            Alert.alert('Error', 'Failed to delete round');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }, [roundId, navigation]);

  if (loading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: bgColor }}
      >
        <ActivityIndicator size="large" color="#2d7a4e" />
      </View>
    );
  }

  const isGood = (stats?.scoreToPar || 0) <= 0;

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        {round && (
          <View className="px-4 py-4 border-b" style={{ borderColor: borderColor }}>
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text
                  className="text-xl font-bold mb-1"
                  style={{ color: textColor }}
                >
                  {round.course_name}
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: secondaryColor }}
                >
                  {new Date(round.round_date).toLocaleDateString()} • {round.tee_box_name}
                </Text>
              </View>
              {round.tee_box_color && (
                <View
                  className="w-10 h-10 rounded-full"
                  style={{ backgroundColor: round.tee_box_color }}
                />
              )}
            </View>
          </View>
        )}

        {/* Score Summary */}
        {stats && (
          <View className="px-4 py-6">
            <View className="flex-row justify-between mb-4">
              {/* Gross Score */}
              <View className="flex-1 mr-2 rounded-lg p-4" style={{ backgroundColor: cardBg }}>
                <Text className="text-xs" style={{ color: secondaryColor }}>
                  Score
                </Text>
                <Text className="text-3xl font-bold" style={{ color: textColor }}>
                  {stats.grossScore}
                </Text>
              </View>

              {/* vs Par */}
              <View
                className="flex-1 mr-2 rounded-lg p-4 items-center"
                style={{
                  backgroundColor: isGood
                    ? isDark
                      ? '#1e4620'
                      : '#d4edda'
                    : isDark
                    ? '#4a2626'
                    : '#f8d7da',
                }}
              >
                <Text
                  className="text-xs"
                  style={{ color: isGood ? '#90ee90' : '#f8a5a5' }}
                >
                  vs Par
                </Text>
                <Text
                  className="text-3xl font-bold"
                  style={{ color: isGood ? '#90ee90' : '#f8a5a5' }}
                >
                  {stats.scoreToPar > 0 ? '+' : ''}
                  {stats.scoreToPar}
                </Text>
              </View>

              {/* GIR % */}
              <View className="flex-1 rounded-lg p-4" style={{ backgroundColor: cardBg }}>
                <Text className="text-xs" style={{ color: secondaryColor }}>
                  GIR %
                </Text>
                <Text className="text-3xl font-bold" style={{ color: textColor }}>
                  {Math.round(stats.girPercentage)}%
                </Text>
              </View>
            </View>

            {/* Nine-hole breakdown */}
            <View className="flex-row justify-between mb-4">
              <View className="flex-1 mr-2 rounded-lg p-3" style={{ backgroundColor: cardBg }}>
                <Text className="text-xs" style={{ color: secondaryColor }}>
                  Front 9
                </Text>
                <Text className="text-2xl font-bold" style={{ color: textColor }}>
                  {stats.front9Score}
                </Text>
              </View>

              <View className="flex-1 mr-2 rounded-lg p-3" style={{ backgroundColor: cardBg }}>
                <Text className="text-xs" style={{ color: secondaryColor }}>
                  Back 9
                </Text>
                <Text className="text-2xl font-bold" style={{ color: textColor }}>
                  {stats.back9Score}
                </Text>
              </View>

              <View className="flex-1 rounded-lg p-3" style={{ backgroundColor: cardBg }}>
                <Text className="text-xs" style={{ color: secondaryColor }}>
                  Total Par
                </Text>
                <Text className="text-2xl font-bold" style={{ color: textColor }}>
                  {stats.totalPar}
                </Text>
              </View>
            </View>

            {/* Detailed Stats */}
            <View className="grid gap-3 mb-4">
              <View className="flex-row justify-between p-3 rounded-lg" style={{ backgroundColor: cardBg }}>
                <Text style={{ color: textColor }}>Putts</Text>
                <Text className="font-semibold" style={{ color: textColor }}>
                  {stats.totalPutts}
                </Text>
              </View>

              <View className="flex-row justify-between p-3 rounded-lg" style={{ backgroundColor: cardBg }}>
                <Text style={{ color: textColor }}>GIR</Text>
                <Text className="font-semibold" style={{ color: textColor }}>
                  {stats.girCount} / {stats.holesPlayed}
                </Text>
              </View>

              {stats.fairwaysOpportunity > 0 && (
                <View className="flex-row justify-between p-3 rounded-lg" style={{ backgroundColor: cardBg }}>
                  <Text style={{ color: textColor }}>Fairways</Text>
                  <Text className="font-semibold" style={{ color: textColor }}>
                    {stats.fairwaysHit} / {stats.fairwaysOpportunity} ({Math.round(stats.fairwayPercentage)}%)
                  </Text>
                </View>
              )}

              {stats.sandSaveOpportunity > 0 && (
                <View className="flex-row justify-between p-3 rounded-lg" style={{ backgroundColor: cardBg }}>
                  <Text style={{ color: textColor }}>Sand Saves</Text>
                  <Text className="font-semibold" style={{ color: textColor }}>
                    {stats.sandSaves} / {stats.sandSaveOpportunity} ({Math.round(stats.sandSavePercentage)}%)
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between p-3 rounded-lg" style={{ backgroundColor: cardBg }}>
                <Text style={{ color: textColor }}>Differential</Text>
                <Text className="font-semibold" style={{ color: textColor }}>
                  {stats.differential.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Hole-by-hole scorecard */}
        {holes.length > 0 && (
          <View className="px-4 py-4">
            <Text
              className="text-lg font-bold mb-3"
              style={{ color: textColor }}
            >
              Scorecard
            </Text>

            {/* Front 9 */}
            {holes.slice(0, 9).length > 0 && (
              <View className="mb-4">
                <Text
                  className="text-sm font-semibold mb-2"
                  style={{ color: secondaryColor }}
                >
                  Front 9
                </Text>
                <View className="flex-row flex-wrap">
                  {holes.slice(0, 9).map((hole) => (
                    <View
                      key={hole.number}
                      className="w-1/5 p-2"
                    >
                      <View
                        className="rounded-lg p-2 items-center"
                        style={{
                          backgroundColor: cardBg,
                          borderColor: hole.score <= hole.par ? '#22c55e' : '#ef4444',
                          borderWidth: 1,
                        }}
                      >
                        <Text
                          className="text-xs"
                          style={{ color: secondaryColor }}
                        >
                          H{hole.number}
                        </Text>
                        <Text
                          className="text-lg font-bold mt-1"
                          style={{
                            color: hole.score <= hole.par ? '#22c55e' : '#ef4444',
                          }}
                        >
                          {hole.score}
                        </Text>
                        <Text
                          className="text-xs"
                          style={{ color: secondaryColor }}
                        >
                          Par {hole.par}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Back 9 */}
            {holes.slice(9, 18).length > 0 && (
              <View>
                <Text
                  className="text-sm font-semibold mb-2"
                  style={{ color: secondaryColor }}
                >
                  Back 9
                </Text>
                <View className="flex-row flex-wrap">
                  {holes.slice(9, 18).map((hole) => (
                    <View
                      key={hole.number}
                      className="w-1/5 p-2"
                    >
                      <View
                        className="rounded-lg p-2 items-center"
                        style={{
                          backgroundColor: cardBg,
                          borderColor: hole.score <= hole.par ? '#22c55e' : '#ef4444',
                          borderWidth: 1,
                        }}
                      >
                        <Text
                          className="text-xs"
                          style={{ color: secondaryColor }}
                        >
                          H{hole.number}
                        </Text>
                        <Text
                          className="text-lg font-bold mt-1"
                          style={{
                            color: hole.score <= hole.par ? '#22c55e' : '#ef4444',
                          }}
                        >
                          {hole.score}
                        </Text>
                        <Text
                          className="text-xs"
                          style={{ color: secondaryColor }}
                        >
                          Par {hole.par}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View
        className="flex-row gap-3 px-4 py-4 border-t"
        style={{ borderColor: borderColor }}
      >
        <TouchableOpacity
          onPress={handleEdit}
          disabled={deleting}
          className="flex-1 flex-row items-center justify-center py-3 rounded-lg"
          style={{ backgroundColor: '#2d7a4e' }}
        >
          <Edit2 size={20} color="#ffffff" strokeWidth={2} />
          <Text className="text-white font-semibold ml-2">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          disabled={deleting}
          className="flex-1 flex-row items-center justify-center py-3 rounded-lg"
          style={{ backgroundColor: '#ef4444' }}
        >
          {deleting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Trash2 size={20} color="#ffffff" strokeWidth={2} />
              <Text className="text-white font-semibold ml-2">Delete</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
