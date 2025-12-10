/**
 * Personal Golf Round Management Types
 * Used for tracking personal rounds with detailed statistics
 */

export interface PersonalRoundState {
  roundId: string;
  courseId: string;
  teeBoxId: string;
  holes: PersonalHole[]; // ONLY played holes (score != null)
  roundDate: string;
  roundStartTime?: string;
  roundEndTime?: string;
  statistics: RoundStatistics;
  isComplete: boolean;
  isEditing?: boolean; // true when editing existing round
  lastSyncedAt: string | null;
}

export interface PersonalHole {
  number: number;
  score: number | null; // null = unplayed (won't be saved)
  par: number;
  yards: number;
  handicap?: number; // course hole handicap
  putts?: number | null;
  gir?: boolean;
  fairwayHit?: boolean | null; // null = not applicable (par 3)
  sandSave?: boolean | null; // null = never in sand; true = in sand but scored par or less; false = in sand and scored over par
  penalties?: number;
  notes?: string;
}

export interface RoundStatistics {
  grossScore: number; // sum of played holes only
  front9Score: number; // holes 1-9 (or available)
  back9Score: number; // holes 10-18 (or available)
  totalPar: number; // par sum of played holes
  scoreToPar: number; // gross - par
  holesPlayed: number; // actual holes with scores
  girCount: number;
  girPercentage: number;
  totalPutts: number;
  totalPenalties: number; // sum of all penalties
  fairwaysHit: number;
  fairwaysOpportunity: number; // par 4s & 5s only
  fairwayPercentage: number;
  sandSaves: number; // count of holes where player was in sand but scored par or less
  sandSaveOpportunity: number; // count of holes where player was in sand (true or false sandSave)
  sandSavePercentage: number; // (sandSaves / sandSaveOpportunity) * 100
  differential: number; // (score - course_rating) * 113 / slope_rating
}

/**
 * Hole Entry UI State
 * Used during scorecard entry for a single hole
 */
export interface HoleEntryState {
  holeNumber: number;
  score: number | null;
  par: number;
  yards: number;
  putts: number | null;
  fairwayHit: boolean | null; // null = not applicable (par 3)
  sandSave: boolean | null; // null = never in sand
  penalties: number;
  notes: string;
}

/**
 * Round Summary Card (for list views)
 */
export interface RoundCard {
  id: string;
  courseName: string;
  courseId: string;
  date: string;
  grossScore: number;
  par: number;
  scoreToPar: number;
  holesPlayed: number;
  girCount: number;
  isComplete: boolean;
  teeColor?: string;
}

/**
 * Navigation params for rounds screens
 */
export type RoundsStackParamList = {
  RoundsList: undefined;
  NewRound: undefined;
  Scorecard: { roundId: string; isEditing?: boolean };
  RoundDetail: { roundId: string };
};
