import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersonalRoundState, RoundStatistics } from '@/types/personalRound';
import { golfRoundsService } from '@/services/golfRounds';

/**
 * Personal Round Sync - handles offline-first sync with AsyncStorage
 * Adapted from tournament scorecard sync patterns
 */

const STORAGE_PREFIX = '@personal_round';
const SYNC_QUEUE_KEY = '@personal_round_sync_queue';

const MAX_RETRY_ATTEMPTS = 3;
const BASE_DELAY_MS = 1000;

/**
 * Retry an async operation with exponential backoff
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRY_ATTEMPTS
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      const delay = BASE_DELAY_MS * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Hole data with database field names for API calls
 */
interface HoleData {
  hole_number: number;
  score: number | null;
  par: number;
  putts?: number | null;
  fairway_hit?: boolean | null;
  green_in_regulation?: boolean;
  sand_save?: boolean | null;
  penalties?: number;
  notes?: string;
}

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
  action: 'upsert_hole' | 'complete_round' | 'delete';
  holeNumber?: number;  // For hole updates
  data?: HoleData | RoundStatistics;
  startTime?: string;  // For round completion
  endTime?: string;    // For round completion
  retryCount?: number; // Track retry attempts
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
 * Queue a hole update for sync
 */
export const queueHoleUpdate = async (
  roundId: string,
  holeNumber: number,
  holeData: HoleData
): Promise<void> => {
  await queueSyncUpdate({
    roundId,
    timestamp: Date.now(),
    action: 'upsert_hole',
    holeNumber,
    data: holeData,
  });
};

/**
 * Queue round completion for sync
 */
export const queueRoundCompletion = async (
  roundId: string,
  statistics: RoundStatistics,
  startTime?: string,
  endTime?: string
): Promise<void> => {
  await queueSyncUpdate({
    roundId,
    timestamp: Date.now(),
    action: 'complete_round',
    data: statistics,
    startTime,
    endTime,
  });
};

/**
 * Get count of queued updates for a specific round
 */
export const getQueuedHoleCount = async (roundId: string): Promise<number> => {
  const queue = await getSyncQueue();
  return queue.filter((item) => item.roundId === roundId).length;
};

/**
 * Process sync queue and send all pending updates to server with retry logic
 */
export const processSyncQueue = async (): Promise<boolean> => {
  try {
    const queue = await getSyncQueue();

    if (queue.length === 0) {
      return true;
    }

    const failedItems: SyncQueueItem[] = [];

    // Process in order: holes first, then completions
    const holeUpdates = queue.filter((item) => item.action === 'upsert_hole');
    const completions = queue.filter((item) => item.action === 'complete_round');
    const deletions = queue.filter((item) => item.action === 'delete');

    // 1. Sync all hole updates with retry
    for (const item of holeUpdates) {
      const retryCount = item.retryCount || 0;

      // Skip if max retries exceeded
      if (retryCount >= MAX_RETRY_ATTEMPTS) {
        console.warn(`Max retries exceeded for hole ${item.holeNumber} in round ${item.roundId}, dropping from queue`);
        continue;
      }

      try {
        if (item.holeNumber && item.data) {
          await retryWithBackoff(async () => {
            await golfRoundsService.upsertGolfRoundHole(
              item.roundId,
              item.holeNumber!,
              item.data as HoleData
            );
          });
        }
      } catch (error) {
        console.error(`Error syncing hole ${item.holeNumber} for round ${item.roundId} after retries:`, error);
        failedItems.push({ ...item, retryCount: retryCount + 1 });
      }
    }

    // 2. Sync round completions with retry
    for (const item of completions) {
      const retryCount = item.retryCount || 0;

      // Skip if max retries exceeded
      if (retryCount >= MAX_RETRY_ATTEMPTS) {
        console.warn(`Max retries exceeded for completing round ${item.roundId}, dropping from queue`);
        continue;
      }

      try {
        if (item.data) {
          await retryWithBackoff(async () => {
            await golfRoundsService.completeGolfRound(
              item.roundId,
              item.data as RoundStatistics,
              item.startTime,
              item.endTime
            );
          });
        }
      } catch (error) {
        console.error(`Error completing round ${item.roundId} after retries:`, error);
        failedItems.push({ ...item, retryCount: retryCount + 1 });
      }
    }

    // 3. Process deletions with retry
    for (const item of deletions) {
      const retryCount = item.retryCount || 0;

      // Skip if max retries exceeded
      if (retryCount >= MAX_RETRY_ATTEMPTS) {
        console.warn(`Max retries exceeded for deleting round ${item.roundId}, dropping from queue`);
        continue;
      }

      try {
        await retryWithBackoff(async () => {
          await golfRoundsService.deleteGolfRound(item.roundId);
        });
      } catch (error) {
        console.error(`Error deleting round ${item.roundId} after retries:`, error);
        failedItems.push({ ...item, retryCount: retryCount + 1 });
      }
    }

    // Update queue with only failed items
    if (failedItems.length > 0) {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(failedItems));
      return false;
    } else {
      await clearSyncQueue();
      return true;
    }
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

export const calculateTotalGIR = (holes: HoleData[]): number => {
  return holes.filter(
    (h) => h.score !== null && h.score !== undefined && calculateGIR(h.score, h.par)
  ).length;
};

export const calculateGrosScore = (holes: HoleData[]): number => {
  return holes
    .filter((h) => h.score !== null && h.score !== undefined)
    .reduce((sum, h) => sum + h.score, 0);
};

export const calculateFront9 = (holes: HoleData[]): number => {
  return holes
    .filter((h) => h.hole_number <= 9 && h.score !== null && h.score !== undefined)
    .reduce((sum, h) => sum + h.score, 0);
};

export const calculateBack9 = (holes: HoleData[]): number => {
  return holes
    .filter((h) => h.hole_number > 9 && h.score !== null && h.score !== undefined)
    .reduce((sum, h) => sum + h.score, 0);
};

export const calculateNetScore = (grossScore: number, courseHandicap: number): number => {
  return grossScore - courseHandicap;
};

export const calculateTotalPar = (holes: HoleData[]): number => {
  return holes
    .filter((h) => h.score !== null && h.score !== undefined)
    .reduce((sum, h) => sum + h.par, 0);
};

export const calculateScoreToPar = (grossScore: number, totalPar: number): number => {
  return grossScore - totalPar;
};

/**
 * Comprehensive statistics calculation
 */
export const calculateStatistics = (
  holes: HoleData[],
  courseRating?: number,
  slopeRating?: number
): RoundStatistics => {
  // Filter only played holes
  const playedHoles = holes.filter((h) => h.score !== null && h.score !== undefined);
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

  // Penalties
  const totalPenalties = playedHoles.reduce((sum, h) => sum + (h.penalties || 0), 0);

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
    totalPenalties,
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
  totalPenalties: 0,
  fairwaysHit: 0,
  fairwaysOpportunity: 0,
  fairwayPercentage: 0,
  sandSaves: 0,
  sandSaveOpportunity: 0,
  sandSavePercentage: 0,
  differential: 0,
});
