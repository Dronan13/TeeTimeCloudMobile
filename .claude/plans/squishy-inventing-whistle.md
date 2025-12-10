# Tournament Management UX Plan - TeeTime Cloud Mobile

## Executive Summary

This plan outlines the complete UX architecture for tournament management in TeeTime Cloud Mobile, including:
- Tournament browsing (upcoming/past, with admin hide capability)
- Tournament group (flight/category) viewing
- Live scorecard entry during play (18 holes with offline support)
- Real-time leaderboard
- Multilingual support (English/Spanish)

## 1. Data Model Overview

### Core Tables

**tournaments**
- `id`, `name`, `slug`, `description`
- `format` (stroke_play, match_play, etc.)
- `status` (draft, active, completed)
- `start_at`, `end_at`, `timezone`
- `max_players`, `handicap_percent`
- `is_hidden` (admin hide flag)
- `course_id`, `organizer_id`
- `registration_open_at`, `registration_close_at`
- `metadata` (JSON for flexibility)

**tournament_groups** (flights/divisions)
- `id`, `name`, `tournament_id`
- `course_id`, `game_type` (foursome, twosome, three_ball)
- `max_players`, `starting_hole`, `total_holes`
- `is_closed`, `user_id` (organizer)

**tournament_rounds** (individual scorecards)
- `id`, `tournament_id`, `golf_round_group_id`, `user_id`
- `hole_1` through `hole_18` (scores)
- `hole_1_par` through `hole_18_par`
- `hole_1_yards` through `hole_18_yards`
- `gross_score`, `net_score`, `front_9_score`, `back_9_score`
- `course_handicap`, `handicap_index`, `tournament_handicap`
- `tee_box_id`, `tee_color`, `total_par`, `total_yards`
- `start_datetime`, `end_datetime`
- `is_complete`, `dispute_requested`

### Precomputed Views

**tournament_leaderboard_dense_rank**
- Player info: `first_name`, `last_name`, `avatar_url`
- Rankings: `place` (dense rank), `tear` (tier/flight)
- Scores: `gross_score`, `net_score`, `score_vs_par`
- Group context: `group_name`, `golf_round_group_id`

**v_tournament_rounds_full**
- Complete denormalized view with `t_*` (tournament), `tg_*` (group), `tr_*` (round) prefixes
- Single query to get full tournament context

**v_tournament_rounds_with_groups_preview**
- Lightweight list view with tournament + group + round basics
- Optimized for browse/list screens

### Data Relationships

```
Tournament (1) → (N) Tournament Groups (1) → (N) Tournament Rounds
     ↓                      ↓                            ↓
   Course              Course + User               User + Round Data
```

## 2. Screen Architecture

### Navigation Structure

**Dual Access Pattern** (Both implemented):

**Option A - Dedicated Tab**: Add new **Tournaments** tab to root-level tabs:

```
App Tabs
├── Home
├── Courses
├── TeeTimes
├── Tournaments (NEW) ← Full tournament browsing
├── RSSArticles
└── Profile

Tournaments Stack (NEW)
├── TournamentListScreen (root)
├── TournamentDetailScreen
├── TournamentGroupListScreen
├── TournamentRegistrationScreen
├── ScorecardScreen (live play)
└── LeaderboardScreen
```

**Option C - Home Screen Quick Access**: Add tournament section to HomeScreen:

```
HomeScreen Layout (Modified)
├── Weather Widget
├── Next Tee Time
├── My Tournaments (NEW SECTION) ← Quick access
│   ├── Active tournament card (if user registered)
│   ├── "Continue Round" button (if in-progress scorecard)
│   └── "Browse All Tournaments" link → Tournaments tab
├── Upcoming Tee Times
└── RSS Articles Preview
```

This dual approach provides:
- **Power users**: Full tournament browsing via dedicated tab
- **Casual users**: Quick access from Home to their active tournaments
- **Discoverability**: Tournament card on Home increases feature awareness

### 2.0 HomeScreen Integration (Modified Existing Screen)

**Purpose**: Add "My Tournaments" section for quick access to active tournaments

**New Section Layout** (inserted after "Next Tee Time" section):
```
┌─────────────────────────────────────┐
│ 🏆 My Tournaments                    │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Spring Championship 2025        │ │
│ │ Round 1 - Flight A              │ │
│ │ ━━━━━━━━━━░░░░░░░░ 9/18 holes  │ │
│ │ [Continue Round →]              │ │
│ └─────────────────────────────────┘ │
│ [Browse All Tournaments →]          │
└─────────────────────────────────────┘
```

**Data Fetching** (add to existing `loadHomeData()` function):
```typescript
// Service: tournamentsService.fetchUserActiveTournaments(userId)
supabase
  .from('v_tournament_rounds_with_groups_preview')
  .select('*')
  .eq('user_id', userId)
  .eq('is_complete', false)
  .order('tournament_start_at', { ascending: true })
  .limit(1)  // Show only next active tournament
```

**Components**:
- `MyTournamentCard`: Compact card showing tournament name, round progress
- Progress bar showing holes completed
- Conditional rendering: Only show if user has active tournament round

**Interactions**:
- Tap card or "Continue Round" → Navigate to ScorecardScreen with `roundId`
- "Browse All Tournaments" → Navigate to Tournaments tab

**File to Modify**: `/src/screens/HomeScreen.tsx`

---

### 2.1 TournamentListScreen

**Purpose**: Browse all tournaments (upcoming/past), filter by status

**Layout**:
```
┌─────────────────────────────────────┐
│ Tournaments              [Filter ▼] │
├─────────────────────────────────────┤
│ 📅 Upcoming                          │
│ ┌─────────────────────────────────┐ │
│ │ Spring Championship 2025        │ │
│ │ Mar 15-16 • Pebble Beach       │ │
│ │ 24/48 players • Stroke Play    │ │
│ │ [Register] [View Details →]    │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Club Monthly Medal              │ │
│ │ Apr 5 • Pine Valley            │ │
│ │ 12/32 players • Medal Play     │ │
│ │ [Registered ✓] [View Details]  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 📁 Past Tournaments                 │
│ ┌─────────────────────────────────┐ │
│ │ Winter Classic 2025             │ │
│ │ Jan 20 • Augusta Hills         │ │
│ │ Completed • 48 players         │ │
│ │ [View Results →]               │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Components**:
- `TournamentCard`: Reusable card with tournament metadata
- `FilterButton`: Status filter (All, Upcoming, Active, Completed)
- Empty state: "No tournaments available" with illustration

**Data Fetching**:
```typescript
// Service: tournamentsService.fetchTournaments()
supabase
  .from('tournaments')
  .select(`
    id, name, slug, description, format, status,
    start_at, end_at, max_players, is_hidden,
    courses(name),
    tournament_groups(count)
  `)
  .eq('is_hidden', false)  // Hide admin-hidden tournaments
  .order('start_at', { ascending: false })
```

**State**:
- `tournaments: Tournament[]`
- `loading: boolean`
- `filter: 'all' | 'upcoming' | 'active' | 'completed'`
- `refreshing: boolean` (pull-to-refresh)

**Interactions**:
- Pull to refresh
- Tap card → navigate to TournamentDetailScreen
- Filter dropdown → update filter state
- "Register" button → TournamentRegistrationScreen

**Accessibility**:
- Semantic headers for "Upcoming" and "Past"
- Screen reader labels for status badges
- Focusable card elements with clear action labels

### 2.2 TournamentDetailScreen

**Purpose**: View complete tournament information, groups/flights, registration, leaderboard access

**Layout**:
```
┌─────────────────────────────────────┐
│ ← Spring Championship 2025          │
├─────────────────────────────────────┤
│ [Hero Image/Course Photo]          │
│                                     │
│ 📅 March 15-16, 2025               │
│ 📍 Pebble Beach Golf Links         │
│ 🏌️ Stroke Play • 48 max players   │
│                                     │
│ ─── Description ───                │
│ Two-day championship featuring...  │
│                                     │
│ ─── Tournament Details ───         │
│ • Format: Stroke Play              │
│ • Handicap: 100% allowance        │
│ • Registration: Open until Mar 10  │
│                                     │
│ ─── Groups & Flights ───           │
│ ┌─────────────────────────────────┐│
│ │ Championship Flight             ││
│ │ 16 players • Starts Hole 1      ││
│ │ [View Details →]               ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ Flight A                        ││
│ │ 16 players • Starts Hole 10     ││
│ │ [View Details →]               ││
│ └─────────────────────────────────┘│
│                                     │
│ ─── Leaderboard ───                │
│ [View Live Leaderboard →]         │
│                                     │
│ [Bottom Action Button]             │
│ [Register for Tournament]          │
└─────────────────────────────────────┘
```

**Components**:
- Tournament header with metadata badges
- Collapsible description section
- `TournamentGroupCard` list (flights)
- Conditional rendering:
  - Pre-registration: "Register" button
  - Registered: "Start Round" or "View My Scorecard"
  - Completed: "View Results"

**Data Fetching**:
```typescript
// Service: tournamentsService.fetchTournamentDetail(tournamentId)
supabase
  .from('v_tournament_rounds_full')
  .select('*')
  .eq('t_id', tournamentId)
  .single()

// Groups for this tournament
supabase
  .from('tournament_groups')
  .select(`
    id, name, game_type, max_players,
    starting_hole, is_closed,
    tournament_rounds(count)
  `)
  .eq('tournament_id', tournamentId)
```

**State**:
- `tournament: Tournament | null`
- `groups: TournamentGroup[]`
- `userRegistered: boolean`
- `userRound: TournamentRound | null`

**Interactions**:
- Tap group card → TournamentGroupListScreen
- "Register" → TournamentRegistrationScreen
- "View Leaderboard" → LeaderboardScreen
- "Start Round" / "View Scorecard" → ScorecardScreen

### 2.3 TournamentGroupListScreen

**Purpose**: View all players in a flight/group

**Layout**:
```
┌─────────────────────────────────────┐
│ ← Championship Flight                │
├─────────────────────────────────────┤
│ 🏌️ Foursome • Hole 1 Start         │
│ 16/16 players • Closed             │
│                                     │
│ ─── Players ───                    │
│ ┌─────────────────────────────────┐│
│ │ [Avatar] John Smith             ││
│ │ Handicap: 5.4                  ││
│ │ Status: Round in progress      ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ [Avatar] Maria Garcia           ││
│ │ Handicap: 12.2                 ││
│ │ Status: Not started            ││
│ └─────────────────────────────────┘│
│ ...                                │
└─────────────────────────────────────┘
```

**Data Fetching**:
```typescript
supabase
  .from('tournament_rounds')
  .select(`
    id, user_id, is_complete, gross_score, net_score,
    golfer_profiles(first_name, last_name, avatar_url, handicap_index)
  `)
  .eq('golf_round_group_id', groupId)
  .order('net_score', { ascending: true, nullsFirst: false })
```

### 2.4 TournamentRegistrationScreen

**Purpose**: Register user for tournament, select flight/group

**Layout**:
```
┌─────────────────────────────────────┐
│ ← Register for Tournament            │
├─────────────────────────────────────┤
│ Spring Championship 2025            │
│ March 15-16, 2025                  │
│                                     │
│ ─── Your Information ───           │
│ Name: John Smith                   │
│ Current Handicap: 8.4              │
│ Email: john@example.com            │
│                                     │
│ ─── Select Flight ───              │
│ ○ Championship (Handicap 0-9)      │
│ ● Flight A (Handicap 10-18)       │
│ ○ Flight B (Handicap 19-27)       │
│                                     │
│ ─── Preferences ───                │
│ Preferred Tee Time:                │
│ [Morning ▼]                        │
│                                     │
│ Cart Required: [Toggle]            │
│                                     │
│ ─── Agreement ───                  │
│ ☑ I agree to tournament rules      │
│                                     │
│ [Confirm Registration]             │
└─────────────────────────────────────┘
```

**Validation Rules**:
- User must have valid handicap index
- Selected flight must not be closed
- Tournament registration must be open (check `registration_open_at` and `registration_close_at`)
- User cannot register twice for same tournament

**Data Mutation**:
```typescript
// Create tournament_rounds entry
supabase
  .from('tournament_rounds')
  .insert({
    tournament_id,
    golf_round_group_id,
    user_id,
    handicap_index: userProfile.handicap_index,
    is_complete: false,
    // Holes initialized to null
  })
```

### 2.5 ScorecardScreen (Live Play)

**Purpose**: Enter scores hole-by-hole during tournament round

**Layout - Hole Entry View**:
```
┌─────────────────────────────────────┐
│ ← Spring Championship • Round 1     │
├─────────────────────────────────────┤
│ Hole 5    Par 4    392 yards       │
│                                     │
│ ┌─────────────────────────────────┐│
│ │         ENTER SCORE             ││
│ │                                 ││
│ │   [1] [2] [3] [4] [5]          ││
│ │   [6] [7] [8] [9] [X]          ││
│ │                                 ││
│ └─────────────────────────────────┘│
│                                     │
│ Notes (optional):                  │
│ [                              ]   │
│                                     │
│ ─── Score Summary ───              │
│ Front 9: 38 (+2) | Back 9: --     │
│ Total: 38 (+2)                     │
│                                     │
│ [← Prev Hole]    [Next Hole →]    │
│                                     │
│ ─── Scorecard ───                  │
│ 1  2  3  4  5  6  7  8  9    OUT  │
│ 4  3  5  4  -  4  3  5  4    32   │
│ Par: 4 3 5 4 4 4 3 5 4      36    │
│                                     │
│ [Finish Round]                     │
└─────────────────────────────────────┘
```

**Components**:
- `HoleHeader`: Hole number, par, yardage
- `ScoreInput`: Number pad (1-9, X for 10+)
- `ScoreCard`: Horizontal scrollable scorecard grid
- `ScoreSummary`: Live calculation of totals
- `NotesInput`: Optional hole notes

**State (Local + Synced)**:
```typescript
interface ScorecardState {
  roundId: string;
  holes: Array<{
    number: 1-18;
    score: number | null;
    par: number;
    yards: number;
    notes?: string;
  }>;
  currentHole: number;
  grossScore: number;
  netScore: number;
  isComplete: boolean;
  lastSyncedAt: Date | null;
}
```

**Data Flow**:
1. **Load**: Fetch existing `tournament_rounds` record or create new
2. **Start**: Set `start_datetime` when first hole is scored (automatic)
3. **Input**: User enters score → update local state → save to AsyncStorage
4. **Sync**: When online, batch update to Supabase
5. **Complete**: Mark `is_complete = true`, set `end_datetime` when all 18 holes entered
6. **Pace of Play**: Calculate duration automatically: `end_datetime - start_datetime` (in minutes)

**Offline Strategy**:
- Store scorecard state in AsyncStorage with key `@scorecard:${roundId}`
- Queue mutations in `@scorecard_sync_queue`
- On network restore, sync queued updates
- Show sync status indicator: "Synced" / "Offline - will sync" / "Syncing..."

**Calculations**:
```typescript
grossScore = sum(hole_1...hole_18)
netScore = grossScore - course_handicap
front_9_score = sum(hole_1...hole_9)
back_9_score = sum(hole_10...hole_18)
score_vs_par = grossScore - total_par
```

**Data Mutation (Batch Update)**:
```typescript
supabase
  .from('tournament_rounds')
  .update({
    hole_1: scores[0],
    hole_2: scores[1],
    // ... all 18 holes
    gross_score: calculateGross(),
    net_score: calculateNet(),
    front_9_score: calculateFront9(),
    back_9_score: calculateBack9(),
    is_complete: allHolesEntered,
    end_datetime: allHolesEntered ? new Date().toISOString() : null,
  })
  .eq('id', roundId)
```

**Interactions**:
- Swipe left/right between holes
- Tap scorecard row → jump to specific hole
- "Finish Round" → confirm dialog → mark complete → navigate to Leaderboard
- Auto-save on every score entry (debounced)

**Accessibility**:
- Large touch targets for score buttons (48x48dp minimum)
- Screen reader announces current hole, par, and entered score
- Haptic feedback on score entry
- Color indicators for under/over par (green/red) with shape indicators (✓/△)

### 2.6 LeaderboardScreen

**Purpose**: View live tournament standings

**Layout**:
```
┌─────────────────────────────────────┐
│ ← Spring Championship Leaderboard    │
├─────────────────────────────────────┤
│ [All Flights ▼] [Net Score ▼]      │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 1  [Avatar] John Smith          ││
│ │    -4 (68) • Thru 18            ││
│ │    Championship Flight          ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ 2  [Avatar] Mike Johnson        ││
│ │    -3 (69) • Thru 18            ││
│ │    Championship Flight          ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ 3  [Avatar] Sarah Lee           ││
│ │    -2 (70) • Thru 15            ││
│ │    Flight A                     ││
│ └─────────────────────────────────┘│
│ ...                                │
│                                     │
│ ─── Your Position ───              │
│ 12  You • +2 (74) • Thru 9        │
└─────────────────────────────────────┘
```

**Components**:
- `LeaderboardFilters`: Flight filter, score type (gross/net)
- `LeaderboardCard`: Player rank, name, score, progress
- `UserHighlight`: Sticky/highlighted row for current user

**Data Fetching**:
```typescript
supabase
  .from('tournament_leaderboard_dense_rank')
  .select('*')
  .eq('tournament_id', tournamentId)
  .order('place', { ascending: true })
```

**Real-Time Updates** (optional):
```typescript
supabase
  .channel(`tournament:${tournamentId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'tournament_rounds',
    filter: `tournament_id=eq.${tournamentId}`,
  }, () => {
    refetchLeaderboard();
  })
  .subscribe();
```

**Interactions**:
- Pull to refresh
- Filter by flight
- Toggle gross/net scoring
- Tap player → view their scorecard (read-only)

## 3. Service Layer

**File**: `/src/services/tournaments.ts`

```typescript
import { supabase } from '@/lib/supabaseClient';
import { ApiResponse } from '@/types';
import { Tables } from '@/types/supabase';

export type Tournament = Tables<'tournaments'>;
export type TournamentGroup = Tables<'tournament_groups'>;
export type TournamentRound = Tables<'tournament_rounds'>;
export type TournamentLeaderboard = Tables<'tournament_leaderboard_dense_rank'>;

export const tournamentsService = {
  async fetchTournaments(includeHidden = false): Promise<ApiResponse<Tournament[]>> {
    try {
      let query = supabase
        .from('tournaments')
        .select('*')
        .order('start_at', { ascending: false });

      if (!includeHidden) {
        query = query.eq('is_hidden', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      return { data: null, error: error as Error };
    }
  },

  async fetchTournamentDetail(tournamentId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('v_tournament_rounds_full')
        .select('*')
        .eq('t_id', tournamentId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async fetchTournamentGroups(tournamentId: string): Promise<ApiResponse<TournamentGroup[]>> {
    try {
      const { data, error } = await supabase
        .from('tournament_groups')
        .select('*')
        .eq('tournament_id', tournamentId);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async fetchLeaderboard(tournamentId: string): Promise<ApiResponse<TournamentLeaderboard[]>> {
    try {
      const { data, error } = await supabase
        .from('tournament_leaderboard_dense_rank')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('place', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async fetchUserRound(tournamentId: string, userId: string): Promise<ApiResponse<TournamentRound>> {
    try {
      const { data, error } = await supabase
        .from('tournament_rounds')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async createRound(roundData: Partial<TournamentRound>): Promise<ApiResponse<TournamentRound>> {
    try {
      const { data, error } = await supabase
        .from('tournament_rounds')
        .insert(roundData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async updateRound(roundId: string, updates: Partial<TournamentRound>): Promise<ApiResponse<TournamentRound>> {
    try {
      const { data, error } = await supabase
        .from('tournament_rounds')
        .update(updates)
        .eq('id', roundId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },
};
```

## 4. Offline Sync Strategy

### Approach

**Local-First Scorecard Entry**:
1. All score inputs save immediately to AsyncStorage
2. Queue updates for server sync
3. Sync on network restore
4. Handle conflicts with "last write wins" strategy

### Implementation

**Storage Keys**:
- `@scorecard:${roundId}` → Current scorecard state
- `@scorecard_sync_queue` → Array of pending mutations
- `@scorecard_last_sync:${roundId}` → Last successful sync timestamp

**Sync Logic**:
```typescript
// utils/scorecardSync.ts
export const syncScorecard = async (roundId: string) => {
  const localState = await storage.getItem(`@scorecard:${roundId}`);
  if (!localState) return;

  const scorecard = JSON.parse(localState);

  const { error } = await supabase
    .from('tournament_rounds')
    .update({
      hole_1: scorecard.holes[0].score,
      // ... all 18 holes
      gross_score: scorecard.grossScore,
      net_score: scorecard.netScore,
      is_complete: scorecard.isComplete,
    })
    .eq('id', roundId);

  if (!error) {
    await storage.setItem(`@scorecard_last_sync:${roundId}`, new Date().toISOString());
  }
};
```

**Network Monitoring**:
```typescript
// hooks/useNetworkStatus.ts
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    return unsubscribe;
  }, []);

  return { isOnline };
};
```

**Auto-Sync on Restore**:
```typescript
// In ScorecardScreen
const { isOnline } = useNetworkStatus();

useEffect(() => {
  if (isOnline) {
    syncScorecard(roundId);
  }
}, [isOnline]);
```

### Conflict Resolution

- **Strategy**: Last write wins (tournament rounds rarely edited concurrently)
- **Validation**: Server validates `is_complete` cannot be reverted to false
- **Dispute Flow**: If scores contested, set `dispute_requested = true` for admin review

## 5. Internationalization (i18n)

### Translation Keys

**File**: `/src/locales/en.json` and `/src/locales/es.json`

```json
{
  "tournament": {
    "title": "Tournaments",
    "upcoming": "Upcoming",
    "past": "Past Tournaments",
    "details": "Tournament Details",
    "register": "Register",
    "registered": "Registered",
    "viewDetails": "View Details",
    "viewResults": "View Results",

    "list": {
      "emptyUpcoming": "No upcoming tournaments",
      "emptyPast": "No past tournaments",
      "playersCount": "{{count}} / {{max}} players"
    },

    "detail": {
      "description": "Description",
      "format": "Format",
      "handicapAllowance": "Handicap Allowance",
      "registrationOpen": "Registration Open Until",
      "groupsFlights": "Groups & Flights",
      "leaderboard": "Leaderboard"
    },

    "registration": {
      "title": "Register for Tournament",
      "yourInfo": "Your Information",
      "selectFlight": "Select Flight",
      "preferences": "Preferences",
      "agreement": "Agreement",
      "agreeToRules": "I agree to tournament rules",
      "confirmButton": "Confirm Registration",
      "successTitle": "Registration Successful",
      "successMessage": "You're registered for {{tournamentName}}"
    },

    "scorecard": {
      "title": "Scorecard",
      "enterScore": "Enter Score",
      "notes": "Notes (optional)",
      "summary": "Score Summary",
      "front9": "Front 9",
      "back9": "Back 9",
      "total": "Total",
      "prevHole": "Previous Hole",
      "nextHole": "Next Hole",
      "finishRound": "Finish Round",
      "finishConfirm": "Are you sure you want to finish this round? You cannot edit scores after completion.",
      "syncStatus": {
        "synced": "Synced",
        "offline": "Offline - will sync when online",
        "syncing": "Syncing..."
      }
    },

    "leaderboard": {
      "title": "Leaderboard",
      "allFlights": "All Flights",
      "grossScore": "Gross Score",
      "netScore": "Net Score",
      "yourPosition": "Your Position",
      "thru": "Thru {{holes}}"
    },

    "format": {
      "strokePlay": "Stroke Play",
      "matchPlay": "Match Play",
      "stableford": "Stableford"
    },

    "status": {
      "draft": "Draft",
      "active": "Active",
      "completed": "Completed",
      "cancelled": "Cancelled"
    }
  }
}
```

### Spanish Translations

```json
{
  "tournament": {
    "title": "Torneos",
    "upcoming": "Próximos",
    "past": "Torneos Pasados",
    "register": "Registrarse",
    "registered": "Registrado",
    "viewDetails": "Ver Detalles",
    "viewResults": "Ver Resultados",

    "scorecard": {
      "title": "Tarjeta de Puntuación",
      "enterScore": "Ingresar Puntuación",
      "finishRound": "Terminar Ronda"
    },

    "leaderboard": {
      "title": "Tabla de Posiciones",
      "yourPosition": "Tu Posición"
    }
  }
}
```

## 6. Validation Rules

### Tournament Registration
- ✓ User must have valid `handicap_index` in profile
- ✓ Tournament must have `status = 'active'` or `status = 'registration_open'`
- ✓ Current date must be between `registration_open_at` and `registration_close_at`
- ✓ Selected group must not have `is_closed = true`
- ✓ Group must not be at `max_players` capacity
- ✓ User cannot have existing `tournament_rounds` record for this tournament

### Scorecard Entry
- ✓ Score must be numeric, 1-15 (max)
- ✓ Cannot edit scorecard after `is_complete = true` (unless admin)
- ✓ All 18 holes must have scores before marking complete
- ✓ `gross_score` must equal sum of all hole scores
- ✓ `net_score` must equal `gross_score - course_handicap`

### Admin Actions (Hide Tournament)
- ✓ Only users with admin role can set `is_hidden = true`
- ✓ Hidden tournaments not shown in public list, but accessible via direct link

## 7. Accessibility Checklist

### Visual
- [ ] Color contrast ratio ≥ 4.5:1 for all text
- [ ] Score indicators use shape + color (not color alone)
- [ ] Under par: Green + ✓ checkmark
- [ ] Over par: Red + △ triangle
- [ ] Par: Gray + ─ dash
- [ ] Large touch targets (≥48x48dp) for score buttons
- [ ] Clear focus indicators on all interactive elements

### Screen Reader
- [ ] Semantic headings (`<Text accessibilityRole="header">`)
- [ ] Descriptive labels for all buttons
- [ ] Score input announces "Hole 5, Par 4, enter score"
- [ ] Live region for sync status updates
- [ ] Leaderboard announces "Position 1, John Smith, 4 under par"

### Keyboard Navigation (External Keyboard Support)
- [ ] Tab order follows visual flow
- [ ] Enter/Space activates buttons
- [ ] Arrow keys navigate scorecard holes

### Motion
- [ ] Respect `prefers-reduced-motion` for animations
- [ ] Provide alternative to swipe gestures (prev/next buttons)

## 8. Example Supabase Queries

### Fetch Tournament with Registered Status
```typescript
const { data } = await supabase
  .from('tournaments')
  .select(`
    *,
    courses(name, city),
    tournament_groups(id, name, max_players, is_closed),
    tournament_rounds!inner(user_id)
  `)
  .eq('id', tournamentId)
  .eq('tournament_rounds.user_id', currentUserId)
  .single();
```

### Paginated Leaderboard
```typescript
const { data, count } = await supabase
  .from('tournament_leaderboard_dense_rank')
  .select('*', { count: 'exact' })
  .eq('tournament_id', tournamentId)
  .range(page * 20, (page + 1) * 20 - 1)
  .order('place', { ascending: true });
```

### User's Active Tournaments
```typescript
const { data } = await supabase
  .from('v_tournament_rounds_with_groups_preview')
  .select('*')
  .eq('user_id', currentUserId)
  .eq('is_complete', false)
  .order('tournament_start_at', { ascending: true });
```

## 9. Critical Files to Create/Modify

### New Files
- `/src/screens/tournaments/TournamentListScreen.tsx`
- `/src/screens/tournaments/TournamentDetailScreen.tsx`
- `/src/screens/tournaments/TournamentGroupListScreen.tsx`
- `/src/screens/tournaments/TournamentRegistrationScreen.tsx`
- `/src/screens/tournaments/ScorecardScreen.tsx`
- `/src/screens/tournaments/LeaderboardScreen.tsx`
- `/src/services/tournaments.ts`
- `/src/utils/scorecardSync.ts`
- `/src/hooks/useNetworkStatus.ts`
- `/src/components/TournamentCard.tsx`
- `/src/components/TournamentGroupCard.tsx`
- `/src/components/ScoreInput.tsx`
- `/src/components/ScorecardGrid.tsx`
- `/src/components/LeaderboardCard.tsx`

### Modified Files
- `/src/navigation/AppTabs.tsx` (add Tournaments tab/stack)
- `/src/screens/HomeScreen.tsx` (add My Tournaments section)
- `/src/types/index.ts` (export tournament types)
- `/src/locales/en.json` (add tournament translations)
- `/src/locales/es.json` (add Spanish tournament translations)
- `package.json` (add `@react-native-community/netinfo` dependency)

## 12. Special Flows

### Dispute Resolution Flow

When a player believes their score is incorrect or contested:

1. **User Action**: In completed scorecard view, show "Request Dispute" button
2. **Flag Set**: Update `tournament_rounds.dispute_requested = true`
3. **Visual Indicator**: Scorecard shows "⚠️ Dispute Pending" badge
4. **Admin Resolution**: Admin reviews offline via separate system
5. **Admin Action**: Admin either:
   - Corrects score and sets `dispute_requested = false`
   - Rejects dispute and sets `dispute_requested = false`

**UI Changes**:
- Add "Request Dispute" button to completed scorecard view
- Show dispute status badge on leaderboard entries with pending disputes
- Disable "Request Dispute" if already flagged

**Translation Keys**:
```json
"tournament.scorecard.dispute": {
  "requestButton": "Request Dispute",
  "pending": "Dispute Pending",
  "confirmTitle": "Request Dispute?",
  "confirmMessage": "An administrator will review your scorecard. This cannot be undone.",
  "successMessage": "Dispute requested successfully"
}
```

### Multi-Round Tournament Example

**Scenario**: Spring Championship with 2 rounds per player

**Database Structure**:
```
Tournament: "Spring Championship 2025"
├── Tournament Group: "Round 1 - Championship Flight"
│   └── Tournament Rounds (one per player, 18 holes each)
├── Tournament Group: "Round 1 - Flight A"
│   └── Tournament Rounds (one per player)
├── Tournament Group: "Round 2 - Championship Flight"
│   └── Tournament Rounds (one per player, 18 holes each)
└── Tournament Group: "Round 2 - Flight A"
    └── Tournament Rounds (one per player)
```

**Leaderboard Logic**:
- For multi-round tournaments, sum scores across all rounds per player
- Filter leaderboard by `golf_round_group_id` to show round-specific standings
- OR aggregate across all groups with same flight name for cumulative leaderboard

**UI Consideration**:
- TournamentDetailScreen shows multiple groups (rounds)
- User can start/continue different rounds separately
- Leaderboard has "Round 1" / "Round 2" / "Overall" toggle

## 13. Acceptance Criteria

### Home Screen Integration
- [ ] "My Tournaments" section appears on Home screen when user has active tournaments
- [ ] Active tournament card shows tournament name and group name
- [ ] Progress bar displays holes completed (e.g., "9/18 holes")
- [ ] "Continue Round" button navigates to ScorecardScreen with correct roundId
- [ ] "Browse All Tournaments" link navigates to Tournaments tab
- [ ] Section hidden when user has no active tournaments

### Tournament Browsing
- [ ] User can view list of upcoming and past tournaments
- [ ] Admin-hidden tournaments do not appear in public list
- [ ] Each tournament card shows: name, dates, course, player count, format
- [ ] Pull-to-refresh updates tournament list
- [ ] Empty states display when no tournaments exist

### Tournament Detail
- [ ] User can view complete tournament information
- [ ] Groups/flights listed with player counts
- [ ] Registration button appears when registration is open
- [ ] "Registered" badge shows when user already registered
- [ ] Leaderboard link navigates to live standings

### Tournament Registration
- [ ] User can select flight/group during registration
- [ ] Form validates handicap requirements
- [ ] Confirmation message appears on successful registration
- [ ] User cannot register twice for same tournament
- [ ] Error messages display for closed/full groups

### Live Scorecard
- [ ] User can enter scores for all 18 holes
- [ ] Score inputs are large and easy to tap
- [ ] Front 9, Back 9, and Total scores calculate automatically
- [ ] Scores save locally immediately (offline support)
- [ ] Scores sync to server when online
- [ ] Sync status indicator shows current state
- [ ] User can navigate between holes with prev/next buttons
- [ ] User can tap scorecard grid to jump to specific hole
- [ ] Finish Round requires confirmation
- [ ] Completed rounds cannot be edited

### Leaderboard
- [ ] Live leaderboard displays all players with rankings
- [ ] User can filter by flight/group
- [ ] User can toggle between gross and net scoring
- [ ] Current user's position is highlighted
- [ ] Pull-to-refresh updates standings
- [ ] Player progress shows holes completed ("Thru 15")

### Internationalization
- [ ] All tournament UI displays in English
- [ ] All tournament UI displays in Spanish when language set to Spanish
- [ ] Date/time formats respect user's locale

### Accessibility
- [ ] Screen reader can navigate all tournament screens
- [ ] Score indicators use shape + color
- [ ] All interactive elements have ≥48dp touch targets
- [ ] Color contrast meets WCAG AA standards

### Offline Functionality
- [ ] Scorecard works offline during golf round
- [ ] Scores persist in local storage
- [ ] Sync occurs automatically when connection restored
- [ ] User sees clear sync status at all times

## 14. Implementation Decisions (User Confirmed)

1. **Admin Features**: ✓ Admin tournament management happens in separate application - no need to implement here

2. **Real-Time Updates**: ✓ Use `tournament_leaderboard_dense_rank` view with pull-to-refresh (no Supabase Realtime needed)

3. **Multi-Round Tournaments**: ✓ YES - Each round represented by `tournament_groups`. The `name` field identifies how it's used (e.g., "Round 1 - Championship Flight", "Round 2 - Flight A")

4. **Team Tournaments**: ✓ Individual stroke play for now. Scramble can be managed by team captain entering single scorecard

5. **Payment Integration**: ✓ No finance implementation for now

6. **Push Notifications**: ✓ Not needed for now - implement in future phase

7. **Additional Features**:
   - **Pace of Play**: Track round duration automatically (`start_datetime` → `end_datetime`)
   - **Photo Uploads**: Keep in mind for final steps
   - **Dispute Resolution**: `dispute_requested` flag set by user, admin resolves offline

8. **Navigation**: ✓ **BOTH Option A and Option C prioritized**:
   - **Option A**: New dedicated "Tournaments" tab at root level
   - **Option C**: Tournament section on Home screen with quick access

---

## 15. Recommended Implementation Phases

### Phase 1: Foundation (Core Infrastructure)
**Goal**: Set up navigation, services, and basic tournament browsing

**Tasks**:
1. Create `/src/services/tournaments.ts` with all service methods
2. Add tournament type exports to `/src/types/index.ts`
3. Create `/src/navigation/TournamentsStack.tsx` with screen stack
4. Modify `/src/navigation/AppTabs.tsx` to add Tournaments tab
5. Add tournament translations to `/src/locales/en.json` and `/src/locales/es.json`
6. Install `@react-native-community/netinfo` dependency

**Deliverable**: Navigation structure in place, service layer ready

### Phase 2: Tournament Browsing & Detail
**Goal**: Users can browse and view tournament details

**Tasks**:
1. Create `TournamentCard` component
2. Create `TournamentListScreen` (browse upcoming/past)
3. Create `TournamentDetailScreen` (view tournament info)
4. Create `TournamentGroupListScreen` (view flight/group players)
5. Test with existing tournament data from Supabase

**Deliverable**: Users can browse tournaments and view details

### Phase 3: Tournament Registration
**Goal**: Users can register for tournaments

**Tasks**:
1. Create `TournamentRegistrationScreen`
2. Implement validation rules (handicap, capacity, dates)
3. Create `tournament_rounds` record on registration
4. Handle error cases (full tournament, closed registration, etc.)

**Deliverable**: Users can register for open tournaments

### Phase 4: Live Scorecard (Offline-First)
**Goal**: Users can enter scores during play with offline support

**Tasks**:
1. Create `useNetworkStatus` hook
2. Create `scorecardSync.ts` utility for offline sync
3. Create `ScoreInput` component (number pad)
4. Create `ScorecardGrid` component (18-hole overview)
5. Create `ScorecardScreen` with local state + AsyncStorage
6. Implement auto-save and sync queue
7. Add pace of play tracking (start_datetime → end_datetime)
8. Add "Finish Round" confirmation flow

**Deliverable**: Users can score full 18-hole rounds offline

### Phase 5: Leaderboard
**Goal**: Users can view live tournament standings

**Tasks**:
1. Create `LeaderboardCard` component
2. Create `LeaderboardScreen`
3. Implement flight filtering
4. Implement gross/net score toggle
5. Add user position highlighting
6. Query `tournament_leaderboard_dense_rank` view

**Deliverable**: Live leaderboard with filtering

### Phase 6: Home Screen Integration
**Goal**: Quick access to active tournaments from Home

**Tasks**:
1. Create `MyTournamentCard` component
2. Modify `HomeScreen.tsx` to add "My Tournaments" section
3. Query active tournaments for current user
4. Add navigation to ScorecardScreen from Home
5. Show progress bar for in-progress rounds

**Deliverable**: Home screen shows active tournaments

### Phase 7: Polish & Dispute Flow
**Goal**: Final touches and dispute resolution

**Tasks**:
1. Add "Request Dispute" button to completed scorecards
2. Implement dispute flag UI
3. Add multi-round tournament support in leaderboard
4. Accessibility audit (screen reader, color contrast, touch targets)
5. Performance optimization (pagination for large leaderboards)
6. Error handling and edge cases

**Deliverable**: Production-ready tournament system

### Phase 8: Future Enhancements (Post-MVP)
**Goal**: Advanced features for later phases

**Tasks**:
- Photo uploads for holes
- Real-time leaderboard updates (Supabase Realtime)
- Push notifications for tournament updates
- Team tournament formats (scramble, best ball)
- Advanced statistics (fairways hit, putts, GIR)

---

## Summary

This plan provides a complete UX architecture for tournament management with:
- **6 screens** for browsing, registration, live scoring, and leaderboards
- **Offline-first scorecard** with AsyncStorage and sync queue
- **Bilingual support** with i18n keys for English/Spanish
- **Accessible design** following WCAG standards
- **Premium UI** matching TeeTime Cloud's golf-focused aesthetic
- **Leverages existing database views** for optimized queries

The implementation follows the existing codebase patterns (manual state management, service layer, theme context) and integrates seamlessly with the current navigation structure.
