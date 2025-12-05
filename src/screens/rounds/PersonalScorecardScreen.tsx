import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Switch,
  Modal,
  AppState,
} from 'react-native';
import { RoundsStackParamList } from '@/types/personalRound';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { golfRoundsService } from '@/services/golfRounds';
import {
  calculateStatistics,
  saveRoundToStorage,
  loadRoundFromStorage,
  queueHoleUpdate,
  queueRoundCompletion,
  getSyncQueue,
  processSyncQueue,
  getQueuedHoleCount,
} from '@/utils/personalRoundSync';
import { ChevronLeft, ChevronRight, Flag, Wifi, WifiOff, Loader, AlertCircle } from 'lucide-react-native';

type Props = NativeStackScreenProps<RoundsStackParamList, 'PersonalScorecard'>;

interface HoleData {
  number: number;
  score: number | null;
  par: number;
  yards: number;
  putts: number | null;
  fairwayHit: boolean | null;
  sandSave: boolean | null;
  penalties: number;
  notes: string;
}

export default function PersonalScorecardScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { isOnline } = useNetworkStatus();
  const { roundId, isEditing = false } = route.params;

  const [holes, setHoles] = useState<HoleData[]>([]);
  const [currentHole, setCurrentHole] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roundComplete, setRoundComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [courseData, setCourseData] = useState<any>(null);
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [pendingUpdates, setPendingUpdates] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState<string | null>(null);
  const scoreInputRef = useRef<TextInput>(null);

  const bgColor = isDark ? '#1e2226' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1e2226';
  const secondaryColor = isDark ? '#adb5bd' : '#6c757d';
  const cardBg = isDark ? '#2b3137' : '#f8f9fa';

  // Auto-sync function
  const attemptAutoSync = useCallback(async () => {
    if (!isOnline) {
      setSyncStatus('offline');
      return;
    }

    try {
      setSyncStatus('syncing');
      const queue = await getSyncQueue();

      if (queue.length === 0) {
        setSyncStatus('synced');
        setPendingUpdates(0);
        return;
      }

      const success = await processSyncQueue();

      if (success) {
        setSyncStatus('synced');
        setPendingUpdates(0);
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
      setSyncStatus('error');
    }
  }, [isOnline]);

  // Load round data on mount
  useEffect(() => {
    loadRoundData();
  }, [roundId]);

  // Load pending updates count on mount
  useEffect(() => {
    const loadPendingCount = async () => {
      const queue = await getSyncQueue();
      setPendingUpdates(queue.length);

      // Attempt sync if online and has pending
      if (isOnline && queue.length > 0) {
        attemptAutoSync();
      }
    };

    loadPendingCount();
  }, [isOnline, attemptAutoSync]);

  // Auto-sync timer - sync every 30 seconds when online and has pending updates
  useEffect(() => {
    if (!isOnline || pendingUpdates === 0) {
      return;
    }

    const interval = setInterval(() => {
      attemptAutoSync();
    }, 30000);

    return () => clearInterval(interval);
  }, [isOnline, pendingUpdates, attemptAutoSync]);

  // Background sync on app resume
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active' && isOnline) {
        // App returned to foreground - attempt sync
        const queueCount = await getQueuedHoleCount(roundId);
        if (queueCount > 0) {
          await attemptAutoSync();
        }
      }
    });

    return () => subscription.remove();
  }, [isOnline, roundId, attemptAutoSync]);

  const loadRoundData = useCallback(async () => {
    try {
      setLoading(true);

      // Try to load from local storage first
      const localRound = await loadRoundFromStorage(roundId);
      if (localRound) {
        const loadedHoles = localRound.holes.map((h) => ({
          number: h.number,
          score: h.score,
          par: h.par,
          yards: h.yards,
          putts: h.putts ?? null,
          fairwayHit: h.fairwayHit ?? null,
          sandSave: h.sandSave ?? null,
          penalties: h.penalties || 0,
          notes: h.notes || '',
        }));

        // Pad to 18 holes if needed
        while (loadedHoles.length < 18) {
          const holeNum = loadedHoles.length + 1;
          loadedHoles.push({
            number: holeNum,
            score: null,
            par: 4,
            yards: 0,
            putts: null,
            fairwayHit: null,
            sandSave: null,
            penalties: 0,
            notes: '',
          });
        }

        setHoles(loadedHoles);
        setRoundComplete(localRound.isComplete);
        setRoundStartTime(localRound.roundStartTime || null);
        return;
      }

      // Otherwise fetch from server
      const roundResponse = await golfRoundsService.fetchGolfRound(roundId);
      if (roundResponse.error || !roundResponse.data) {
        console.error('Error fetching round:', roundResponse.error);
        return;
      }

      const round = roundResponse.data as any;
      setCourseData(round);
      setRoundComplete(!!round.total_score); // Round is complete if it has a total_score
      setRoundStartTime(round.start_time || new Date().toISOString()); // Use existing or set now

      // Fetch holes
      const holesResponse = await golfRoundsService.fetchGolfRoundHoles(roundId);
      if (holesResponse.data) {
        const holesData = (holesResponse.data as any[])
          .map((h) => ({
            number: h.hole_number,
            score: h.strokes,
            par: h.course_par || h.par,
            yards: h.course_yards || h.yards,
            putts: h.putts,
            fairwayHit: h.fairway_hit,
            sandSave: h.sand_save,
            penalties: h.penalties || 0,
            notes: h.notes || '',
          }))
          .sort((a, b) => a.number - b.number);

        // Pad to 18 holes if needed
        while (holesData.length < 18) {
          const holeNum = holesData.length + 1;
          holesData.push({
            number: holeNum,
            score: null,
            par: 4,
            yards: 0,
            putts: null,
            fairwayHit: null,
            sandSave: null,
            penalties: 0,
            notes: '',
          });
        }

        setHoles(holesData);
      }
    } catch (error) {
      console.error('Error loading round data:', error);
    } finally {
      setLoading(false);
    }
  }, [roundId]);

  const updateHole = useCallback(
    (holeIndex: number, updates: Partial<HoleData>) => {
      // Update local state immediately (synchronous for UI responsiveness)
      const newHoles = [...holes];
      newHoles[holeIndex] = { ...newHoles[holeIndex], ...updates };
      setHoles(newHoles);

      // Perform async operations in background without blocking UI
      (async () => {
        try {
          // Recalculate statistics
          const playedHoles = newHoles.filter((h) => h.score !== null);
          const newStats = calculateStatistics(playedHoles, courseData?.course_rating, courseData?.slope_rating);

          // Save to AsyncStorage immediately
          const updatedRound = {
            roundId,
            courseId: courseData?.course_id,
            teeBoxId: courseData?.tee_box_id,
            holes: playedHoles,
            roundDate: courseData?.round_date,
            roundStartTime: roundStartTime || new Date().toISOString(),
            statistics: newStats,
            isComplete: false,
            lastSyncedAt: null,
          };
          await saveRoundToStorage(updatedRound);

          // Set start time if not already set
          if (!roundStartTime) {
            setRoundStartTime(updatedRound.roundStartTime);
          }

          // Queue hole update for Supabase sync
          await queueHoleUpdate(roundId, newHoles[holeIndex].number, {
            user_id: user?.id,
            tee_box_id: courseData?.tee_box_id || null,
            strokes: newHoles[holeIndex].score,
            putts: newHoles[holeIndex].putts,
            fairway_hit: newHoles[holeIndex].fairwayHit,
            sand_save: newHoles[holeIndex].sandSave,
            penalties: newHoles[holeIndex].penalties,
            notes: newHoles[holeIndex].notes,
          });

          // Update pending count
          const queue = await getSyncQueue();
          setPendingUpdates(queue.length);

          // Attempt immediate sync if online
          if (isOnline) {
            attemptAutoSync();
          } else {
            setSyncStatus('offline');
          }
        } catch (error) {
          console.error('Error updating hole:', error);
          setSyncStatus('error');
        }
      })();
    },
    [holes, roundId, courseData, user?.id, isOnline, attemptAutoSync]
  );

  const handleScoreInput = useCallback(
    (score: string) => {
      const numScore = parseInt(score, 10);
      if (!isNaN(numScore) && numScore > 0 && numScore <= 20) {
        updateHole(currentHole, { score: numScore });
        setShowScoreInput(false);
      }
    },
    [currentHole, updateHole]
  );

  const handleFinishRound = useCallback(async () => {
    const playedHoles = holes.filter((h) => h.score !== null);

    if (playedHoles.length === 0) {
      alert('Please enter at least one hole score');
      return;
    }

    try {
      setSaving(true);

      // Calculate final statistics
      const stats = calculateStatistics(playedHoles, courseData?.course_rating, courseData?.slope_rating);

      const endTime = new Date().toISOString();
      const startTime = roundStartTime || courseData?.start_time || endTime;

      // Save final state locally with completion flag
      const finalRound = {
        roundId,
        courseId: courseData?.course_id,
        teeBoxId: courseData?.tee_box_id,
        holes: playedHoles,
        roundDate: courseData?.round_date,
        roundStartTime: startTime,
        roundEndTime: endTime,
        statistics: stats,
        isComplete: true,
        lastSyncedAt: null,
      };
      await saveRoundToStorage(finalRound);

      // Queue all holes and completion for sync
      for (const hole of playedHoles) {
        await queueHoleUpdate(roundId, hole.number, {
          user_id: user?.id,
          tee_box_id: courseData?.tee_box_id || null,
          strokes: hole.score,
          putts: hole.putts,
          fairway_hit: hole.fairwayHit,
          sand_save: hole.sandSave,
          penalties: hole.penalties,
          notes: hole.notes,
        });
      }

      // Queue round completion with start and end times
      await queueRoundCompletion(roundId, stats, startTime, endTime);

      // Attempt full sync if online
      if (isOnline) {
        setSyncStatus('syncing');
        const success = await processSyncQueue();

        if (success) {
          setSyncStatus('synced');
          // Update storage with sync timestamp
          await saveRoundToStorage({ ...finalRound, lastSyncedAt: new Date().toISOString() });
          navigation.replace('RoundDetail', { roundId });
        } else {
          setSyncStatus('error');
          alert('Some data will sync when connection improves');
          navigation.replace('RoundDetail', { roundId });
        }
      } else {
        // Offline - allow navigation, will sync later
        setSyncStatus('offline');
        alert('Your round will sync when you\'re online');
        navigation.replace('RoundDetail', { roundId });
      }
    } catch (error) {
      console.error('Error finishing round:', error);
      alert('Error completing round. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [holes, roundId, user?.id, courseData, isOnline, navigation]);

  const currentHoleData = holes[currentHole];
  const playedHoles = holes.filter((h) => h.score !== null);
  const stats = calculateStatistics(playedHoles);

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

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Header */}
        <View className="px-4 py-4 border-b" style={{ borderColor: isDark ? '#343a40' : '#dee2e6' }}>
          <View className="flex-row justify-between mb-2">
            <View>
              <Text className="text-xs" style={{ color: secondaryColor }}>
                Score
              </Text>
              <Text className="text-2xl font-bold" style={{ color: textColor }}>
                {stats.grossScore}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs" style={{ color: secondaryColor }}>
                vs Par
              </Text>
              <Text
                className="text-2xl font-bold"
                style={{
                  color: stats.scoreToPar <= 0 ? '#22c55e' : '#ef4444',
                }}
              >
                {stats.scoreToPar > 0 ? '+' : ''}
                {stats.scoreToPar}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs" style={{ color: secondaryColor }}>
                GIR
              </Text>
              <Text className="text-2xl font-bold" style={{ color: textColor }}>
                {stats.girCount}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xs" style={{ color: secondaryColor }}>
                Holes
              </Text>
              <Text className="text-2xl font-bold" style={{ color: textColor }}>
                {playedHoles.length}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between text-xs">
            <Text style={{ color: secondaryColor }}>
              Out: <Text style={{ color: textColor, fontWeight: '600' }}>{stats.front9Score}</Text>
            </Text>
            <Text style={{ color: secondaryColor }}>
              In: <Text style={{ color: textColor, fontWeight: '600' }}>{stats.back9Score}</Text>
            </Text>
            <Text style={{ color: secondaryColor }}>
              Putts: <Text style={{ color: textColor, fontWeight: '600' }}>{stats.totalPutts}</Text>
            </Text>
          </View>

          {/* Sync Status Indicator */}
          <View className="flex-row items-center justify-end gap-2 mt-2">
            {syncStatus === 'synced' && isOnline && (
              <View className="flex-row items-center gap-1">
                <Wifi size={16} color="#22c55e" />
                <Text className="text-xs" style={{ color: '#22c55e' }}>Synced</Text>
              </View>
            )}
            {syncStatus === 'syncing' && (
              <View className="flex-row items-center gap-1">
                <Loader size={16} color="#eab308" />
                <Text className="text-xs" style={{ color: '#eab308' }}>Syncing</Text>
              </View>
            )}
            {syncStatus === 'offline' && (
              <View className="flex-row items-center gap-1">
                <WifiOff size={16} color={secondaryColor} />
                <Text className="text-xs" style={{ color: secondaryColor }}>Offline</Text>
              </View>
            )}
            {syncStatus === 'error' && (
              <View className="flex-row items-center gap-1">
                <AlertCircle size={16} color="#ef4444" />
                <Text className="text-xs" style={{ color: '#ef4444' }}>Sync Error</Text>
              </View>
            )}
          </View>
        </View>

        {/* Current Hole Detail */}
        {currentHoleData && (
          <View className="px-4 py-6">
            <View className="mb-4 items-center">
              <Text
                className="text-3xl font-bold mb-2"
                style={{ color: textColor }}
              >
                Hole {currentHoleData.number}
              </Text>
              <View className="flex-row">
                <Text className="text-sm" style={{ color: secondaryColor }}>
                  Par {currentHoleData.par} • {currentHoleData.yards} yds
                </Text>
              </View>
            </View>

            {/* Score Entry */}
            <TouchableOpacity
              onPress={() => setShowScoreInput(true)}
              className="rounded-lg p-6 mb-4 items-center border-2"
              style={{
                backgroundColor: currentHoleData.score ? '#f0f8f4' : cardBg,
                borderColor: currentHoleData.score ? '#2d7a4e' : isDark ? '#343a40' : '#dee2e6',
              }}
            >
              {currentHoleData.score ? (
                <>
                  <Text
                    className="text-xs"
                    style={{ color: secondaryColor }}
                  >
                    Your Score
                  </Text>
                  <Text
                    className="text-5xl font-bold"
                    style={{ color: '#2d7a4e' }}
                  >
                    {currentHoleData.score}
                  </Text>
                  <Text
                    className="text-sm mt-2"
                    style={{
                      color:
                        currentHoleData.score <= currentHoleData.par
                          ? '#22c55e'
                          : '#ef4444',
                    }}
                  >
                    {currentHoleData.score < currentHoleData.par ? '-' : '+'}
                    {Math.abs(currentHoleData.score - currentHoleData.par)}
                  </Text>
                </>
              ) : (
                <Text className="text-lg" style={{ color: secondaryColor }}>
                  Tap to enter score
                </Text>
              )}
            </TouchableOpacity>

            {/* Additional Stats */}
            <View className="space-y-3">
              {/* Putts */}
              <View className="flex-row items-center px-4 py-3 rounded-lg" style={{ backgroundColor: cardBg }}>
                <Text className="flex-1 font-semibold" style={{ color: textColor }}>
                  Putts
                </Text>
                <TextInput
                  value={currentHoleData.putts?.toString() || ''}
                  onChangeText={(val) =>
                    updateHole(currentHole, { putts: val ? parseInt(val, 10) : null })
                  }
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={secondaryColor}
                  className="w-12 text-center rounded px-2 py-1"
                  style={{
                    backgroundColor: isDark ? '#1e2226' : '#ffffff',
                    color: textColor,
                    borderColor: isDark ? '#343a40' : '#dee2e6',
                    borderWidth: 1,
                  }}
                />
              </View>

              {/* Fairway (only for Par 4 & 5) */}
              {currentHoleData.par >= 4 && (
                <View className="flex-row items-center px-4 py-3 rounded-lg" style={{ backgroundColor: cardBg }}>
                  <Text className="flex-1 font-semibold" style={{ color: textColor }}>
                    Fairway Hit
                  </Text>
                  <Switch
                    value={currentHoleData.fairwayHit === true}
                    onValueChange={(val) =>
                      updateHole(currentHole, { fairwayHit: val ? true : null })
                    }
                    trackColor={{ false: '#ccc', true: '#2d7a4e' }}
                  />
                </View>
              )}

              {/* Sand Save */}
              <View className="flex-row items-center px-4 py-3 rounded-lg" style={{ backgroundColor: cardBg }}>
                <Text className="flex-1 font-semibold" style={{ color: textColor }}>
                  Sand Save
                </Text>
                <View className="flex-row space-x-2">
                  <TouchableOpacity
                    onPress={() =>
                      updateHole(currentHole, {
                        sandSave: currentHoleData.sandSave === null ? true : null,
                      })
                    }
                    className="px-3 py-1 rounded"
                    style={{
                      backgroundColor:
                        currentHoleData.sandSave === true ? '#2d7a4e' : 'transparent',
                      borderColor: isDark ? '#343a40' : '#dee2e6',
                      borderWidth: 1,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          currentHoleData.sandSave === true ? '#ffffff' : textColor,
                      }}
                    >
                      Yes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      updateHole(currentHole, {
                        sandSave: currentHoleData.sandSave === false ? null : false,
                      })
                    }
                    className="px-3 py-1 rounded"
                    style={{
                      backgroundColor:
                        currentHoleData.sandSave === false ? '#ef4444' : 'transparent',
                      borderColor: isDark ? '#343a40' : '#dee2e6',
                      borderWidth: 1,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          currentHoleData.sandSave === false ? '#ffffff' : textColor,
                      }}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Penalties */}
              <View className="flex-row items-center px-4 py-3 rounded-lg" style={{ backgroundColor: cardBg }}>
                <Text className="flex-1 font-semibold" style={{ color: textColor }}>
                  Penalties
                </Text>
                <TextInput
                  value={currentHoleData.penalties.toString()}
                  onChangeText={(val) =>
                    updateHole(currentHole, { penalties: val ? parseInt(val, 10) : 0 })
                  }
                  keyboardType="number-pad"
                  className="w-12 text-center rounded px-2 py-1"
                  style={{
                    backgroundColor: isDark ? '#1e2226' : '#ffffff',
                    color: textColor,
                    borderColor: isDark ? '#343a40' : '#dee2e6',
                    borderWidth: 1,
                  }}
                />
              </View>
            </View>
          </View>
        )}

        {/* Hole Navigation */}
        <View className="flex-row justify-between items-center px-4 py-4 border-t" style={{ borderColor: isDark ? '#343a40' : '#dee2e6' }}>
          <TouchableOpacity
            onPress={() => setCurrentHole(Math.max(0, currentHole - 1))}
            disabled={currentHole === 0}
            className="px-4 py-2 rounded"
            style={{ backgroundColor: currentHole === 0 ? '#ccc' : '#2d7a4e' }}
          >
            <ChevronLeft size={24} color={currentHole === 0 ? '#999' : '#ffffff'} />
          </TouchableOpacity>

          <Text className="text-sm font-semibold" style={{ color: textColor }}>
            {currentHole + 1} of 18
          </Text>

          <TouchableOpacity
            onPress={() => setCurrentHole(Math.min(17, currentHole + 1))}
            disabled={currentHole === 17}
            className="px-4 py-2 rounded"
            style={{ backgroundColor: currentHole === 17 ? '#ccc' : '#2d7a4e' }}
          >
            <ChevronRight size={24} color={currentHole === 17 ? '#999' : '#ffffff'} />
          </TouchableOpacity>
        </View>

        {/* Finish Button */}
        <View className="px-4 py-4">
          <TouchableOpacity
            onPress={handleFinishRound}
            disabled={playedHoles.length === 0 || saving}
            className="rounded-lg py-4 items-center flex-row justify-center"
            style={{
              backgroundColor: playedHoles.length > 0 ? '#2d7a4e' : '#ccc',
            }}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Flag size={20} color="#ffffff" strokeWidth={2.5} />
                <Text className="text-white font-bold ml-2">
                  Finish Round ({playedHoles.length} holes)
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Score Input Modal */}
      <Modal visible={showScoreInput} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="rounded-t-2xl p-6" style={{ backgroundColor: bgColor }}>
            <Text
              className="text-lg font-bold mb-4"
              style={{ color: textColor }}
            >
              Enter Score for Hole {currentHoleData?.number}
            </Text>

            <View className="flex-row mb-4 space-x-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((score) => (
                <TouchableOpacity
                  key={score}
                  onPress={() => handleScoreInput(score.toString())}
                  className="flex-1 py-3 rounded border"
                  style={{
                    backgroundColor:
                      currentHoleData?.score === score ? '#2d7a4e' : cardBg,
                    borderColor: isDark ? '#343a40' : '#dee2e6',
                  }}
                >
                  <Text
                    className="text-center font-bold"
                    style={{
                      color:
                        currentHoleData?.score === score ? '#ffffff' : textColor,
                    }}
                  >
                    {score}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              ref={scoreInputRef}
              placeholder="Or type score (1-20)"
              placeholderTextColor={secondaryColor}
              keyboardType="number-pad"
              onSubmitEditing={(e) => handleScoreInput(e.nativeEvent.text)}
              className="rounded px-4 py-3 mb-4 text-center border"
              style={{
                backgroundColor: isDark ? '#2b3137' : '#f8f9fa',
                borderColor: isDark ? '#343a40' : '#dee2e6',
                color: textColor,
              }}
            />

            <TouchableOpacity
              onPress={() => setShowScoreInput(false)}
              className="py-3 items-center rounded"
              style={{ backgroundColor: '#2d7a4e' }}
            >
              <Text className="text-white font-semibold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
