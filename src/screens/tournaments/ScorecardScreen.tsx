import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { ChevronLeft, ChevronRight, Wifi, WifiOff } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TournamentsStackParamList } from '@/types';
import { tournamentsService } from '@/services/tournaments';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import ScoreInput from '@/components/ScoreInput';
import ScorecardGrid from '@/components/ScorecardGrid';
import DisputeButton from '@/components/DisputeButton';
import {
  loadScorecardFromStorage,
  saveScorecardToStorage,
  ScorecardState,
  calculateGrossScore,
  calculateFront9,
  calculateBack9,
  calculateNetScore,
  syncScorecardToServer,
  queueSyncUpdate,
  processSyncQueue,
} from '@/utils/scorecardSync';

type Props = NativeStackScreenProps<TournamentsStackParamList, 'Scorecard'>;

export default function ScorecardScreen({ route, navigation }: Props) {
  const { roundId } = route.params;
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { isOnline } = useNetworkStatus();

  const [scorecard, setScorecard] = useState<ScorecardState | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [courseHandicap, setCourseHandicap] = useState(0);
  const [isDisputeFlagged, setIsDisputeFlagged] = useState(false);
  const [submitingDispute, setSubmittingDispute] = useState(false);

  // Load scorecard on mount
  useEffect(() => {
    loadScorecard();
  }, [roundId]);

  // Sync periodically when online
  useEffect(() => {
    if (isOnline && scorecard && !scorecard.isComplete) {
      const timer = setTimeout(() => {
        autoSync();
      }, 30000); // Auto-sync every 30 seconds

      return () => clearTimeout(timer);
    }
  }, [isOnline, scorecard]);

  const loadScorecard = async () => {
    try {
      setLoading(true);

      // Try loading from storage first
      let localScorecard = await loadScorecardFromStorage(roundId);

      if (!localScorecard) {
        // Load from server
        const { data: round, error } = await tournamentsService.fetchRound(roundId);

        if (error || !round) {
          Alert.alert(t('common.error'), t('errors.notFound'));
          navigation.goBack();
          return;
        }

        // Initialize scorecard from server data
        const holes = Array.from({ length: 18 }, (_, i) => ({
          number: i + 1,
          score: round[`hole_${i + 1}`] || null,
          par: round[`hole_${i + 1}_par`] || 4,
          yards: round[`hole_${i + 1}_yards`] || 0,
        }));

        localScorecard = {
          roundId,
          holes,
          currentHole: 1,
          grossScore: round.gross_score || 0,
          netScore: round.net_score || 0,
          front9Score: round.front_9_score || 0,
          back9Score: round.back_9_score || 0,
          isComplete: round.is_complete || false,
          lastSyncedAt: null,
        };

        setCourseHandicap(round.course_handicap || 0);
      }

      setScorecard(localScorecard);

      // Check if this round has a dispute flag
      const { data: hasDispute } = await tournamentsService.checkDisputeFlag(roundId);
      if (hasDispute) {
        setIsDisputeFlagged(true);
      }
    } catch (err) {
      Alert.alert(t('common.error'), t('errors.unknown'));
    } finally {
      setLoading(false);
    }
  };

  const handleDisputeSubmit = async (reason: string) => {
    try {
      setSubmittingDispute(true);
      const { data, error } = await tournamentsService.submitDisputeRequest(roundId, reason);

      if (error) throw error;

      setIsDisputeFlagged(true);
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleScoreChange = useCallback(
    async (score: number | null) => {
      if (!scorecard) return;

      const updatedHoles = scorecard.holes.map((hole) =>
        hole.number === scorecard.currentHole
          ? { ...hole, score }
          : hole
      );

      const grossScore = calculateGrossScore(updatedHoles);
      const front9Score = calculateFront9(updatedHoles);
      const back9Score = calculateBack9(updatedHoles);
      const netScore = calculateNetScore(grossScore, courseHandicap);

      // Check if all holes are filled
      const allFilled = updatedHoles.every((h) => h.score !== null);

      const updated: ScorecardState = {
        ...scorecard,
        holes: updatedHoles,
        grossScore,
        front9Score,
        back9Score,
        netScore,
        isComplete: allFilled,
      };

      setScorecard(updated);
      await saveScorecardToStorage(updated);

      // Auto-sync to server if online
      if (isOnline) {
        autoSync();
      } else {
        // Queue for later
        await queueSyncUpdate({
          roundId,
          updates: {
            [`hole_${scorecard.currentHole}`]: score,
            gross_score: grossScore,
            net_score: netScore,
            front_9_score: front9Score,
            back_9_score: back9Score,
            is_complete: allFilled,
            end_datetime: allFilled ? new Date().toISOString() : null,
          },
          timestamp: new Date().toISOString(),
        });
      }
    },
    [scorecard, isOnline, roundId, courseHandicap]
  );

  const autoSync = useCallback(async () => {
    if (!scorecard || syncing) return;

    setSyncing(true);
    try {
      const updates: Record<string, any> = {};

      scorecard.holes.forEach((hole) => {
        updates[`hole_${hole.number}`] = hole.score;
      });

      Object.assign(updates, {
        gross_score: scorecard.grossScore,
        net_score: scorecard.netScore,
        front_9_score: scorecard.front9Score,
        back_9_score: scorecard.back9Score,
        is_complete: scorecard.isComplete,
        end_datetime: scorecard.isComplete
          ? new Date().toISOString()
          : null,
      });

      const success = await syncScorecardToServer(roundId, updates);

      if (success) {
        setScorecard((prev) =>
          prev
            ? {
                ...prev,
                lastSyncedAt: new Date().toISOString(),
              }
            : null
        );
      }
    } finally {
      setSyncing(false);
    }
  }, [scorecard, roundId, syncing]);

  const handleFinishRound = () => {
    if (!scorecard) return;

    // Check all holes filled
    if (!scorecard.isComplete) {
      Alert.alert(t('common.error'), 'Please fill in all 18 holes');
      return;
    }

    Alert.alert(
      'Finish Round?',
      t('tournament.scorecard.finishConfirm'),
      [
        {
          text: t('common.cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Finish',
          onPress: async () => {
            await handleFinish();
          },
          style: 'default',
        },
      ]
    );
  };

  const handleFinish = async () => {
    if (!scorecard) return;

    try {
      setSyncing(true);

      const updates: Record<string, any> = {};
      scorecard.holes.forEach((hole) => {
        updates[`hole_${hole.number}`] = hole.score;
      });

      Object.assign(updates, {
        gross_score: scorecard.grossScore,
        net_score: scorecard.netScore,
        front_9_score: scorecard.front9Score,
        back_9_score: scorecard.back9Score,
        is_complete: true,
        end_datetime: new Date().toISOString(),
      });

      const success = await syncScorecardToServer(roundId, updates);

      if (success) {
        // Process any queued updates
        await processSyncQueue();

        Alert.alert('Success!', 'Round completed successfully', [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Leaderboard', {
                tournamentId: scorecard.roundId.split('-')[0], // Extract tournament ID
              });
            },
          },
        ]);
      }
    } catch (err) {
      Alert.alert(t('common.error'), t('errors.unknown'));
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, isDark && styles.centerContainerDark]}>
        <ActivityIndicator size="large" color="#2d7a4e" />
      </View>
    );
  }

  if (!scorecard) {
    return (
      <View style={[styles.centerContainer, isDark && styles.centerContainerDark]}>
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
          {t('errors.notFound')}
        </Text>
      </View>
    );
  }

  const currentHole = scorecard.holes.find(
    (h) => h.number === scorecard.currentHole
  );

  return (
    <SafeAreaView
      style={[styles.container, isDark && styles.containerDark]}
    >
      {/* Header with sync status */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            Hole {scorecard.currentHole} of 18
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              isDark && styles.headerSubtitleDark,
            ]}
          >
            Par {currentHole?.par} • {currentHole?.yards} yds
          </Text>
        </View>

        <View style={styles.syncStatus}>
          {syncing ? (
            <>
              <ActivityIndicator size="small" color="#2d7a4e" />
              <Text
                style={[
                  styles.syncText,
                  isDark && styles.syncTextDark,
                ]}
              >
                {t('tournament.scorecard.syncStatus.syncing')}
              </Text>
            </>
          ) : isOnline ? (
            <>
              <Wifi size={14} color="#10b981" />
              <Text
                style={[
                  styles.syncText,
                  isDark && styles.syncTextDark,
                ]}
              >
                {t('tournament.scorecard.syncStatus.synced')}
              </Text>
            </>
          ) : (
            <>
              <WifiOff size={14} color="#ef4444" />
              <Text
                style={[
                  styles.syncText,
                  isDark && styles.syncTextDark,
                ]}
              >
                {t('tournament.scorecard.syncStatus.offline')}
              </Text>
            </>
          )}
        </View>
      </View>

      <ScrollView
        style={[styles.scrollView, isDark && styles.scrollViewDark]}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Navigation */}
        <View style={styles.navigationRow}>
          <TouchableOpacity
            style={[
              styles.navButton,
              scorecard.currentHole <= 1 && styles.navButtonDisabled,
              isDark && styles.navButtonDark,
            ]}
            onPress={() => {
              if (scorecard.currentHole > 1) {
                setScorecard((prev) =>
                  prev ? { ...prev, currentHole: prev.currentHole - 1 } : null
                );
              }
            }}
            disabled={scorecard.currentHole <= 1}
          >
            <ChevronLeft size={20} color={isDark ? '#ffffff' : '#1a1d21'} />
            <Text
              style={[
                styles.navButtonText,
                isDark && styles.navButtonTextDark,
                scorecard.currentHole <= 1 && styles.navButtonTextDisabled,
              ]}
            >
              {t('tournament.scorecard.prevHole')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              scorecard.currentHole >= 18 && styles.navButtonDisabled,
              isDark && styles.navButtonDark,
            ]}
            onPress={() => {
              if (scorecard.currentHole < 18) {
                setScorecard((prev) =>
                  prev ? { ...prev, currentHole: prev.currentHole + 1 } : null
                );
              }
            }}
            disabled={scorecard.currentHole >= 18}
          >
            <Text
              style={[
                styles.navButtonText,
                isDark && styles.navButtonTextDark,
                scorecard.currentHole >= 18 && styles.navButtonTextDisabled,
              ]}
            >
              {t('tournament.scorecard.nextHole')}
            </Text>
            <ChevronRight size={20} color={isDark ? '#ffffff' : '#1a1d21'} />
          </TouchableOpacity>
        </View>
        {/* Score Input */}
        {currentHole && (
          <ScoreInput
            currentScore={currentHole.score}
            onScoreChange={handleScoreChange}
            holePar={currentHole.par}
          />
        )}

        {/* Scorecard Grid */}
        <ScorecardGrid
          holes={scorecard.holes}
          currentHole={scorecard.currentHole}
          onHoleSelect={(hole) => {
            setScorecard((prev) =>
              prev ? { ...prev, currentHole: hole } : null
            );
          }}
          front9Total={scorecard.front9Score}
          back9Total={scorecard.back9Score}
          totalScore={scorecard.grossScore}
        />

        {/* Dispute Button - Show after scorecard is complete */}
        {scorecard.isComplete && (
          <DisputeButton
            roundId={roundId}
            isDisputeFlagged={isDisputeFlagged}
            onDisputeSubmit={handleDisputeSubmit}
            loading={submitingDispute}
          />
        )}

        {/* Finish Button */}
        <TouchableOpacity
          style={[
            styles.finishButton,
            (!scorecard.isComplete || syncing) && styles.finishButtonDisabled,
          ]}
          onPress={handleFinishRound}
          disabled={!scorecard.isComplete || syncing}
        >
          <Text style={styles.finishButtonText}>
            {t('tournament.scorecard.finishRound')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDark: {
    backgroundColor: '#2b3137',
    borderBottomColor: '#495057',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1d21',
    marginBottom: 4,
  },
  headerTitleDark: {
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  headerSubtitleDark: {
    color: '#d1d5db',
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
  },
  syncText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  syncTextDark: {
    color: '#d1d5db',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewDark: {
    backgroundColor: '#1a1d21',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
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
  errorText: {
    fontSize: 16,
    color: '#dc2626',
  },
  errorTextDark: {
    color: '#fca5a5',
  },
  navigationRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  navButtonDark: {
    backgroundColor: '#2b3137',
    borderColor: '#495057',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1d21',
  },
  navButtonTextDark: {
    color: '#ffffff',
  },
  navButtonTextDisabled: {
    color: '#9ca3af',
  },
  finishButton: {
    backgroundColor: '#2d7a4e',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  finishButtonDisabled: {
    opacity: 0.5,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
