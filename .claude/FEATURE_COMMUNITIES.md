# TeeTime Cloud Mobile — Communities Feature Integration Plan

**Last Updated**: 2025-12-05
**Version**: 1.0.0
**Feature**: Golfer Communities with Tournament Management

---

## Table of Contents

1. [Feature Overview](#feature-overview)
2. [User Stories](#user-stories)
3. [Database Schema](#database-schema)
4. [Architecture & Components](#architecture--components)
5. [Implementation Phases](#implementation-phases)
6. [Detailed Implementation](#detailed-implementation)
7. [UI/UX Mockups](#uiux-mockups)
8. [API Services](#api-services)
9. [Navigation Structure](#navigation-structure)
10. [Testing Strategy](#testing-strategy)
11. [Rollout Plan](#rollout-plan)

---

## Feature Overview

### What is Communities?

**Communities** is a social feature that allows golfers to create and join golf clubs, social groups, or professional organizations within TeeTime Cloud. Community owners and managers can organize tournaments (both at golf courses and offline), manage members, and foster engagement.

### Key Capabilities

1. **Community Creation & Management**
   - Create public or private communities
   - Set community details (name, description, logo, cover image)
   - Invite members or require approval
   - Assign roles (owner, manager, member)

2. **Community Tournaments**
   - Create tournaments at available golf courses
   - Create offline/custom tournaments (no course affiliation)
   - Manage tournament registration
   - Tournament-specific leaderboards
   - Community-only access (private tournaments)

3. **Member Management**
   - Invite golfers by email or username
   - Approve/reject membership requests
   - Remove members
   - Assign manager roles
   - Member directory

4. **Community Feed & Engagement**
   - Activity feed (tournaments, results, announcements)
   - Announcements from owners/managers
   - Event calendar
   - Community statistics (total rounds, avg handicap, etc.)

5. **Community Types**
   - Golf Clubs (affiliated with specific courses)
   - Social Groups (friends, colleagues)
   - Regional Associations (state/county golf associations)
   - Corporate Leagues (company tournaments)

---

## User Stories

### Community Owner/Manager

1. **As a community owner**, I want to create a new golf community so that I can organize tournaments and manage members.

2. **As a community manager**, I want to create a tournament at a specific golf course so that community members can compete.

3. **As a community manager**, I want to create an offline tournament (without a course) so that we can track results from external events.

4. **As a community manager**, I want to approve or reject membership requests so that I can control who joins the community.

5. **As a community manager**, I want to post announcements so that all members see important updates.

6. **As a community owner**, I want to assign other members as managers so that they can help administer the community.

### Community Member

7. **As a golfer**, I want to browse and join communities that interest me so that I can participate in group tournaments.

8. **As a community member**, I want to view upcoming community tournaments so that I can register.

9. **As a community member**, I want to see a leaderboard showing community rankings so that I can track my performance.

10. **As a community member**, I want to view other members' profiles so that I can connect with fellow golfers.

11. **As a community member**, I want to leave a community if I no longer wish to participate.

### General User

12. **As a golfer**, I want to search for communities by name, location, or type so that I can find relevant groups.

13. **As a golfer**, I want to see my communities on my profile so that I can quickly access them.

---

## Database Schema

### New Tables

#### `communities`
Core community information.

```sql
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  community_type TEXT CHECK (community_type IN (
    'golf_club',
    'social_group',
    'regional_association',
    'corporate_league'
  )) DEFAULT 'social_group',
  visibility TEXT CHECK (visibility IN ('public', 'private')) DEFAULT 'public',
  affiliated_course_id UUID REFERENCES courses,
  location TEXT,
  website TEXT,

  -- Membership settings
  require_approval BOOLEAN DEFAULT false,
  max_members INTEGER,

  -- Metadata
  member_count INTEGER DEFAULT 0,
  tournament_count INTEGER DEFAULT 0,

  created_by UUID REFERENCES golfer_profiles NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_communities_type ON communities(community_type);
CREATE INDEX idx_communities_visibility ON communities(visibility);
CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_communities_course ON communities(affiliated_course_id);
```

---

#### `community_members`
Community membership with roles.

```sql
CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities NOT NULL,
  golfer_id UUID REFERENCES golfer_profiles NOT NULL,
  role TEXT CHECK (role IN ('owner', 'manager', 'member')) DEFAULT 'member',
  status TEXT CHECK (status IN ('pending', 'active', 'removed')) DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(community_id, golfer_id)
);

CREATE INDEX idx_community_members_community ON community_members(community_id);
CREATE INDEX idx_community_members_golfer ON community_members(golfer_id);
CREATE INDEX idx_community_members_status ON community_members(community_id, status);
```

---

#### `community_tournaments`
Tournaments organized by communities.

```sql
CREATE TABLE community_tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities NOT NULL,
  tournament_id UUID REFERENCES tournaments, -- NULL for offline tournaments

  -- Offline tournament details (when tournament_id is NULL)
  name TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  location TEXT,
  format TEXT,

  is_offline BOOLEAN DEFAULT false,
  is_members_only BOOLEAN DEFAULT true,

  created_by UUID REFERENCES golfer_profiles NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_community_tournaments_community ON community_tournaments(community_id);
CREATE INDEX idx_community_tournaments_tournament ON community_tournaments(tournament_id);
CREATE INDEX idx_community_tournaments_offline ON community_tournaments(is_offline);
```

---

#### `offline_tournament_rounds`
For offline tournaments (not affiliated with courses).

```sql
CREATE TABLE offline_tournament_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_tournament_id UUID REFERENCES community_tournaments NOT NULL,
  golfer_id UUID REFERENCES golfer_profiles NOT NULL,

  total_score INTEGER,
  round_number INTEGER DEFAULT 1,
  notes TEXT,

  -- Manual score entry
  created_by UUID REFERENCES golfer_profiles NOT NULL,
  verified_by UUID REFERENCES golfer_profiles, -- Manager verification

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(community_tournament_id, golfer_id, round_number)
);

CREATE INDEX idx_offline_rounds_tournament ON offline_tournament_rounds(community_tournament_id);
CREATE INDEX idx_offline_rounds_golfer ON offline_tournament_rounds(golfer_id);
```

---

#### `community_invitations`
Invitations to join communities.

```sql
CREATE TABLE community_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities NOT NULL,
  invited_by UUID REFERENCES golfer_profiles NOT NULL,

  -- Can invite by email or existing user
  golfer_id UUID REFERENCES golfer_profiles,
  email TEXT,

  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',

  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  responded_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(community_id, golfer_id),
  UNIQUE(community_id, email)
);

CREATE INDEX idx_community_invitations_community ON community_invitations(community_id);
CREATE INDEX idx_community_invitations_golfer ON community_invitations(golfer_id);
CREATE INDEX idx_community_invitations_status ON community_invitations(status);
```

---

#### `community_posts`
Announcements and posts from managers/owners.

```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities NOT NULL,
  author_id UUID REFERENCES golfer_profiles NOT NULL,

  post_type TEXT CHECK (post_type IN ('announcement', 'discussion', 'event')) DEFAULT 'announcement',
  title TEXT,
  content TEXT NOT NULL,

  is_pinned BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_community_posts_community ON community_posts(community_id);
CREATE INDEX idx_community_posts_pinned ON community_posts(community_id, is_pinned, created_at DESC);
```

---

#### `community_stats`
Aggregated community statistics (materialized view or table).

```sql
CREATE TABLE community_stats (
  community_id UUID PRIMARY KEY REFERENCES communities,

  total_rounds INTEGER DEFAULT 0,
  total_tournaments INTEGER DEFAULT 0,
  avg_handicap NUMERIC,
  most_active_golfer_id UUID REFERENCES golfer_profiles,

  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### Updated Tables

#### `tournaments`
Add community affiliation (optional).

```sql
ALTER TABLE tournaments ADD COLUMN created_by_community_id UUID REFERENCES communities;
ALTER TABLE tournaments ADD COLUMN is_community_only BOOLEAN DEFAULT false;

CREATE INDEX idx_tournaments_community ON tournaments(created_by_community_id);
```

---

### Database Views

#### `community_leaderboard`
Community-wide leaderboard based on all rounds played by members.

```sql
CREATE VIEW community_leaderboard AS
SELECT
  cm.community_id,
  g.id AS golfer_id,
  g.first_name,
  g.last_name,
  g.handicap,
  COUNT(gr.id) AS rounds_played,
  AVG(gr.total_strokes) AS avg_score,
  MIN(gr.total_strokes) AS best_score
FROM community_members cm
JOIN golfer_profiles g ON g.id = cm.golfer_id
LEFT JOIN golf_rounds gr ON gr.golfer_id = g.id
WHERE cm.status = 'active'
GROUP BY cm.community_id, g.id, g.first_name, g.last_name, g.handicap
ORDER BY cm.community_id, AVG(gr.total_strokes) ASC;
```

---

## Architecture & Components

### Service Layer

**New Services**:

1. **src/services/communities.ts**
   - `createCommunity()`
   - `updateCommunity()`
   - `deleteCommunity()`
   - `fetchCommunities(filters)`
   - `fetchCommunityById(id)`
   - `fetchMyCommunities(golferId)`
   - `searchCommunities(query)`

2. **src/services/communityMembers.ts**
   - `addMember(communityId, golferId, role)`
   - `removeMember(communityId, golferId)`
   - `updateMemberRole(communityId, golferId, role)`
   - `fetchMembers(communityId)`
   - `fetchMembershipRequests(communityId)`
   - `approveMembership(communityId, golferId)`
   - `joinCommunity(communityId)` (request to join)

3. **src/services/communityTournaments.ts**
   - `createCommunityTournament(communityId, tournamentData)`
   - `createOfflineTournament(communityId, offlineData)`
   - `fetchCommunityTournaments(communityId)`
   - `registerForCommunityTournament(tournamentId)`
   - `submitOfflineScore(tournamentId, score)`

4. **src/services/communityPosts.ts**
   - `createPost(communityId, postData)`
   - `updatePost(postId, data)`
   - `deletePost(postId)`
   - `fetchPosts(communityId)`
   - `pinPost(postId)`

---

### Screen Components

**New Screens**:

1. **src/screens/communities/CommunitiesListScreen.tsx**
   - Browse all public communities
   - Search/filter
   - "My Communities" tab

2. **src/screens/communities/CommunityDetailScreen.tsx**
   - Community overview
   - Member count, stats
   - Join/Leave button
   - Tabs: Feed, Tournaments, Members, About

3. **src/screens/communities/CreateCommunityScreen.tsx**
   - Multi-step form
   - Community details
   - Settings (public/private, approval required)

4. **src/screens/communities/CommunitySettingsScreen.tsx**
   - Edit community (owner/manager only)
   - Member management
   - Delete community

5. **src/screens/communities/CommunityMembersScreen.tsx**
   - Member directory
   - Search members
   - Manage roles (for managers)

6. **src/screens/communities/CommunityTournamentsScreen.tsx**
   - Upcoming tournaments
   - Past tournaments
   - Create tournament button (manager only)

7. **src/screens/communities/CreateCommunityTournamentScreen.tsx**
   - Choose: Course-based or Offline
   - Tournament details
   - Registration settings

8. **src/screens/communities/OfflineTournamentScoringScreen.tsx**
   - Manual score entry for offline tournaments
   - Participant list
   - Submit scores (manager only)

9. **src/screens/communities/CommunityFeedScreen.tsx**
   - Activity feed
   - Announcements
   - Recent tournament results

10. **src/screens/communities/CommunityLeaderboardScreen.tsx**
    - Community-wide rankings
    - Filter by time period

---

### UI Components

**New Components**:

1. **src/components/CommunityCard.tsx**
   - Community preview card for lists

2. **src/components/CommunityHeader.tsx**
   - Cover image, logo, name, member count

3. **src/components/MemberCard.tsx**
   - Member info with role badge

4. **src/components/CommunityTournamentCard.tsx**
   - Tournament card with community context

5. **src/components/CommunityBadge.tsx**
   - Small community badge (for profile, tournament screens)

6. **src/components/PostCard.tsx**
   - Announcement/post display

7. **src/components/JoinCommunityButton.tsx**
   - Smart join/leave/request button

---

## Implementation Phases

### Phase 1: Core Community Infrastructure (Week 1-2)

**Goal**: Basic community creation and membership.

**Tasks**:
1. ✅ Database schema migration
2. ✅ Create `communities` service
3. ✅ Create `communityMembers` service
4. ✅ Build `CreateCommunityScreen`
5. ✅ Build `CommunitiesListScreen`
6. ✅ Build `CommunityDetailScreen` (basic)
7. ✅ Navigation setup
8. ✅ Add "Communities" tab to app navigation

**Deliverable**: Users can create, browse, and join communities.

---

### Phase 2: Community Tournaments (Week 3-4)

**Goal**: Enable tournament creation and management within communities.

**Tasks**:
1. ✅ Create `communityTournaments` service
2. ✅ Build `CreateCommunityTournamentScreen`
3. ✅ Build `CommunityTournamentsScreen`
4. ✅ Integrate with existing tournament system
5. ✅ Add community filter to tournament lists
6. ✅ Community-specific leaderboards

**Deliverable**: Communities can organize tournaments at golf courses.

---

### Phase 3: Offline Tournaments (Week 5)

**Goal**: Support tournaments not affiliated with courses.

**Tasks**:
1. ✅ Offline tournament schema
2. ✅ Build `OfflineTournamentScoringScreen`
3. ✅ Manual score entry interface
4. ✅ Offline tournament leaderboards
5. ✅ Score verification workflow (manager approval)

**Deliverable**: Communities can track results from external tournaments.

---

### Phase 4: Community Engagement (Week 6-7)

**Goal**: Social features for community interaction.

**Tasks**:
1. ✅ Create `communityPosts` service
2. ✅ Build `CommunityFeedScreen`
3. ✅ Announcements from managers
4. ✅ Community activity feed
5. ✅ Push notifications for community events
6. ✅ Member directory with search

**Deliverable**: Rich community interaction and communication.

---

### Phase 5: Management & Admin (Week 8)

**Goal**: Advanced management tools for community owners/managers.

**Tasks**:
1. ✅ Build `CommunitySettingsScreen`
2. ✅ Member role management
3. ✅ Invitation system
4. ✅ Membership approval workflow
5. ✅ Remove members functionality
6. ✅ Community statistics dashboard

**Deliverable**: Full-featured community administration.

---

### Phase 6: Polish & Optimization (Week 9)

**Goal**: Refine UX and optimize performance.

**Tasks**:
1. ✅ Add loading skeletons
2. ✅ Empty states
3. ✅ Error handling
4. ✅ Offline support for community data
5. ✅ Performance optimization (pagination, caching)
6. ✅ Translations (English + Spanish)

**Deliverable**: Production-ready communities feature.

---

## Detailed Implementation

### Phase 1 Implementation Details

#### 1.1 Database Migration

**File**: `supabase/migrations/YYYYMMDD_create_communities.sql`

```sql
-- Communities table
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  community_type TEXT CHECK (community_type IN (
    'golf_club',
    'social_group',
    'regional_association',
    'corporate_league'
  )) DEFAULT 'social_group',
  visibility TEXT CHECK (visibility IN ('public', 'private')) DEFAULT 'public',
  affiliated_course_id UUID REFERENCES courses,
  location TEXT,
  website TEXT,
  require_approval BOOLEAN DEFAULT false,
  max_members INTEGER,
  member_count INTEGER DEFAULT 0,
  tournament_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES golfer_profiles NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_communities_type ON communities(community_type);
CREATE INDEX idx_communities_visibility ON communities(visibility);
CREATE INDEX idx_communities_slug ON communities(slug);

-- RLS Policies
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Public communities visible to all
CREATE POLICY "Public communities are viewable by everyone"
  ON communities FOR SELECT
  USING (visibility = 'public');

-- Private communities only visible to members
CREATE POLICY "Private communities visible to members"
  ON communities FOR SELECT
  USING (
    visibility = 'private' AND
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = communities.id
        AND golfer_id = auth.uid()
        AND status = 'active'
    )
  );

-- Only authenticated users can create communities
CREATE POLICY "Authenticated users can create communities"
  ON communities FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Only owners can update communities
CREATE POLICY "Owners can update communities"
  ON communities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = communities.id
        AND golfer_id = auth.uid()
        AND role = 'owner'
    )
  );

-- Community members table (similar structure)
-- ... (rest of schema from Database Schema section above)
```

**Run Migration**:
```bash
# Via Supabase CLI
supabase migration up

# Or via Dashboard
# Paste SQL into SQL Editor and run
```

---

#### 1.2 Communities Service

**File**: `src/services/communities.ts`

```typescript
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/database.types';

type Community = Database['public']['Tables']['communities']['Row'];
type CommunityInsert = Database['public']['Tables']['communities']['Insert'];
type CommunityUpdate = Database['public']['Tables']['communities']['Update'];

export const communitiesService = {
  /**
   * Create a new community
   */
  async createCommunity(data: CommunityInsert) {
    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const { data: community, error } = await supabase
      .from('communities')
      .insert([{ ...data, slug }])
      .select()
      .single();

    if (error) throw error;

    // Automatically add creator as owner
    await supabase.from('community_members').insert([
      {
        community_id: community.id,
        golfer_id: data.created_by,
        role: 'owner',
        status: 'active'
      }
    ]);

    return community;
  },

  /**
   * Fetch all public communities with optional filters
   */
  async fetchCommunities(filters?: {
    type?: string;
    searchQuery?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('communities')
      .select(`
        *,
        created_by_profile:golfer_profiles!created_by(
          first_name,
          last_name,
          profile_image_url
        )
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (filters?.type) {
      query = query.eq('community_type', filters.type);
    }

    if (filters?.searchQuery) {
      query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  /**
   * Fetch community by ID
   */
  async fetchCommunityById(id: string) {
    const { data, error } = await supabase
      .from('communities')
      .select(`
        *,
        created_by_profile:golfer_profiles!created_by(
          first_name,
          last_name,
          profile_image_url,
          handicap
        ),
        affiliated_course:courses(
          id,
          name,
          city,
          state,
          logo_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch communities the current user is a member of
   */
  async fetchMyCommunities(golferId: string) {
    const { data, error } = await supabase
      .from('community_members')
      .select(`
        *,
        community:communities(
          *,
          created_by_profile:golfer_profiles!created_by(first_name, last_name)
        )
      `)
      .eq('golfer_id', golferId)
      .eq('status', 'active')
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data.map((item) => ({
      ...item.community,
      my_role: item.role
    }));
  },

  /**
   * Update community details
   */
  async updateCommunity(id: string, data: CommunityUpdate) {
    const { data: updated, error } = await supabase
      .from('communities')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  },

  /**
   * Delete community (owner only)
   */
  async deleteCommunity(id: string) {
    const { error } = await supabase
      .from('communities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Check if user is a member of community
   */
  async checkMembership(communityId: string, golferId: string) {
    const { data, error } = await supabase
      .from('community_members')
      .select('role, status')
      .eq('community_id', communityId)
      .eq('golfer_id', golferId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  }
};
```

---

#### 1.3 Community Members Service

**File**: `src/services/communityMembers.ts`

```typescript
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/database.types';

type CommunityMember = Database['public']['Tables']['community_members']['Row'];

export const communityMembersService = {
  /**
   * Join a community (request or auto-join)
   */
  async joinCommunity(communityId: string, golferId: string) {
    // Check if community requires approval
    const { data: community } = await supabase
      .from('communities')
      .select('require_approval')
      .eq('id', communityId)
      .single();

    const status = community?.require_approval ? 'pending' : 'active';

    const { data, error } = await supabase
      .from('community_members')
      .insert([
        {
          community_id: communityId,
          golfer_id: golferId,
          role: 'member',
          status
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Leave a community
   */
  async leaveCommunity(communityId: string, golferId: string) {
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('golfer_id', golferId);

    if (error) throw error;
  },

  /**
   * Fetch community members
   */
  async fetchMembers(communityId: string, filters?: { role?: string; status?: string }) {
    let query = supabase
      .from('community_members')
      .select(`
        *,
        golfer:golfer_profiles(
          id,
          first_name,
          last_name,
          email,
          profile_image_url,
          handicap
        )
      `)
      .eq('community_id', communityId);

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query.order('joined_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch pending membership requests (managers only)
   */
  async fetchMembershipRequests(communityId: string) {
    const { data, error } = await supabase
      .from('community_members')
      .select(`
        *,
        golfer:golfer_profiles(
          id,
          first_name,
          last_name,
          email,
          profile_image_url,
          handicap
        )
      `)
      .eq('community_id', communityId)
      .eq('status', 'pending')
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Approve membership request
   */
  async approveMembership(communityId: string, golferId: string) {
    const { data, error } = await supabase
      .from('community_members')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('community_id', communityId)
      .eq('golfer_id', golferId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Reject membership request
   */
  async rejectMembership(communityId: string, golferId: string) {
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('golfer_id', golferId)
      .eq('status', 'pending');

    if (error) throw error;
  },

  /**
   * Update member role (manager/owner only)
   */
  async updateMemberRole(
    communityId: string,
    golferId: string,
    newRole: 'owner' | 'manager' | 'member'
  ) {
    const { data, error } = await supabase
      .from('community_members')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('community_id', communityId)
      .eq('golfer_id', golferId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remove member from community
   */
  async removeMember(communityId: string, golferId: string) {
    const { error } = await supabase
      .from('community_members')
      .update({ status: 'removed', updated_at: new Date().toISOString() })
      .eq('community_id', communityId)
      .eq('golfer_id', golferId);

    if (error) throw error;
  }
};
```

---

#### 1.4 Create Community Screen

**File**: `src/screens/communities/CreateCommunityScreen.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communitiesService } from '@/services/communities';
import { useAuth } from '@/hooks/useAuth';
import { ChevronDown } from 'lucide-react-native';

const COMMUNITY_TYPES = [
  { value: 'golf_club', label: 'Golf Club' },
  { value: 'social_group', label: 'Social Group' },
  { value: 'regional_association', label: 'Regional Association' },
  { value: 'corporate_league', label: 'Corporate League' }
];

export const CreateCommunityScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [communityType, setCommunityType] = useState('social_group');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [requireApproval, setRequireApproval] = useState(false);
  const [location, setLocation] = useState('');

  const createMutation = useMutation({
    mutationFn: () =>
      communitiesService.createCommunity({
        name,
        description,
        community_type: communityType,
        visibility,
        require_approval: requireApproval,
        location,
        created_by: user.id
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['communities']);
      queryClient.invalidateQueries(['myCommunities']);

      Alert.alert(
        t('communities.create.success.title'),
        t('communities.create.success.message'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.navigate('CommunityDetail', { communityId: data.id })
          }
        ]
      );
    },
    onError: (error) => {
      console.error('Failed to create community:', error);
      Alert.alert(t('errors.title'), t('errors.createCommunityFailed'));
    }
  });

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert(t('errors.title'), t('communities.create.errors.nameRequired'));
      return;
    }

    createMutation.mutate();
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-charcoal">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t('communities.create.title')}
        </Text>

        {/* Community Name */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('communities.create.fields.name')}
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('communities.create.placeholders.name')}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
          />
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('communities.create.fields.description')}
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('communities.create.placeholders.description')}
            multiline
            numberOfLines={4}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
          />
        </View>

        {/* Community Type */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('communities.create.fields.type')}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {COMMUNITY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                onPress={() => setCommunityType(type.value)}
                className={`px-4 py-2 rounded-full border ${
                  communityType === type.value
                    ? 'bg-primary border-primary'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                }`}
              >
                <Text
                  className={
                    communityType === type.value
                      ? 'text-white font-semibold'
                      : 'text-gray-700 dark:text-gray-300'
                  }
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Visibility */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('communities.create.fields.visibility')}
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setVisibility('public')}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                visibility === 'public'
                  ? 'bg-primary border-primary'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              }`}
            >
              <Text
                className={
                  visibility === 'public'
                    ? 'text-white font-semibold text-center'
                    : 'text-gray-700 dark:text-gray-300 text-center'
                }
              >
                {t('communities.create.visibility.public')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVisibility('private')}
              className={`flex-1 px-4 py-3 rounded-lg border ${
                visibility === 'private'
                  ? 'bg-primary border-primary'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              }`}
            >
              <Text
                className={
                  visibility === 'private'
                    ? 'text-white font-semibold text-center'
                    : 'text-gray-700 dark:text-gray-300 text-center'
                }
              >
                {t('communities.create.visibility.private')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Require Approval */}
        <TouchableOpacity
          onPress={() => setRequireApproval(!requireApproval)}
          className="flex-row items-center mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <View
            className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
              requireApproval
                ? 'bg-primary border-primary'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {requireApproval && <Text className="text-white font-bold">✓</Text>}
          </View>
          <View className="flex-1">
            <Text className="font-medium text-gray-900 dark:text-white">
              {t('communities.create.fields.requireApproval')}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {t('communities.create.fields.requireApprovalDesc')}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Location */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('communities.create.fields.location')}
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder={t('communities.create.placeholders.location')}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity
          onPress={handleCreate}
          disabled={createMutation.isPending}
          className="bg-primary rounded-lg px-6 py-4"
        >
          <Text className="text-white font-semibold text-center text-lg">
            {createMutation.isPending
              ? t('common.creating')
              : t('communities.create.submit')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
```

---

### Phase 2-6: Additional Implementation

Due to length constraints, the remaining phases (2-6) follow similar patterns:

- **Phase 2**: Integrate community tournaments with existing tournament system
- **Phase 3**: Add offline tournament tables and manual scoring UI
- **Phase 4**: Build feed, posts, and notification system
- **Phase 5**: Admin screens with member management
- **Phase 6**: Polish with loading states, translations, error handling

Each phase builds incrementally on the foundation established in Phase 1.

---

## UI/UX Mockups

### Communities List Screen
```
┌─────────────────────────────┐
│  Communities                │
│  [Search bar]               │
├─────────────────────────────┤
│  Tabs: All | My Communities │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ [Cover Image]           │ │
│ │ 🏌️ Sunset Golf Club     │ │
│ │ 245 members • 12 tourn. │ │
│ │ Golf Club • Public      │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ [Cover Image]           │ │
│ │ 👥 Weekend Warriors     │ │
│ │ 18 members • 3 tourn.   │ │
│ │ Social Group • Private  │ │
│ └─────────────────────────┘ │
│  [+ Create Community]       │
└─────────────────────────────┘
```

### Community Detail Screen
```
┌─────────────────────────────┐
│  [Cover Image]              │
│  🏌️ Logo                    │
│  Sunset Golf Club           │
│  245 members                │
│  [Join] [Share]             │
├─────────────────────────────┤
│  Tabs: Feed|Tournaments     │
│         |Members|About      │
├─────────────────────────────┤
│  📢 Announcement            │
│  Spring Tournament - Apr 15 │
│  Register now!              │
├─────────────────────────────┤
│  🏆 Upcoming Tournaments    │
│  • Spring Championship      │
│    Pebble Beach • Apr 15    │
│  • Monthly Scramble         │
│    (Offline) • Apr 22       │
└─────────────────────────────┘
```

---

## Navigation Structure

### Updated App Navigation

```
AppTabs
  ├── Home
  ├── TeeTimesTab
  ├── TournamentsTab
  ├── RoundsTab
  ├── CommunitiesTab (NEW)
  │   ├── CommunitiesListScreen
  │   ├── CommunityDetailScreen
  │   │   ├── CommunityFeedScreen
  │   │   ├── CommunityTournamentsScreen
  │   │   ├── CommunityMembersScreen
  │   │   └── CommunityAboutScreen
  │   ├── CreateCommunityScreen
  │   ├── CommunitySettingsScreen
  │   ├── CreateCommunityTournamentScreen
  │   └── OfflineTournamentScoringScreen
  └── ProfileTab
```

---

## Testing Strategy

### Unit Tests
- Service methods (communities, members, tournaments)
- Utility functions (slug generation, permission checks)

### Integration Tests
- Community creation flow
- Join/leave community
- Tournament creation within community
- Member management

### E2E Tests (Manual)
1. Create community
2. Invite members
3. Create tournament
4. Register for tournament
5. Submit scores

---

## Rollout Plan

### Beta Phase (2 weeks)
- Invite 50-100 golfers to test
- Focus on bug fixes
- Collect feedback

### Public Launch
- Announce via push notifications
- Email campaign
- In-app banner

### Post-Launch
- Monitor usage metrics
- Iterate based on feedback
- Add requested features

---

**End of Communities Feature Plan** | Last Updated: 2025-12-05
