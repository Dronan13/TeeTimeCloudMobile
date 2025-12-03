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
}

const SCORECARD_KEY = (roundId: string) => `@scorecard:${roundId}`;
const SYNC_QUEUE_KEY = '@scorecard_sync_queue';
const LAST_SYNC_KEY = (roundId: string) => `@scorecard_last_sync:${roundId}`;

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
 * Sync scorecard to server
 */
export const syncScorecardToServer = async (
  roundId: string,
  updates: Record<string, any>
): Promise<boolean> => {
  try {
    const { data, error } = await tournamentsService.updateRound(
      roundId,
      updates
    );

    if (error) {
      console.error('Sync error:', error);
      return false;
    }

    // Record successful sync time
    await AsyncStorage.setItem(
      LAST_SYNC_KEY(roundId),
      new Date().toISOString()
    );

    return true;
  } catch (error) {
    console.error('Error syncing to server:', error);
    return false;
  }
};

/**
 * Process all pending sync updates
 */
export const processSyncQueue = async (): Promise<void> => {
  try {
    const queue = await getSyncQueue();

    if (queue.length === 0) {
      return;
    }

    // Group updates by roundId
    const updatesByRound: Record<string, Record<string, any>> = {};

    for (const item of queue) {
      if (!updatesByRound[item.roundId]) {
        updatesByRound[item.roundId] = {};
      }
      Object.assign(updatesByRound[item.roundId], item.updates);
    }

    // Sync each round
    let allSuccess = true;
    for (const [roundId, updates] of Object.entries(updatesByRound)) {
      const success = await syncScorecardToServer(roundId, updates);
      if (!success) {
        allSuccess = false;
      }
    }

    // Clear queue only if all syncs succeeded
    if (allSuccess) {
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
