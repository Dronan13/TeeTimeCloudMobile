import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersonalRoundState, RoundStatistics } from '@/types/personalRound';
import { golfRoundsService } from '@/services/golfRounds';

/**
 * Personal Round Sync - handles offline-first sync with AsyncStorage
 * Adapted from tournament scorecard sync patterns
 */

const STORAGE_PREFIX = '@personal_round';
const SYNC_QUEUE_KEY = '@personal_round_sync_queue';

/**
 * Save round state to AsyncStorage
 */
export const saveRoundToStorage = async (round: PersonalRoundState): Promise<void> => {
  try {
    const key = `${STORAGE_PREFIX}:${round.roundId}`;
    await AsyncStorage.setItem(key, JSON.stringify(round));
  } catch (error) {
    console.error('Error saving round to storage:', error);
  }
};

/**
 * Load round state from AsyncStorage
 */
export const loadRoundFromStorage = async (roundId: string): Promise<PersonalRoundState | null> => {
  try {
    const key = `${STORAGE_PREFIX}:${roundId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading round from storage:', error);
    return null;
  }
};

/**
 * Delete round from AsyncStorage
 */
export const deleteRoundFromStorage = async (roundId: string): Promise<void> => {
  try {
    const key = `${STORAGE_PREFIX}:${roundId}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error deleting round from storage:', error);
  }
};

/**
 * Queue item for sync
 */
export interface SyncQueueItem {
  roundId: string;
  timestamp: number;
  action: 'upsert' | 'delete';
  data?: any;
}

/**
 * Add item to sync queue
 */
export const queueSyncUpdate = async (item: SyncQueueItem): Promise<void> => {
  try {
    const queue = await getSyncQueue();
    queue.push(item);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error queuing sync update:', error);
  }
};

/**
 * Get current sync queue
 */
export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  try {
    const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
};

/**
 * Clear sync queue after successful sync
 */
export const clearSyncQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing sync queue:', error);
  }
};

/**
 * Process sync queue and send all pending updates to server
 */
export const processSyncQueue = async (): Promise<boolean> => {
  try {
    const queue = await getSyncQueue();

    if (queue.length === 0) {
      return true;
    }

    let allSuccessful = true;

    for (const item of queue) {
      try {
        if (item.action === 'upsert') {
          // Sync round holes
          if (item.data && item.data.holes) {
            for (const hole of item.data.holes) {
              await golfRoundsService.upsertGolfRoundHole(item.roundId, hole.number, hole);
            }
          }
          // Sync round stats
          if (item.data && item.data.statistics) {
            await golfRoundsService.updateGolfRound(item.roundId, {
              total_score: item.data.statistics.grossScore,
              front_score: item.data.statistics.front9Score,
              back_score: item.data.statistics.back9Score,
            });
          }
        } else if (item.action === 'delete') {
          await golfRoundsService.deleteGolfRound(item.roundId);
        }
      } catch (error) {
        console.error(`Error syncing item for round ${item.roundId}:`, error);
        allSuccessful = false;
      }
    }

    if (allSuccessful) {
      await clearSyncQueue();
    }

    return allSuccessful;
  } catch (error) {
    console.error('Error processing sync queue:', error);
    return false;
  }
};

/**
 * Stat calculation functions
 */

export const calculateGIR = (strokes: number, par: number): boolean => {
  return strokes <= par + 2;
};

export const calculateTotalGIR = (holes: any[]): number => {
  return holes.filter(
    (h) => h.strokes !== null && h.strokes !== undefined && calculateGIR(h.strokes, h.par)
  ).length;
};

export const calculateGrosScore = (holes: any[]): number => {
  return holes
    .filter((h) => h.strokes !== null && h.strokes !== undefined)
    .reduce((sum, h) => sum + h.strokes, 0);
};

export const calculateFront9 = (holes: any[]): number => {
  return holes
    .filter((h) => h.hole_number <= 9 && h.strokes !== null && h.strokes !== undefined)
    .reduce((sum, h) => sum + h.strokes, 0);
};

export const calculateBack9 = (holes: any[]): number => {
  return holes
    .filter((h) => h.hole_number > 9 && h.strokes !== null && h.strokes !== undefined)
    .reduce((sum, h) => sum + h.strokes, 0);
};

export const calculateNetScore = (grossScore: number, courseHandicap: number): number => {
  return grossScore - courseHandicap;
};

export const calculateTotalPar = (holes: any[]): number => {
  return holes
    .filter((h) => h.strokes !== null && h.strokes !== undefined)
    .reduce((sum, h) => sum + h.par, 0);
};

export const calculateScoreToPar = (grossScore: number, totalPar: number): number => {
  return grossScore - totalPar;
};

/**
 * Comprehensive statistics calculation
 */
export const calculateStatistics = (
  holes: any[],
  courseRating?: number,
  slopeRating?: number
): RoundStatistics => {
  // Filter only played holes
  const playedHoles = holes.filter((h) => h.strokes !== null && h.strokes !== undefined);

  if (playedHoles.length === 0) {
    return createEmptyStatistics();
  }

  // Basic scores
  const grossScore = calculateGrosScore(playedHoles);
  const front9Score = calculateFront9(playedHoles);
  const back9Score = calculateBack9(playedHoles);
  const totalPar = calculateTotalPar(playedHoles);
  const scoreToPar = calculateScoreToPar(grossScore, totalPar);

  // GIR
  const girCount = calculateTotalGIR(playedHoles);
  const girPercentage = (girCount / playedHoles.length) * 100;

  // Putts
  const totalPutts = playedHoles.reduce((sum, h) => sum + (h.putts || 0), 0);

  // Fairways (par 4s and 5s)
  const fairwayOpportunities = playedHoles.filter((h) => h.par >= 4);
  const fairwaysHit = fairwayOpportunities.filter((h) => h.fairway_hit === true).length;
  const fairwayPercentage =
    fairwayOpportunities.length > 0 ? (fairwaysHit / fairwayOpportunities.length) * 100 : 0;

  // Sand saves
  const sandOpportunities = playedHoles.filter((h) => h.sand_save !== null);
  const sandSaves = sandOpportunities.filter((h) => h.sand_save === true).length;
  const sandSavePercentage =
    sandOpportunities.length > 0 ? (sandSaves / sandOpportunities.length) * 100 : 0;

  // Differential (handicap differential calculation)
  let differential = 0;
  if (courseRating && slopeRating) {
    // Formula: (score - course_rating) * 113 / slope_rating
    differential = (grossScore - courseRating) * (113 / slopeRating);
  } else {
    // Fallback to score to par
    differential = scoreToPar;
  }

  return {
    grossScore,
    front9Score,
    back9Score,
    totalPar,
    scoreToPar,
    holesPlayed: playedHoles.length,
    girCount,
    girPercentage: Math.round(girPercentage * 100) / 100,
    totalPutts,
    fairwaysHit,
    fairwaysOpportunity: fairwayOpportunities.length,
    fairwayPercentage: Math.round(fairwayPercentage * 100) / 100,
    sandSaves,
    sandSaveOpportunity: sandOpportunities.length,
    sandSavePercentage: Math.round(sandSavePercentage * 100) / 100,
    differential: Math.round(differential * 100) / 100,
  };
};

/**
 * Create empty statistics object
 */
export const createEmptyStatistics = (): RoundStatistics => ({
  grossScore: 0,
  front9Score: 0,
  back9Score: 0,
  totalPar: 0,
  scoreToPar: 0,
  holesPlayed: 0,
  girCount: 0,
  girPercentage: 0,
  totalPutts: 0,
  fairwaysHit: 0,
  fairwaysOpportunity: 0,
  fairwayPercentage: 0,
  sandSaves: 0,
  sandSaveOpportunity: 0,
  sandSavePercentage: 0,
  differential: 0,
});
