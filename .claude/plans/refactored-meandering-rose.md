# Personal Round Management - Implementation Plan

## Overview
Create a complete personal golf round management system allowing golfers to:
- Start and track personal rounds (practice/casual play)
- Record hole-by-hole scores with detailed stats
- Maintain personal statistics and history
- Reuse UI components from tournament scorecard system

---

## Phase 1: Service Layer & Database Operations

### 1.1 Create Golf Rounds Service
**File**: `src/services/golfRounds.ts` (NEW)

**Operations to implement**:
- `createGolfRound(userId, courseId, teeBoxId, roundDate)` → golf_rounds (empty, no holes)
- `fetchGolfRounds(userId, limit?, offset?)` → paginated personal rounds
- `fetchGolfRound(roundId)` → single round with all holes (only played holes)
- `fetchGolfRoundHoles(roundId)` → golf_round_holes for a specific round
- `updateGolfRound(roundId, updates)` → update round-level stats (totals, completion status)
- `upsertGolfRoundHole(roundId, holeNumber, holeData)` → insert/update individual hole score
- `deleteGolfRoundHole(roundId, holeNumber)` → remove unplayed hole if user clears it
- `completeGolfRound(roundId, playedHoles)` → finalize round, calculate stats, cleanup empty holes
- `deleteGolfRound(roundId)` → soft or hard delete entire round
- `calculateRoundStatistics(holes)` → compute totals, differential, GIR%, fairway%, etc.

**Data handling**:
- Use `golf_round_details` view for fetching rounds with course/tee info
- Use `golf_round_holes_details` view for fetching hole details with course specs
- **Hole cleanup strategy**: Before completing round, delete any golf_round_holes entries where score is NULL (unplayed)
- Calculate all stats from actual played holes, not all 18
- Round object stores calculated: total_score, front_score, back_score, total_putts, fairways_hit, greens_in_regulation, differential

---

## Phase 2: State Management & Utilities

### 2.1 Create Personal Round Sync Utilities
**File**: `src/utils/personalRoundSync.ts` (NEW)

**Adapt from `scorecardSync.ts`**:
- Store personal round state in AsyncStorage with key: `@personal_round:{roundId}`
- Implement offline-first sync queue for personal rounds
- Reuse calculation functions (gross score, 9-hole splits)
- Add enhanced stat calculations:
  - `calculateGIR(strokes, par)` → per-hole GIR tracking
  - `calculateTotalGIR(holes)` → total GIR count
  - `calculateStatistics(holes)` → aggregated stats object

---

## Phase 3: UI Components (Reuse & Adapt)

### 3.1 Create Personal Round Screens
**New screens in**: `src/screens/rounds/`

#### a) `RoundsListScreen.tsx` (NEW)
- Display paginated history of personal rounds (20 per page)
- Virtual scrolling for performance
- Card per round showing:
  - Course name, date, score
  - Quick stats: gross score, par, vs par, GIR count
  - Tap to view detail

#### b) `NewRoundScreen.tsx` (NEW)
- Course selection with search/filter
- Tee box selection (color/gender/rating)
- Round date & start time picker
- Create round and navigate to scorecard

#### c) `PersonalScorecardScreen.tsx` (NEW - ACTIVE SCORECARD)
- **Two modes**: New round entry OR Edit existing round
- Adapted from `ScorecardScreen.tsx`
- Hole-by-hole score entry using existing `ScoreInput` component
- Display scorecard grid using existing `ScorecardGrid` component
- Enhanced stat display:
  - Per-hole: score, par, vs par, GIR status, putts
  - Running totals: gross (only played holes), 9-hole splits (where applicable), GIR count
- Auto-sync mechanism (reuse from tournament scorecard)
- **Finish Round button**:
  - Must have at least 1 hole with a score
  - Cleans up unplayed holes (score=NULL) before completion
  - Calculates final statistics
  - Sets is_complete=true on golf_rounds
  - Locks scorecard from further edits (unless reopened from RoundDetailScreen)
- **Skip/Bypass hole option**:
  - Allow player to skip holes (not enter a score)
  - These holes won't be saved to golf_round_holes table on completion

#### d) `RoundDetailScreen.tsx` (NEW - VIEW & EDIT)
- Display completed round with stats:
  - Full scorecard (read-only view initially)
  - Round summary: gross, net, differential
  - Stat breakdown: GIR %, putts total, fairways hit %, par distribution
  - Course/tee info and round metadata (date, time, duration)
- **Action buttons**:
  - "Edit Round" → navigates to PersonalScorecardScreen in edit mode
  - "Delete Round" → confirmation dialog, soft/hard delete round & associated holes
- **Stat display**:
  - Per-hole stats: score, par, vs par, putts, GIR status, fairway status
  - Aggregated stats: gross/front 9/back 9 totals, GIR count + %, putts total, fairways hit + %
  - Handicap differential calculation

---

## Phase 4: Navigation Integration

### 4.1 Update Navigation
**Files to modify**:
- `src/navigation/RootNavigator.tsx` (if exists) or main navigation file
- Add `RoundsStack` navigator containing:
  - RoundsListScreen (entry point)
  - NewRoundScreen
  - PersonalScorecardScreen
  - RoundDetailScreen
- Add tab/icon in home navigation to access rounds

### 4.2 Update HomeScreen
**File**: `src/screens/HomeScreen.tsx` (MODIFY)
- Add "Recent Rounds" or "Personal Rounds" section
- Show last 3 rounds with quick stats
- "View All" button navigates to RoundsListScreen

---

## Phase 5: Data Models & Types

### 5.1 Extend Types
**File**: `src/types/index.ts` (MODIFY)

Add exports:
```typescript
export type GolfRound = Tables<'golf_rounds'>;
export type GolfRoundHole = Tables<'golf_round_holes'>;
export type GolfRoundDetails = Tables<'golf_round_details'>;
export type GolfRoundHolesDetails = Tables<'golf_round_holes_details'>;
```

### 5.2 Create Personal Round Specific Types
**File**: `src/types/personalRound.ts` (NEW)

```typescript
interface PersonalRoundState {
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

interface PersonalHole {
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

interface RoundStatistics {
  grossScore: number; // sum of played holes only
  front9Score: number; // holes 1-9 (or available)
  back9Score: number; // holes 10-18 (or available)
  totalPar: number; // par sum of played holes
  scoreToPar: number; // gross - par
  holesPlayed: number; // actual holes with scores
  girCount: number;
  girPercentage: number;
  totalPutts: number;
  fairwaysHit: number;
  fairwaysOpportunity: number; // par 4s & 5s only
  fairwayPercentage: number;
  sandSaves: number; // count of holes where player was in sand but scored par or less
  sandSaveOpportunity: number; // count of holes where player was in sand (true or false sandSave)
  sandSavePercentage: number; // (sandSaves / sandSaveOpportunity) * 100
  differential: number; // (score - course_rating) * 113 / slope_rating
}
```

**Data Maintenance Notes for Partial Rounds**:
- `front9Score` and `back9Score` calculated only from holes actually in those 9s with scores
- `holesPlayed` tracks actual count (e.g., 9 for 9-hole round)
- `girPercentage` = (girCount / holesPlayed) * 100
- `fairwaysOpportunity` = count of par 4s & 5s in played holes
- Only golf_round_holes with actual scores are persisted to DB
- Unplayed holes (score=null) are never inserted, or deleted before round completion

---

## Phase 6: Styling & UX

### 6.1 Design Tokens
- Use existing NativeWind classes from tournament scorecard
- Color scheme for round history cards (consistent with app theme)
- Stat display hierarchy (primary metrics: score, par, vs par)

### 6.2 Accessibility
- Keyboard navigation for hole entry
- Text labels for all interactive elements
- Sufficient color contrast for stat indicators

---

## Implementation Order

1. **Services** (golfRounds.ts) - Foundation
2. **Utilities** (personalRoundSync.ts) - State & sync logic
3. **Navigation** - Add to app structure
4. **List Screen** (RoundsListScreen.tsx) - View history
5. **New Round Screen** (NewRoundScreen.tsx) - Start round
6. **Scorecard Screen** (PersonalScorecardScreen.tsx) - Score entry
7. **Detail Screen** (RoundDetailScreen.tsx) - Stats & review
8. **HomeScreen integration** - Show recent rounds
9. **Types** (types/personalRound.ts, index.ts) - Polish

---

## Key Decisions (USER CONFIRMED)

✅ **1. Stat Tracking Scope**: DETAILED STATS ENABLED
- ✅ Track putts per hole in scorecard entry (numeric input)
- ✅ Track fairways hit per hole (yes/no toggle)
- ✅ Track penalties per hole (numeric input: 0, 1, 2+)
- ✅ Calculate GIR (strokes vs par)
- ✅ Calculate differential for handicap tracking

**Scorecard entry fields per hole**:
- Score (required, number pad 1-18+)
- Putts (optional, number 0-10)
- Fairway (optional toggle: hit/miss for par 4s & 5s)
- Penalties (optional, number 0-3+)
- Notes (optional, text field)

**Stats calculated and displayed**:
- Per hole: score, par, vs par, GIR status, putts, fairway (if applicable), sand save status (if applicable)
- Round totals: gross score, front 9, back 9, total par, score to par
- Stat aggregates: GIR count & %, total putts, fairways hit & %, sand saves & %, differential

✅ **2. Round Editing & Deletion**: ENABLED
- ✅ Edit individual hole scores after completion
- ✅ Can delete rounds entirely
- ✅ View completed rounds with edit capability
- ❌ NO add/edit notes, weather, conditions (MVP scope)

✅ **3. Course Data Scope**: REGISTERED COURSES ONLY
- ✅ Use only courses already in system
- ❌ NO ad-hoc/custom course creation (phase 2 feature)

✅ **4. Round Completion Type**: FLEXIBLE PARTIAL ROUNDS
- ✅ Allow 9-hole, par-3, and partial rounds
- ✅ Manually finish with button click (not automatic on hole 18)
- ⚠️ **Data Maintenance Note**: Only save golf_round_holes for holes actually played
  - When creating round, don't pre-populate all 18 holes
  - Only insert golf_round_holes for holes entered
  - On round completion, set is_complete flag but preserve only played holes
  - Delete empty/unplayed holes from golf_round_holes table on cleanup

✅ **5. Navigation Placement**: DUAL APPROACH
- ✅ "View All Rounds" menu item on home screen
- ✅ "Recent Rounds" section on home screen (last 3-5 rounds with quick stats)
- Both direct to RoundsListScreen when tapped

---

## Files to Create
- `src/services/golfRounds.ts`
- `src/utils/personalRoundSync.ts`
- `src/types/personalRound.ts`
- `src/screens/rounds/RoundsListScreen.tsx`
- `src/screens/rounds/NewRoundScreen.tsx`
- `src/screens/rounds/PersonalScorecardScreen.tsx`
- `src/screens/rounds/RoundDetailScreen.tsx`

## Files to Modify
- `src/types/index.ts` - Add GolfRound*, GolfRoundHole* exports
- `src/screens/HomeScreen.tsx` - Add "View All Rounds" + "Recent Rounds" section
- Main navigation file - Add RoundsStack to navigation structure

---

## Critical Implementation Details

### Hole Entry & Skip Logic
1. When entering scorecard, show ALL 18 holes initially
2. User enters score for hole, or taps "Skip" to bypass
3. In memory, track which holes were played (score != null)
4. On round completion:
   - Delete any golf_round_holes with score=null
   - Only save holes with actual scores
   - Calculate statistics from played holes only

### Scorecard Edit Mode Flow
1. Open RoundDetailScreen for completed round
2. Tap "Edit Round" → navigates to PersonalScorecardScreen with `isEditing=true`
3. Pre-populate existing hole data from DB
4. Allow modification of any field (score, putts, fairway, penalties)
5. On save:
   - Upsert all modified holes
   - Delete holes that were cleared (score set to null)
   - Recalculate statistics
   - Sync to server
   - Return to RoundDetailScreen with updated stats

### Partial Round Statistics Calculation
```
For a 9-hole round (front 9 only):
- grossScore = sum(holes 1-9)
- totalPar = sum(pars 1-9)
- scoreToPar = grossScore - totalPar
- front9Score = grossScore
- back9Score = 0 (or undefined)
- girCount = count of GIRs from holes 1-9
- fairwaysHit = count of fairway hits from par 4s & 5s in 1-9
- differential = calculated from gross score for handicap
```

### Offline Sync Strategy
- Auto-save hole scores to AsyncStorage every 30 seconds
- Store personal round state with all holes entered
- On app reconnection, batch sync all unsynced holes
- Handle conflicts: server score takes precedence if user hasn't made edits locally

### Data Validation
- Score: 1-20 (prevent typos beyond reasonable range)
- Putts: 0-10
- Fairway: toggle yes/no (only for par 4s & 5s)
- Penalties: 0-5
- Course rating, slope rating validation from tee_box
- Par validation from course_holes

---

## Summary of User Experience Flow

**New Round**:
1. HomeScreen → "View All Rounds" or "New Round" button
2. NewRoundScreen: Select course → Select tee → Confirm
3. PersonalScorecardScreen: Enter hole-by-hole scores/stats
4. Skip optional holes, enter required scores
5. "Finish Round" button → Cleanup + completion
6. Redirect to RoundDetailScreen with stats

**View Round**:
1. HomeScreen recent rounds → Tap card
2. RoundsListScreen (full history) → Tap round
3. RoundDetailScreen: View all stats, delete option

**Edit Round**:
1. RoundDetailScreen → "Edit Round" button
2. PersonalScorecardScreen in edit mode → Modify scores/stats
3. "Save Changes" → Sync and return to detail

**Delete Round**:
1. RoundDetailScreen → "Delete Round" button
2. Confirmation dialog
3. Delete golf_rounds + golf_round_holes from DB
4. Return to RoundsListScreen
