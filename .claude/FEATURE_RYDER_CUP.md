# TeeTime Cloud Mobile — Ryder Cup Feature Integration Plan

**Last Updated**: 2025-12-05
**Version**: 1.0.0
**Feature**: Golf Club Ryder Cup Teams & Competitions

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [Ryder Cup Format Explained](#ryder-cup-format-explained)
3. [User Stories](#user-stories)
4. [Database Schema](#database-schema)
5. [Architecture & Components](#architecture--components)
6. [Implementation Phases](#implementation-phases)
7. [Detailed Implementation](#detailed-implementation)
8. [Scoring System](#scoring-system)
9. [UI/UX Mockups](#uiux-mockups)
10. [API Services](#api-services)
11. [Testing Strategy](#testing-strategy)
12. [Rollout Plan](#rollout-plan)

---

## Feature Overview

### What is Ryder Cup in TeeTime Cloud?

The **Ryder Cup** feature enables golf clubs and communities to organize team-based match play competitions similar to the prestigious biennial Ryder Cup tournament. Teams compete head-to-head in various match formats over multiple days.

### Key Capabilities

1. **Team Management**
   - Create Ryder Cup teams within a golf club/community
   - Team roster management (12-24 players typical)
   - Team captain designation
   - Team branding (name, logo, colors)

2. **Ryder Cup Event Creation**
   - Multi-day tournament structure (typically 3 days)
   - Multiple match formats:
     - **Foursomes** (Alternate Shot)
     - **Four-ball** (Best Ball)
     - **Singles** (Individual Match Play)
   - Automatic pairing system
   - Point allocation system (1 point per match, 0.5 for tie)

3. **Match Play Scoring**
   - Hole-by-hole match status (up/down, all-square)
   - Live match updates
   - Team vs. Team leaderboard
   - Real-time point tracking

4. **Team Communication**
   - Team chat
   - Captain announcements
   - Match notifications
   - Strategy board

5. **Historical Records**
   - Team win/loss record
   - Individual player statistics
   - Trophy case
   - Past Ryder Cup results

---

## Ryder Cup Format Explained

### Traditional Ryder Cup Structure

**3-Day Format**:

**Day 1 (Friday)**:
- Morning: 4 Foursomes matches
- Afternoon: 4 Four-ball matches

**Day 2 (Saturday)**:
- Morning: 4 Foursomes matches
- Afternoon: 4 Four-ball matches

**Day 3 (Sunday)**:
- 12 Singles matches

**Total**: 28 matches, 28 points available

**Winning**: Team with most points wins (14.5 points needed)

---

### Match Formats

#### **Foursomes (Alternate Shot)**
- 2 players per team
- Teams alternate hitting the same ball
- Team A Player 1 tees off on odd holes
- Team A Player 2 tees off on even holes
- Players alternate shots until hole is completed

#### **Four-ball (Best Ball)**
- 2 players per team
- Each player plays their own ball
- Best score from the two players counts as team score for the hole

#### **Singles**
- 1 vs 1 match play
- Each player plays their own ball
- Lower score wins the hole

---

### Match Play Scoring

- **Win a hole**: Score better than opponent
- **Halve a hole**: Tie the hole
- **Match status**: "2 up", "3 down", "all-square", "dormie"
- **Match result**: "3&2" means 3 holes up with 2 holes to play

---

## User Stories

### Team Captain

1. **As a team captain**, I want to create a Ryder Cup team for my golf club so that we can compete against other clubs.

2. **As a team captain**, I want to invite players to join my team so that we have a full roster.

3. **As a team captain**, I want to set pairings for foursomes and four-ball matches so that we have the best chance to win.

4. **As a team captain**, I want to view team statistics so that I can make strategic decisions about pairings.

### Team Member

5. **As a team member**, I want to accept an invitation to join a Ryder Cup team so that I can participate.

6. **As a team member**, I want to see my match schedule so that I know when and who I'm playing.

7. **As a team member**, I want to enter scores for my match so that the results are tracked.

8. **As a team member**, I want to see live updates of other matches so that I know how the team is doing.

### Event Organizer (Golf Club Admin)

9. **As an organizer**, I want to create a Ryder Cup event so that two teams can compete.

10. **As an organizer**, I want to define the match schedule (day 1, 2, 3) so that all matches are organized.

11. **As an organizer**, I want to monitor all matches in real-time so that I can track the overall competition.

### Spectator/Fan

12. **As a fan**, I want to follow a Ryder Cup event so that I can see live scores and standings.

13. **As a fan**, I want to view the overall team leaderboard so that I know which team is winning.

---

## Database Schema

### New Tables

#### `ryder_cup_teams`
Team information.

```sql
CREATE TABLE ryder_cup_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities, -- Optional: teams can be community-based
  name TEXT NOT NULL,
  logo_url TEXT,
  team_color TEXT, -- Hex color code
  captain_id UUID REFERENCES golfer_profiles NOT NULL,

  -- Team stats
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  total_ties INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ryder_cup_teams_community ON ryder_cup_teams(community_id);
CREATE INDEX idx_ryder_cup_teams_captain ON ryder_cup_teams(captain_id);
```

---

#### `ryder_cup_team_members`
Team roster.

```sql
CREATE TABLE ryder_cup_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES ryder_cup_teams NOT NULL,
  golfer_id UUID REFERENCES golfer_profiles NOT NULL,
  status TEXT CHECK (status IN ('invited', 'active', 'declined', 'removed')) DEFAULT 'invited',

  -- Player stats for this team
  matches_played INTEGER DEFAULT 0,
  matches_won INTEGER DEFAULT 0,
  matches_lost INTEGER DEFAULT 0,
  matches_halved INTEGER DEFAULT 0,
  points_earned NUMERIC DEFAULT 0,

  joined_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(team_id, golfer_id)
);

CREATE INDEX idx_ryder_cup_team_members_team ON ryder_cup_team_members(team_id);
CREATE INDEX idx_ryder_cup_team_members_golfer ON ryder_cup_team_members(golfer_id);
```

---

#### `ryder_cup_events`
Ryder Cup competition events.

```sql
CREATE TABLE ryder_cup_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses NOT NULL,

  team_a_id UUID REFERENCES ryder_cup_teams NOT NULL,
  team_b_id UUID REFERENCES ryder_cup_teams NOT NULL,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Event configuration
  format_config JSONB DEFAULT '{
    "day1_morning": {"format": "foursomes", "matches": 4},
    "day1_afternoon": {"format": "fourball", "matches": 4},
    "day2_morning": {"format": "foursomes", "matches": 4},
    "day2_afternoon": {"format": "fourball", "matches": 4},
    "day3": {"format": "singles", "matches": 12}
  }'::jsonb,

  -- Scoring
  team_a_points NUMERIC DEFAULT 0,
  team_b_points NUMERIC DEFAULT 0,

  status TEXT CHECK (status IN ('upcoming', 'in_progress', 'completed')) DEFAULT 'upcoming',
  winner_team_id UUID REFERENCES ryder_cup_teams,

  created_by UUID REFERENCES golfer_profiles NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ryder_cup_events_course ON ryder_cup_events(course_id);
CREATE INDEX idx_ryder_cup_events_teams ON ryder_cup_events(team_a_id, team_b_id);
CREATE INDEX idx_ryder_cup_events_status ON ryder_cup_events(status);
```

---

#### `ryder_cup_matches`
Individual matches within an event.

```sql
CREATE TABLE ryder_cup_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES ryder_cup_events NOT NULL,

  match_day INTEGER CHECK (match_day BETWEEN 1 AND 3), -- Day 1, 2, or 3
  match_session TEXT CHECK (match_session IN ('morning', 'afternoon', 'singles')),
  match_number INTEGER, -- Order within session

  format TEXT CHECK (format IN ('foursomes', 'fourball', 'singles')) NOT NULL,

  -- Team A players
  team_a_player1_id UUID REFERENCES golfer_profiles NOT NULL,
  team_a_player2_id UUID REFERENCES golfer_profiles, -- NULL for singles

  -- Team B players
  team_b_player1_id UUID REFERENCES golfer_profiles NOT NULL,
  team_b_player2_id UUID REFERENCES golfer_profiles, -- NULL for singles

  -- Match scoring
  current_hole INTEGER DEFAULT 1,
  team_a_up_down INTEGER DEFAULT 0, -- Positive = team A up, negative = team B up
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',

  -- Match result
  winner TEXT CHECK (winner IN ('team_a', 'team_b', 'halved')),
  final_score TEXT, -- e.g., "3&2", "1up", "halved"
  points_team_a NUMERIC DEFAULT 0, -- 1, 0.5, or 0
  points_team_b NUMERIC DEFAULT 0, -- 1, 0.5, or 0

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ryder_cup_matches_event ON ryder_cup_matches(event_id);
CREATE INDEX idx_ryder_cup_matches_day ON ryder_cup_matches(event_id, match_day, match_session);
CREATE INDEX idx_ryder_cup_matches_status ON ryder_cup_matches(event_id, status);
```

---

#### `ryder_cup_match_holes`
Hole-by-hole match play results.

```sql
CREATE TABLE ryder_cup_match_holes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES ryder_cup_matches NOT NULL,
  hole_number INTEGER CHECK (hole_number BETWEEN 1 AND 18),

  -- Scores
  team_a_score INTEGER,
  team_b_score INTEGER,

  -- Hole result
  winner TEXT CHECK (winner IN ('team_a', 'team_b', 'halved')),

  -- Match status after this hole
  match_status TEXT, -- e.g., "2up", "all-square", "1down"

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(match_id, hole_number)
);

CREATE INDEX idx_ryder_cup_match_holes_match ON ryder_cup_match_holes(match_id);
```

---

#### `ryder_cup_announcements`
Team/event announcements.

```sql
CREATE TABLE ryder_cup_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES ryder_cup_events,
  team_id UUID REFERENCES ryder_cup_teams,

  author_id UUID REFERENCES golfer_profiles NOT NULL,
  title TEXT,
  message TEXT NOT NULL,

  is_pinned BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ryder_cup_announcements_event ON ryder_cup_announcements(event_id);
CREATE INDEX idx_ryder_cup_announcements_team ON ryder_cup_announcements(team_id);
```

---

### Database Views

#### `ryder_cup_event_leaderboard`
Real-time event standings.

```sql
CREATE VIEW ryder_cup_event_leaderboard AS
SELECT
  e.id AS event_id,
  e.name AS event_name,

  ta.id AS team_a_id,
  ta.name AS team_a_name,
  ta.logo_url AS team_a_logo,
  SUM(m.points_team_a) AS team_a_total_points,

  tb.id AS team_b_id,
  tb.name AS team_b_name,
  tb.logo_url AS team_b_logo,
  SUM(m.points_team_b) AS team_b_total_points,

  COUNT(m.id) FILTER (WHERE m.status = 'completed') AS matches_completed,
  COUNT(m.id) AS total_matches

FROM ryder_cup_events e
JOIN ryder_cup_teams ta ON ta.id = e.team_a_id
JOIN ryder_cup_teams tb ON tb.id = e.team_b_id
LEFT JOIN ryder_cup_matches m ON m.event_id = e.id
GROUP BY e.id, e.name, ta.id, ta.name, ta.logo_url, tb.id, tb.name, tb.logo_url;
```

---

## Architecture & Components

### Service Layer

**New Services**:

1. **src/services/ryderCup.ts**
   - `createTeam()`
   - `updateTeam()`
   - `deleteTeam()`
   - `fetchTeams()`
   - `fetchTeamById(id)`

2. **src/services/ryderCupMembers.ts**
   - `invitePlayer(teamId, golferId)`
   - `acceptInvitation(teamId, golferId)`
   - `declineInvitation(teamId, golferId)`
   - `removePlayer(teamId, golferId)`
   - `fetchTeamRoster(teamId)`

3. **src/services/ryderCupEvents.ts**
   - `createEvent(eventData)`
   - `fetchEvents(filters)`
   - `fetchEventById(id)`
   - `updateEvent(id, data)`
   - `fetchEventLeaderboard(eventId)`

4. **src/services/ryderCupMatches.ts**
   - `createMatches(eventId, matchesData)`
   - `fetchMatches(eventId, filters)`
   - `fetchMatchById(id)`
   - `updateMatchScore(matchId, holeNumber, scores)`
   - `completeMatch(matchId)`

---

### Screen Components

**New Screens**:

1. **src/screens/ryderCup/RyderCupHomeScreen.tsx**
   - Browse Ryder Cup events
   - My teams
   - Upcoming events

2. **src/screens/ryderCup/CreateTeamScreen.tsx**
   - Team creation form
   - Team branding

3. **src/screens/ryderCup/TeamDetailScreen.tsx**
   - Team overview
   - Roster
   - Statistics
   - Past events

4. **src/screens/ryderCup/TeamRosterScreen.tsx**
   - Manage roster
   - Invite players
   - View player stats

5. **src/screens/ryderCup/CreateEventScreen.tsx**
   - Event setup
   - Team selection
   - Course selection
   - Format configuration

6. **src/screens/ryderCup/EventDetailScreen.tsx**
   - Event overview
   - Team leaderboard
   - Tabs: Matches, Leaderboard, Info

7. **src/screens/ryderCup/MatchListScreen.tsx**
   - List of matches by day/session
   - Match status
   - Live updates

8. **src/screens/ryderCup/MatchDetailScreen.tsx**
   - Hole-by-hole scoring
   - Match status (e.g., "2up through 12")
   - Player details

9. **src/screens/ryderCup/MatchScoringScreen.tsx**
   - Enter scores for match
   - Mark hole winner
   - Update match status

10. **src/screens/ryderCup/EventLeaderboardScreen.tsx**
    - Overall team points
    - Match results breakdown
    - Day-by-day summary

11. **src/screens/ryderCup/SetPairingsScreen.tsx**
    - Captain sets foursomes/fourball pairings
    - Drag-and-drop pairing interface

---

### UI Components

**New Components**:

1. **src/components/ryderCup/TeamCard.tsx**
   - Team info card

2. **src/components/ryderCup/EventCard.tsx**
   - Event preview card

3. **src/components/ryderCup/MatchCard.tsx**
   - Match summary with status

4. **src/components/ryderCup/MatchStatusBadge.tsx**
   - Live status (e.g., "3up", "A/S")

5. **src/components/ryderCup/TeamLeaderboard.tsx**
   - Points visualization

6. **src/components/ryderCup/PairingSelector.tsx**
   - Pairing interface for captains

7. **src/components/ryderCup/MatchScorecard.tsx**
   - Hole-by-hole match display

---

## Implementation Phases

### Phase 1: Team Management (Week 1-2)

**Goal**: Create and manage Ryder Cup teams.

**Tasks**:
1. ✅ Database schema for teams and members
2. ✅ Create `ryderCup` and `ryderCupMembers` services
3. ✅ Build `CreateTeamScreen`
4. ✅ Build `TeamDetailScreen`
5. ✅ Build `TeamRosterScreen`
6. ✅ Player invitation system

**Deliverable**: Teams can be created and managed.

---

### Phase 2: Event Creation (Week 3)

**Goal**: Create Ryder Cup events.

**Tasks**:
1. ✅ Event database schema
2. ✅ Create `ryderCupEvents` service
3. ✅ Build `CreateEventScreen`
4. ✅ Build `EventDetailScreen`
5. ✅ Team selection interface

**Deliverable**: Events can be created with two teams.

---

### Phase 3: Match Management (Week 4-5)

**Goal**: Match creation, pairing, and structure.

**Tasks**:
1. ✅ Matches database schema
2. ✅ Create `ryderCupMatches` service
3. ✅ Build `SetPairingsScreen` (captain interface)
4. ✅ Build `MatchListScreen`
5. ✅ Build `MatchDetailScreen`
6. ✅ Automatic match generation based on format

**Deliverable**: Captains can set pairings and create matches.

---

### Phase 4: Match Play Scoring (Week 6-7)

**Goal**: Real-time match play scoring.

**Tasks**:
1. ✅ Hole-by-hole scoring schema
2. ✅ Build `MatchScoringScreen`
3. ✅ Match status calculation logic
4. ✅ Live match updates
5. ✅ Point calculation and aggregation
6. ✅ Match completion workflow

**Deliverable**: Players can enter scores and track match status.

---

### Phase 5: Leaderboards & Analytics (Week 8)

**Goal**: Team and event leaderboards.

**Tasks**:
1. ✅ Event leaderboard view
2. ✅ Build `EventLeaderboardScreen`
3. ✅ Real-time point updates
4. ✅ Team statistics
5. ✅ Player performance analytics

**Deliverable**: Live event standings and analytics.

---

### Phase 6: Communication & Notifications (Week 9)

**Goal**: Team communication and notifications.

**Tasks**:
1. ✅ Announcements system
2. ✅ Push notifications for match updates
3. ✅ Team chat (optional)
4. ✅ Captain announcements

**Deliverable**: Enhanced team communication.

---

### Phase 7: Polish & Launch (Week 10)

**Goal**: Production-ready feature.

**Tasks**:
1. ✅ UI polish
2. ✅ Loading states, empty states
3. ✅ Error handling
4. ✅ Translations (EN/ES)
5. ✅ Performance optimization
6. ✅ Beta testing

**Deliverable**: Launch Ryder Cup feature.

---

## Detailed Implementation

### Phase 1: Team Management

#### Ryder Cup Service

**File**: `src/services/ryderCup.ts`

```typescript
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/database.types';

type RyderCupTeam = Database['public']['Tables']['ryder_cup_teams']['Row'];
type RyderCupTeamInsert = Database['public']['Tables']['ryder_cup_teams']['Insert'];

export const ryderCupService = {
  /**
   * Create a Ryder Cup team
   */
  async createTeam(data: RyderCupTeamInsert) {
    const { data: team, error } = await supabase
      .from('ryder_cup_teams')
      .insert([data])
      .select()
      .single();

    if (error) throw error;

    // Add captain as first team member
    await supabase.from('ryder_cup_team_members').insert([
      {
        team_id: team.id,
        golfer_id: data.captain_id,
        status: 'active'
      }
    ]);

    return team;
  },

  /**
   * Fetch all teams
   */
  async fetchTeams(filters?: { communityId?: string }) {
    let query = supabase
      .from('ryder_cup_teams')
      .select(`
        *,
        captain:golfer_profiles!captain_id(
          first_name,
          last_name,
          profile_image_url
        ),
        community:communities(name, logo_url)
      `)
      .order('created_at', { ascending: false });

    if (filters?.communityId) {
      query = query.eq('community_id', filters.communityId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Fetch team by ID
   */
  async fetchTeamById(id: string) {
    const { data, error } = await supabase
      .from('ryder_cup_teams')
      .select(`
        *,
        captain:golfer_profiles!captain_id(
          id,
          first_name,
          last_name,
          profile_image_url,
          handicap
        ),
        community:communities(name, logo_url),
        members:ryder_cup_team_members(
          *,
          golfer:golfer_profiles(
            id,
            first_name,
            last_name,
            profile_image_url,
            handicap
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update team
   */
  async updateTeam(id: string, data: Partial<RyderCupTeamInsert>) {
    const { data: updated, error } = await supabase
      .from('ryder_cup_teams')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  },

  /**
   * Delete team
   */
  async deleteTeam(id: string) {
    const { error } = await supabase
      .from('ryder_cup_teams')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
```

---

### Phase 4: Match Play Scoring

#### Match Scoring Logic

**File**: `src/utils/matchPlayScoring.ts`

```typescript
export interface MatchStatus {
  upDown: number; // Positive = team A up, negative = team B up
  holesRemaining: number;
  status: string; // e.g., "2up", "all-square", "dormie"
  isComplete: boolean;
  winner: 'team_a' | 'team_b' | 'halved' | null;
  finalScore: string | null; // e.g., "3&2", "1up"
}

/**
 * Calculate match status after a hole
 */
export function calculateMatchStatus(
  currentUpDown: number,
  holesPlayed: number,
  totalHoles: number = 18
): MatchStatus {
  const holesRemaining = totalHoles - holesPlayed;
  const absUpDown = Math.abs(currentUpDown);

  // Check if match is complete
  if (absUpDown > holesRemaining) {
    // Match is won (e.g., 3 up with 2 to play = "3&2")
    return {
      upDown: currentUpDown,
      holesRemaining,
      status: `${absUpDown}&${holesRemaining}`,
      isComplete: true,
      winner: currentUpDown > 0 ? 'team_a' : 'team_b',
      finalScore: `${absUpDown}&${holesRemaining}`
    };
  }

  if (holesRemaining === 0) {
    // All holes played
    if (currentUpDown === 0) {
      return {
        upDown: 0,
        holesRemaining: 0,
        status: 'halved',
        isComplete: true,
        winner: 'halved',
        finalScore: 'halved'
      };
    } else {
      return {
        upDown: currentUpDown,
        holesRemaining: 0,
        status: `${absUpDown}up`,
        isComplete: true,
        winner: currentUpDown > 0 ? 'team_a' : 'team_b',
        finalScore: `${absUpDown}up`
      };
    }
  }

  // Match still in progress
  let statusText: string;

  if (currentUpDown === 0) {
    statusText = 'all-square';
  } else if (absUpDown === holesRemaining) {
    statusText = 'dormie'; // Can't lose, can only win or halve
  } else {
    const side = currentUpDown > 0 ? 'up' : 'down';
    statusText = `${absUpDown}${side}`;
  }

  return {
    upDown: currentUpDown,
    holesRemaining,
    status: statusText,
    isComplete: false,
    winner: null,
    finalScore: null
  };
}

/**
 * Calculate match result after scoring a hole
 */
export function scoreHole(
  currentUpDown: number,
  holesPlayed: number,
  teamAScore: number,
  teamBScore: number
): {
  holeWinner: 'team_a' | 'team_b' | 'halved';
  newUpDown: number;
  matchStatus: MatchStatus;
} {
  let holeWinner: 'team_a' | 'team_b' | 'halved';
  let newUpDown = currentUpDown;

  if (teamAScore < teamBScore) {
    holeWinner = 'team_a';
    newUpDown += 1;
  } else if (teamBScore < teamAScore) {
    holeWinner = 'team_b';
    newUpDown -= 1;
  } else {
    holeWinner = 'halved';
  }

  const matchStatus = calculateMatchStatus(newUpDown, holesPlayed);

  return {
    holeWinner,
    newUpDown,
    matchStatus
  };
}

/**
 * Calculate points for completed match
 */
export function calculateMatchPoints(winner: 'team_a' | 'team_b' | 'halved'): {
  pointsTeamA: number;
  pointsTeamB: number;
} {
  if (winner === 'team_a') {
    return { pointsTeamA: 1, pointsTeamB: 0 };
  } else if (winner === 'team_b') {
    return { pointsTeamA: 0, pointsTeamB: 1 };
  } else {
    return { pointsTeamA: 0.5, pointsTeamB: 0.5 };
  }
}
```

---

#### Match Scoring Screen

**File**: `src/screens/ryderCup/MatchScoringScreen.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ryderCupMatchesService } from '@/services/ryderCupMatches';
import { scoreHole, calculateMatchPoints } from '@/utils/matchPlayScoring';

export const MatchScoringScreen = ({ route }: any) => {
  const { matchId } = route.params;
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [currentHole, setCurrentHole] = useState(1);
  const [teamAScore, setTeamAScore] = useState<number | null>(null);
  const [teamBScore, setTeamBScore] = useState<number | null>(null);

  const { data: match } = useQuery(
    ['ryderCupMatch', matchId],
    () => ryderCupMatchesService.fetchMatchById(matchId)
  );

  const submitHoleMutation = useMutation({
    mutationFn: async () => {
      if (teamAScore === null || teamBScore === null) {
        throw new Error('Scores not entered');
      }

      const result = scoreHole(
        match.team_a_up_down,
        currentHole,
        teamAScore,
        teamBScore
      );

      // Save hole result
      await ryderCupMatchesService.saveHoleScore(matchId, currentHole, {
        team_a_score: teamAScore,
        team_b_score: teamBScore,
        winner: result.holeWinner,
        match_status: result.matchStatus.status
      });

      // Update match
      await ryderCupMatchesService.updateMatch(matchId, {
        team_a_up_down: result.newUpDown,
        current_hole: currentHole + 1,
        status: result.matchStatus.isComplete ? 'completed' : 'in_progress'
      });

      // If match complete, calculate points
      if (result.matchStatus.isComplete) {
        const points = calculateMatchPoints(result.matchStatus.winner!);
        await ryderCupMatchesService.completeMatch(matchId, {
          winner: result.matchStatus.winner,
          final_score: result.matchStatus.finalScore,
          points_team_a: points.pointsTeamA,
          points_team_b: points.pointsTeamB
        });
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries(['ryderCupMatch', matchId]);
      queryClient.invalidateQueries(['ryderCupEventLeaderboard']);

      if (result.matchStatus.isComplete) {
        Alert.alert(
          t('ryderCup.match.complete'),
          t('ryderCup.match.finalScore', { score: result.matchStatus.finalScore })
        );
      } else {
        setCurrentHole(currentHole + 1);
        setTeamAScore(null);
        setTeamBScore(null);
      }
    }
  });

  if (!match) return null;

  return (
    <ScrollView className="flex-1 bg-white dark:bg-charcoal p-4">
      {/* Match Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-center">
          {t('ryderCup.match.hole', { number: currentHole })}
        </Text>
        <Text className="text-lg text-center text-gray-600 dark:text-gray-400">
          {match.team_a_up_down === 0
            ? t('ryderCup.match.allSquare')
            : t('ryderCup.match.status', {
                status: Math.abs(match.team_a_up_down),
                side: match.team_a_up_down > 0 ? 'up' : 'down'
              })}
        </Text>
      </View>

      {/* Team A Score */}
      <View className="mb-4">
        <Text className="font-semibold mb-2">
          {match.team_a_player1.first_name} {match.team_a_player1.last_name}
          {match.team_a_player2 &&
            ` / ${match.team_a_player2.first_name} ${match.team_a_player2.last_name}`}
        </Text>
        <View className="flex-row gap-2">
          {[3, 4, 5, 6, 7, 8, 9].map((score) => (
            <TouchableOpacity
              key={score}
              onPress={() => setTeamAScore(score)}
              className={`flex-1 py-3 rounded-lg border-2 ${
                teamAScore === score
                  ? 'bg-primary border-primary'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <Text
                className={`text-center font-bold ${
                  teamAScore === score ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}
              >
                {score}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Team B Score */}
      <View className="mb-6">
        <Text className="font-semibold mb-2">
          {match.team_b_player1.first_name} {match.team_b_player1.last_name}
          {match.team_b_player2 &&
            ` / ${match.team_b_player2.first_name} ${match.team_b_player2.last_name}`}
        </Text>
        <View className="flex-row gap-2">
          {[3, 4, 5, 6, 7, 8, 9].map((score) => (
            <TouchableOpacity
              key={score}
              onPress={() => setTeamBScore(score)}
              className={`flex-1 py-3 rounded-lg border-2 ${
                teamBScore === score
                  ? 'bg-primary border-primary'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <Text
                className={`text-center font-bold ${
                  teamBScore === score ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}
              >
                {score}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={() => submitHoleMutation.mutate()}
        disabled={teamAScore === null || teamBScore === null || submitHoleMutation.isPending}
        className={`py-4 rounded-lg ${
          teamAScore !== null && teamBScore !== null
            ? 'bg-primary'
            : 'bg-gray-300 dark:bg-gray-700'
        }`}
      >
        <Text className="text-white font-bold text-center text-lg">
          {submitHoleMutation.isPending
            ? t('common.submitting')
            : t('ryderCup.match.submitHole')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
```

---

## Scoring System

### Point Allocation

- **Win**: 1 point
- **Tie (Halved)**: 0.5 points each
- **Loss**: 0 points

### Team Total Points

Sum of all match points for the team.

### Winning Criteria

- Team with **most points** wins
- If tied after all matches: **Defending champion retains cup** (or declare tie)

---

## UI/UX Mockups

### Event Leaderboard
```
┌─────────────────────────────┐
│  Ryder Cup 2025             │
│  Pebble Beach               │
├─────────────────────────────┤
│  🇺🇸 Team USA      10.5     │
│  ━━━━━━━━━━━━━━━━━━━━━━     │
│  🇪🇺 Team Europe    9.0     │
├─────────────────────────────┤
│  Day 3 - Singles            │
│  6 of 12 matches complete   │
├─────────────────────────────┤
│  ✅ Tiger Woods 3&2         │
│     vs. Rory McIlroy        │
│  🟢 Phil Mickelson 2up      │
│     vs. Jon Rahm (thru 16)  │
│  ⏸️  Dustin Johnson A/S     │
│     vs. Viktor Hovland      │
└─────────────────────────────┘
```

---

## Testing Strategy

### Unit Tests
- Match status calculation
- Point calculation
- Pairing validation

### Integration Tests
- Match scoring flow
- Event creation
- Team management

### E2E Tests
1. Create team
2. Create event
3. Set pairings
4. Score match
5. View leaderboard

---

## Rollout Plan

### Beta (2 weeks)
- Test with 2-4 golf clubs
- Collect feedback
- Fix bugs

### Public Launch
- Announce to all communities
- Marketing campaign
- Tutorial videos

---

**End of Ryder Cup Feature Plan** | Last Updated: 2025-12-05
