import AsyncStorage from '@react-native-async-storage/async-storage';
import { tournamentsService } from '@/services/tournaments';

export interface ScorecardState {
  roundId: string;
  holes: Array<{
    number: number;
    score: number | null;
    par: number;
    yards: number;
    notes?: string;
  }>;
  currentHole: number;
  grossScore: number;
  netScore: number;
  front9Score: number;
  back9Score: number;
  isComplete: boolean;
  lastSyncedAt: string | null;
}

export interface SyncQueueItem {
  roundId: string;
  updates: Record<string, any>;
  timestamp: string;
  retryCount?: number;
}

const SCORECARD_KEY = (roundId: string) => `@scorecard:${roundId}`;
const SYNC_QUEUE_KEY = '@scorecard_sync_queue';
const LAST_SYNC_KEY = (roundId: string) => `@scorecard_last_sync:${roundId}`;

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
 * Load scorecard state from local storage
 */
export const loadScorecardFromStorage = async (
  roundId: string
): Promise<ScorecardState | null> => {
  try {
    const data = await AsyncStorage.getItem(SCORECARD_KEY(roundId));
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading scorecard:', error);
    return null;
  }
};

/**
 * Save scorecard state to local storage
 */
export const saveScorecardToStorage = async (
  scorecard: ScorecardState
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      SCORECARD_KEY(scorecard.roundId),
      JSON.stringify(scorecard)
    );
  } catch (error) {
    console.error('Error saving scorecard:', error);
  }
};

/**
 * Calculate gross score from holes
 */
export const calculateGrossScore = (
  holes: ScorecardState['holes']
): number => {
  return holes.reduce((sum, hole) => sum + (hole.score ?? 0), 0);
};

/**
 * Calculate front 9 score (holes 1-9)
 */
export const calculateFront9 = (holes: ScorecardState['holes']): number => {
  return holes
    .slice(0, 9)
    .reduce((sum, hole) => sum + (hole.score ?? 0), 0);
};

/**
 * Calculate back 9 score (holes 10-18)
 */
export const calculateBack9 = (holes: ScorecardState['holes']): number => {
  return holes
    .slice(9, 18)
    .reduce((sum, hole) => sum + (hole.score ?? 0), 0);
};

/**
 * Calculate net score given gross and handicap
 */
export const calculateNetScore = (
  grossScore: number,
  courseHandicap: number
): number => {
  return grossScore - courseHandicap;
};

/**
 * Queue a sync update for later
 */
export const queueSyncUpdate = async (item: SyncQueueItem): Promise<void> => {
  try {
    const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    const items: SyncQueueItem[] = queue ? JSON.parse(queue) : [];
    items.push(item);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error queueing sync:', error);
  }
};

/**
 * Get all pending sync updates
 */
export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  try {
    const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
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
 * Sync scorecard to server with retry logic
 */
export const syncScorecardToServer = async (
  roundId: string,
  updates: Record<string, any>
): Promise<boolean> => {
  try {
    await retryWithBackoff(async () => {
      const { data, error } = await tournamentsService.updateRound(
        roundId,
        updates
      );

      if (error) {
        throw new Error(`Sync error: ${error.message || 'Unknown error'}`);
      }

      return data;
    });

    // Record successful sync time
    await AsyncStorage.setItem(
      LAST_SYNC_KEY(roundId),
      new Date().toISOString()
    );

    return true;
  } catch (error) {
    console.error('Error syncing to server after retries:', error);
    return false;
  }
};

/**
 * Process all pending sync updates with retry tracking
 */
export const processSyncQueue = async (): Promise<void> => {
  try {
    const queue = await getSyncQueue();

    if (queue.length === 0) {
      return;
    }

    // Group updates by roundId, keeping track of retry counts
    const updatesByRound: Record<string, { updates: Record<string, any>; retryCount: number }> = {};

    for (const item of queue) {
      if (!updatesByRound[item.roundId]) {
        updatesByRound[item.roundId] = { updates: {}, retryCount: item.retryCount || 0 };
      }
      Object.assign(updatesByRound[item.roundId].updates, item.updates);
      updatesByRound[item.roundId].retryCount = Math.max(
        updatesByRound[item.roundId].retryCount,
        item.retryCount || 0
      );
    }

    const failedItems: SyncQueueItem[] = [];

    // Sync each round
    for (const [roundId, { updates, retryCount }] of Object.entries(updatesByRound)) {
      // Skip if max retries exceeded
      if (retryCount >= MAX_RETRY_ATTEMPTS) {
        console.warn(`Max retries exceeded for round ${roundId}, dropping from queue`);
        continue;
      }

      const success = await syncScorecardToServer(roundId, updates);
      if (!success) {
        // Re-queue with incremented retry count
        failedItems.push({
          roundId,
          updates,
          timestamp: new Date().toISOString(),
          retryCount: retryCount + 1,
        });
      }
    }

    // Update queue with failed items
    if (failedItems.length > 0) {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(failedItems));
    } else {
      await clearSyncQueue();
    }
  } catch (error) {
    console.error('Error processing sync queue:', error);
  }
};

/**
 * Get last sync timestamp for a round
 */
export const getLastSyncTime = async (roundId: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LAST_SYNC_KEY(roundId));
  } catch (error) {
    console.error('Error getting last sync time:', error);
    return null;
  }
};

/**
 * Clear all scorecard data (useful for testing)
 */
export const clearScorecardData = async (roundId: string): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      SCORECARD_KEY(roundId),
      LAST_SYNC_KEY(roundId),
    ]);
  } catch (error) {
    console.error('Error clearing scorecard data:', error);
  }
};
