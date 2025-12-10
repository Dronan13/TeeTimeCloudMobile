# TeeTime Cloud Mobile — Knowledge Base

**Last Updated**: 2025-12-05
**Version**: 1.0.0
**Purpose**: Comprehensive technical reference for developers and AI assistants working on TeeTime Cloud Mobile.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Project Structure](#project-structure)
6. [Core Features](#core-features)
7. [Code Patterns & Conventions](#code-patterns--conventions)
8. [Service Layer Documentation](#service-layer-documentation)
9. [State Management](#state-management)
10. [Internationalization](#internationalization)
11. [Offline & Sync Architecture](#offline--sync-architecture)
12. [Navigation Structure](#navigation-structure)
13. [UI/UX Design System](#uiux-design-system)
14. [Testing & Quality](#testing--quality)
15. [Deployment](#deployment)
16. [Common Tasks](#common-tasks)

---

## Project Overview

**TeeTime Cloud** is a premium mobile application for golf course management and tournament operations, built with React Native (Expo) and Supabase.

### Key Capabilities
- Golf course discovery and tee time reservations
- Tournament management with live scoring
- Personal round tracking with offline support
- Real-time leaderboards
- Multi-language support (English/Spanish)
- Weather integration
- RSS news feed

### Target Users
1. **Golfers**: Book tee times, track personal rounds, join tournaments
2. **Course Managers**: Manage courses, tee times, events
3. **Tournament Organizers**: Create and manage tournaments
4. **Future**: Community managers, Ryder Cup team coordinators

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Mobile App (Expo)                    │
│  ┌────────────┬──────────────┬─────────────────────┐   │
│  │   Screens  │  Components  │  Navigation Stacks  │   │
│  └────────────┴──────────────┴─────────────────────┘   │
│  ┌────────────┬──────────────┬─────────────────────┐   │
│  │   Hooks    │   Contexts   │   React Query       │   │
│  └────────────┴──────────────┴─────────────────────┘   │
│  ┌────────────┬──────────────┬─────────────────────┐   │
│  │  Services  │    Utils     │   Local Storage     │   │
│  └────────────┴──────────────┴─────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         ↓ ↑
                    Supabase API
┌─────────────────────────────────────────────────────────┐
│                    Supabase Backend                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database (RLS enabled)               │  │
│  │  - golfer_profiles, courses, tournaments, etc.   │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Auth (Supabase Auth)                            │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Storage (for images, assets)                    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓ ↑
              External APIs (Weather, etc.)
```

### Provider Hierarchy (App.tsx)

```tsx
<SafeAreaProvider>
  <LanguageProvider>
    <ThemeProvider>
      <QueryClientProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </LanguageProvider>
</SafeAreaProvider>
```

**Critical Order**: Language → Theme → Query → Auth → Navigation

---

## Technology Stack

### Core Framework
| Package | Version | Purpose |
|---------|---------|---------|
| React Native | 0.76.9 | Mobile framework |
| Expo | 52.0.0 | Development platform |
| TypeScript | 5.3.3 | Type safety |

### Backend & Database
| Package | Version | Purpose |
|---------|---------|---------|
| @supabase/supabase-js | 2.39.0 | Backend client |
| PostgreSQL | - | Database (via Supabase) |

### State Management
| Package | Version | Purpose |
|---------|---------|---------|
| @tanstack/react-query | 5.17.9 | Async state, caching |
| React Context API | - | Global state (theme, lang, auth) |
| @react-native-async-storage/async-storage | 2.1.0 | Local persistence |

### Navigation
| Package | Version | Purpose |
|---------|---------|---------|
| @react-navigation/native | 6.x | Navigation core |
| @react-navigation/bottom-tabs | 6.x | Tab navigator |
| @react-navigation/stack | 6.x | Stack navigator |

### UI & Styling
| Package | Version | Purpose |
|---------|---------|---------|
| nativewind | 4.2.1 | Tailwind for RN |
| tailwindcss | 3.3.2 | Utility-first CSS |
| lucide-react-native | Latest | Icon library |
| expo-linear-gradient | Latest | Gradient components |

### Internationalization
| Package | Version | Purpose |
|---------|---------|---------|
| i18next | 25.7.1 | i18n framework |
| react-i18next | 15.2.2 | React integration |

### Monitoring & Analytics
| Package | Version | Purpose |
|---------|---------|---------|
| @sentry/react-native | 6.10.0 | Error tracking |

### Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| date-fns | Latest | Date manipulation |
| dayjs | Latest | Date parsing |
| react-hook-form | Latest | Form management |
| zod | Latest | Schema validation |
| expo-image-picker | Latest | Image selection |

---

## Database Schema

### Core Tables

#### `golfer_profiles`
User golf profile data.
```sql
CREATE TABLE golfer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  handicap NUMERIC,
  home_course_id UUID REFERENCES courses,
  profile_image_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `courses`
Golf course information.
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `tee_boxes`
Course tee configurations.
```sql
CREATE TABLE tee_boxes (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses,
  name TEXT NOT NULL,
  color TEXT,
  rating NUMERIC,
  slope INTEGER,
  yardage INTEGER,
  created_at TIMESTAMP
);
```

#### `tournaments`
Tournament metadata.
```sql
CREATE TABLE tournaments (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses,
  start_date DATE,
  end_date DATE,
  format TEXT,
  status TEXT,
  max_participants INTEGER,
  registration_deadline DATE,
  created_by UUID REFERENCES golfer_profiles,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `tournament_rounds`
Individual tournament round scores.
```sql
CREATE TABLE tournament_rounds (
  id UUID PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments,
  golfer_id UUID REFERENCES golfer_profiles,
  round_number INTEGER,
  tee_box_id UUID REFERENCES tee_boxes,
  status TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `tournament_scores`
Hole-by-hole tournament scoring.
```sql
CREATE TABLE tournament_scores (
  id UUID PRIMARY KEY,
  tournament_round_id UUID REFERENCES tournament_rounds,
  hole_number INTEGER,
  strokes INTEGER,
  putts INTEGER,
  fairway_hit BOOLEAN,
  green_in_regulation BOOLEAN,
  sand_save_attempt BOOLEAN,
  sand_save_made BOOLEAN,
  dispute_flag BOOLEAN DEFAULT false,
  dispute_note TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `golf_rounds`
Personal round records.
```sql
CREATE TABLE golf_rounds (
  id UUID PRIMARY KEY,
  golfer_id UUID REFERENCES golfer_profiles,
  course_id UUID REFERENCES courses,
  tee_box_id UUID REFERENCES tee_boxes,
  date DATE,
  status TEXT,
  total_strokes INTEGER,
  handicap_differential NUMERIC,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `golf_round_holes`
Individual hole scores for personal rounds.
```sql
CREATE TABLE golf_round_holes (
  id UUID PRIMARY KEY,
  golf_round_id UUID REFERENCES golf_rounds,
  hole_number INTEGER,
  strokes INTEGER,
  putts INTEGER,
  fairway_hit BOOLEAN,
  green_in_regulation BOOLEAN,
  sand_save_attempt BOOLEAN,
  sand_save_made BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `tee_time_slots`
Available tee times.
```sql
CREATE TABLE tee_time_slots (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses,
  date DATE,
  time TIME,
  max_players INTEGER,
  price NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);
```

#### `tee_time_reservations`
User reservations.
```sql
CREATE TABLE tee_time_reservations (
  id UUID PRIMARY KEY,
  tee_time_slot_id UUID REFERENCES tee_time_slots,
  golfer_id UUID REFERENCES golfer_profiles,
  num_players INTEGER,
  add_ons JSONB,
  status TEXT,
  total_price NUMERIC,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Database Views

#### `golf_round_details`
Aggregated personal round data with calculated statistics.

#### `golf_round_holes_details`
Enhanced hole data with par information from course.

#### `tournament_leaderboard_dense_rank`
Optimized leaderboard calculations with rank.

#### `tee_time_reservations_with_slot`
Joined reservation + slot data for easier querying.

### Key Relationships

```
golfer_profiles
  ├── golf_rounds (1:many)
  ├── tournament_rounds (1:many)
  ├── tee_time_reservations (1:many)
  └── home_course → courses

courses
  ├── tee_boxes (1:many)
  ├── tournaments (1:many)
  ├── tee_time_slots (1:many)
  └── course_gallery (1:many)

tournaments
  ├── tournament_rounds (1:many)
  └── tournament_groups (1:many)

tournament_rounds
  └── tournament_scores (1:many)

golf_rounds
  └── golf_round_holes (1:many)
```

---

## Project Structure

```
/Users/Mikhail/TeeTimeCloud/TeeTimeCloudMobile/
│
├── .claude/                         # AI assistant context
│   ├── CLAUDE.md                    # System prompt & coding guidelines
│   └── plans/                       # Feature planning documents
│
├── .docs/                           # Project documentation
│   ├── KNOWLEDGE_BASE.md            # This file
│   ├── CURRENT_ISSUES.md            # Bug & issue tracking
│   ├── IMPROVEMENT_PLAN.md          # Enhancement roadmap
│   ├── FEATURE_COMMUNITIES.md       # Communities feature plan
│   └── FEATURE_RYDER_CUP.md         # Ryder Cup feature plan
│
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── ScorecardGrid.tsx
│   │   ├── ScoreInput.tsx
│   │   ├── TournamentCard.tsx
│   │   ├── MyTournamentCard.tsx
│   │   ├── LeaderboardCard.tsx
│   │   ├── DisputeButton.tsx
│   │   ├── DisputeFlagBadge.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── ThemeToggle.tsx
│   │   └── RSSArticleCard.tsx
│   │
│   ├── contexts/                    # React Context providers
│   │   ├── ThemeContext.tsx         # Dark/light mode
│   │   └── LanguageContext.tsx      # i18n language switching
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.tsx              # Authentication context & methods
│   │   ├── useNetworkStatus.ts      # Network detection (AppState)
│   │   └── useThemedStyles.ts       # Dynamic styling by theme
│   │
│   ├── lib/                         # Third-party integrations
│   │   ├── supabaseClient.ts        # Supabase initialization
│   │   └── storage.ts               # AsyncStorage utilities
│   │
│   ├── locales/                     # Internationalization files
│   │   ├── en.json                  # English translations (496 lines)
│   │   └── es.json                  # Spanish translations (496 lines)
│   │
│   ├── navigation/                  # Navigation configuration
│   │   ├── RootNavigator.tsx        # Auth/App stack routing
│   │   ├── AuthStack.tsx            # Unauthenticated screens
│   │   ├── AppTabs.tsx              # Main bottom tab navigator
│   │   ├── TournamentsStack.tsx     # Tournament-related screens
│   │   └── ProfileStack.tsx         # Profile & settings screens
│   │
│   ├── screens/                     # Screen components (26 total)
│   │   ├── LandingScreen.tsx        # Onboarding/marketing
│   │   ├── SignInScreen.tsx         # Login
│   │   ├── ForgotPasswordScreen.tsx
│   │   ├── UpdatePasswordScreen.tsx
│   │   ├── HomeScreen.tsx           # Main dashboard (31.6 KB)
│   │   ├── CoursesScreen.tsx        # Course browser
│   │   ├── CourseDetailScreen.tsx   # Course info + gallery
│   │   ├── CourseTeeTimesScreen.tsx # Tee time date picker
│   │   ├── ReservationScreen.tsx    # Booking form
│   │   ├── TeeTimesScreen.tsx       # User's reservations
│   │   ├── ProfileScreen.tsx
│   │   ├── ProfileEditScreen.tsx
│   │   ├── RSSArticlesScreen.tsx    # News feed
│   │   ├── NotificationsScreen.tsx
│   │   ├── SupportScreen.tsx
│   │   ├── TermsOfUseScreen.tsx
│   │   │
│   │   ├── tournaments/             # Tournament screens (6)
│   │   │   ├── TournamentListScreen.tsx
│   │   │   ├── TournamentDetailScreen.tsx
│   │   │   ├── TournamentRegistrationScreen.tsx
│   │   │   ├── TournamentGroupListScreen.tsx
│   │   │   ├── ScorecardScreen.tsx          # Live tournament scoring (16 KB)
│   │   │   └── LeaderboardScreen.tsx
│   │   │
│   │   └── rounds/                  # Personal round screens (4)
│   │       ├── RoundsListScreen.tsx
│   │       ├── NewRoundScreen.tsx
│   │       ├── PersonalScorecardScreen.tsx  # Personal scoring (27 KB)
│   │       └── RoundDetailScreen.tsx
│   │
│   ├── services/                    # API & business logic (8 services)
│   │   ├── courses.ts               # Course operations (3.7 KB)
│   │   ├── golfRounds.ts            # Personal round management (16.7 KB)
│   │   ├── tournaments.ts           # Tournament operations (10.6 KB)
│   │   ├── teeTimes.ts              # Tee time availability (4.7 KB)
│   │   ├── reservations.ts          # Reservation handling (3.8 KB)
│   │   ├── weather.ts               # Weather API integration (4.2 KB)
│   │   ├── notifications.ts         # Notification management (3.1 KB)
│   │   └── rssArticles.ts           # RSS feed fetching (1.4 KB)
│   │
│   ├── types/                       # TypeScript definitions
│   │   ├── database.types.ts        # Generated Supabase types
│   │   ├── supabase.ts              # Custom Supabase types
│   │   └── index.ts                 # Re-exports
│   │
│   └── utils/                       # Utility modules (5 files)
│       ├── personalRoundSync.ts     # Offline sync for personal rounds
│       ├── scorecardSync.ts         # Offline sync for tournament scores
│       ├── statsCalculations.ts     # Golf statistics formulas
│       ├── handicapCalculations.ts  # Handicap differential
│       └── dateHelpers.ts           # Date formatting utilities
│
├── App.tsx                          # Root entry point with providers
├── app.json                         # Expo configuration
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.js               # Tailwind CSS setup
├── babel.config.js                  # Babel plugins
├── .prettierrc                      # Code formatting rules
├── .eslintrc.js                     # Linting rules
└── eas.json                         # Expo Application Services config
```

**Total Codebase**: 21,400 lines of TypeScript/TSX across 64 files.

---

## Core Features

### 1. Authentication & User Management

**File**: [src/hooks/useAuth.tsx](src/hooks/useAuth.tsx)

**Capabilities**:
- Email/password sign-in via Supabase Auth
- Password reset with deep linking (`teetimecloud://update-password`)
- Profile fetching from `golfer_profiles` table
- Session persistence with AsyncStorage
- Real-time auth state listening

**Key Functions**:
```typescript
const { user, profile, signIn, signOut, loading } = useAuth();

// Sign in
await signIn(email, password);

// Sign out
await signOut();

// Password reset
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'teetimecloud://update-password'
});
```

**RLS**: Enabled on `golfer_profiles` table.

---

### 2. Golf Course Management

**File**: [src/services/courses.ts](src/services/courses.ts)

**Capabilities**:
- Course search with filters (city, state, name)
- Paginated course listing (10 per page)
- Course details with tee boxes and gallery
- Course event calendar

**Key Functions**:
```typescript
import { coursesService } from '@/services/courses';

// Fetch courses with pagination
const { data } = await coursesService.fetchCourses({
  page: 1,
  limit: 10,
  searchQuery: 'Pebble Beach',
  city: 'Monterey',
  state: 'CA'
});

// Get course details
const course = await coursesService.fetchCourseById(courseId);
```

**Screens**:
- [CoursesScreen.tsx](src/screens/CoursesScreen.tsx) - Course browser
- [CourseDetailScreen.tsx](src/screens/CourseDetailScreen.tsx) - Full course info

---

### 3. Tournament Operations

**File**: [src/services/tournaments.ts](src/services/tournaments.ts)

**Capabilities**:
- Tournament listing (paginated)
- Tournament registration
- Live scorecard entry
- Dispute flag system
- Real-time leaderboard
- Group/flight management

**Key Functions**:
```typescript
import { tournamentsService } from '@/services/tournaments';

// Fetch tournaments
const tournaments = await tournamentsService.fetchTournaments();

// Register for tournament
await tournamentsService.registerForTournament(tournamentId, teeBoxId);

// Submit hole score
await tournamentsService.updateHoleScore(
  tournamentRoundId,
  holeNumber,
  scoreData
);

// Fetch leaderboard
const leaderboard = await tournamentsService.fetchLeaderboard(tournamentId);
```

**Screens**:
- [TournamentListScreen.tsx](src/screens/tournaments/TournamentListScreen.tsx)
- [TournamentDetailScreen.tsx](src/screens/tournaments/TournamentDetailScreen.tsx)
- [ScorecardScreen.tsx](src/screens/tournaments/ScorecardScreen.tsx) - Live scoring (16 KB)
- [LeaderboardScreen.tsx](src/screens/tournaments/LeaderboardScreen.tsx)
- [TournamentGroupListScreen.tsx](src/screens/tournaments/TournamentGroupListScreen.tsx)

**Offline Support**: Sync queue with 30-second auto-sync interval.

---

### 4. Personal Round Tracking

**File**: [src/services/golfRounds.ts](src/services/golfRounds.ts)

**Capabilities**:
- Create new personal rounds
- Hole-by-hole scorecard entry
- Statistics calculation (GIR, putts, fairways, sand saves)
- Handicap differential calculation
- Offline-first architecture with sync queue

**Key Functions**:
```typescript
import { golfRoundsService } from '@/services/golfRounds';

// Create round
const roundId = await golfRoundsService.createRound({
  courseId,
  teeBoxId,
  date: new Date()
});

// Save hole score
await golfRoundsService.saveHoleScore(roundId, holeNumber, {
  strokes: 4,
  putts: 2,
  fairwayHit: true,
  greenInRegulation: false
});

// Complete round
await golfRoundsService.completeRound(roundId);
```

**Screens**:
- [RoundsListScreen.tsx](src/screens/rounds/RoundsListScreen.tsx)
- [NewRoundScreen.tsx](src/screens/rounds/NewRoundScreen.tsx)
- [PersonalScorecardScreen.tsx](src/screens/rounds/PersonalScorecardScreen.tsx) - Main scoring (27 KB)
- [RoundDetailScreen.tsx](src/screens/rounds/RoundDetailScreen.tsx)

**Offline Support**: Full offline capability with AppState-triggered sync.

---

### 5. Tee Time Reservations

**File**: [src/services/teeTimes.ts](src/services/teeTimes.ts)

**Capabilities**:
- Check available tee time slots by date
- Calculate availability (max players - reservations)
- Slot-specific reservation form
- Add-ons support (cart, caddy, clubs, push cart, assistance)

**Key Functions**:
```typescript
import { teeTimesService } from '@/services/teeTimes';

// Fetch available slots
const slots = await teeTimesService.fetchTeeTimeSlots(courseId, date);

// Create reservation
await reservationsService.createReservation({
  teeTimeSlotId,
  numPlayers: 4,
  addOns: ['golf_cart', 'caddy']
});
```

**Screens**:
- [CourseTeeTimesScreen.tsx](src/screens/CourseTeeTimesScreen.tsx) - Date picker
- [ReservationScreen.tsx](src/screens/ReservationScreen.tsx) - Booking form
- [TeeTimesScreen.tsx](src/screens/TeeTimesScreen.tsx) - User's reservations

---

### 6. Weather Integration

**File**: [src/services/weather.ts](src/services/weather.ts)

**Capabilities**:
- Current conditions by location
- 3-day forecast
- Temperature, wind, precipitation, humidity

**API**: WeatherAPI.com

**Usage**:
```typescript
import { weatherService } from '@/services/weather';

const weather = await weatherService.fetchWeather(city);
// Returns: { current: {...}, forecast: [{...}] }
```

**Displayed On**: [HomeScreen.tsx](src/screens/HomeScreen.tsx)

**⚠️ Security Issue**: API key currently hardcoded (should be in `.env`).

---

### 7. Notifications

**File**: [src/services/notifications.ts](src/services/notifications.ts)

**Capabilities**:
- Fetch user notifications
- Mark as read

**Screens**: [NotificationsScreen.tsx](src/screens/NotificationsScreen.tsx)

**Note**: Implementation appears minimal; no deep linking configured yet.

---

### 8. RSS Articles

**File**: [src/services/rssArticles.ts](src/services/rssArticles.ts)

**Capabilities**:
- Fetch RSS feed articles
- Display in card format

**Screens**: [RSSArticlesScreen.tsx](src/screens/RSSArticlesScreen.tsx)

**Component**: [RSSArticleCard.tsx](src/components/RSSArticleCard.tsx)

---

## Code Patterns & Conventions

### Service Layer Pattern

All business logic lives in `src/services/`. Each service exports a named object:

```typescript
// src/services/example.ts
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/database.types';

export const exampleService = {
  async fetchItems() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data;
  },

  async createItem(item: ItemInput) {
    const { data, error } = await supabase
      .from('items')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
```

**Import**: `import { exampleService } from '@/services/example';`

---

### Component Pattern

Functional components with TypeScript types:

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ExampleCardProps {
  title: string;
  onPress: () => void;
}

export const ExampleCard: React.FC<ExampleCardProps> = ({ title, onPress }) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity onPress={onPress}>
      <View className="p-4 bg-white rounded-lg">
        <Text className="text-lg font-semibold">{title}</Text>
      </View>
    </TouchableOpacity>
  );
};
```

**Naming**: `PascalCase` for components, `camelCase` for props.

---

### Screen Pattern

Screens use React Query for data fetching:

```typescript
import React from 'react';
import { View, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { exampleService } from '@/services/example';

export const ExampleScreen = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['examples'],
    queryFn: exampleService.fetchItems,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <ExampleCard {...item} />}
      keyExtractor={(item) => item.id}
    />
  );
};
```

---

### Error Handling Pattern

Consistent try-catch with error logging:

```typescript
try {
  const result = await someOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw error; // Re-throw for caller to handle
}
```

**Note**: Most catch blocks currently use `error: any`. Should be replaced with `Error` type.

---

### Styling Pattern

Prefer NativeWind classes, use StyleSheet for complex/dynamic styles:

```typescript
// Simple: NativeWind
<View className="p-4 bg-white dark:bg-gray-800 rounded-lg">
  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
    Title
  </Text>
</View>

// Complex: StyleSheet
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: isDark ? '#1a1d21' : '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  }
});

<View style={styles.container}>...</View>
```

---

### Internationalization Pattern

Use `useTranslation` hook in all components:

```typescript
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();

  return <Text>{t('screens.home.welcome')}</Text>;
};
```

**Translation Files**:
- [src/locales/en.json](src/locales/en.json)
- [src/locales/es.json](src/locales/es.json)

**Key Format**: `category.subcategory.key` (e.g., `screens.tournaments.leaderboard.title`)

---

## Service Layer Documentation

### courses.ts

**File**: [src/services/courses.ts](src/services/courses.ts) (3.7 KB)

**Methods**:
```typescript
coursesService.fetchCourses({ page, limit, searchQuery, city, state })
coursesService.fetchCourseById(id)
coursesService.fetchTeeBoxes(courseId)
coursesService.fetchCourseGallery(courseId)
coursesService.fetchCourseEvents(courseId)
```

**Returns**: Only active courses (`is_active = true`).

---

### golfRounds.ts

**File**: [src/services/golfRounds.ts](src/services/golfRounds.ts) (16.7 KB)

**Methods**:
```typescript
golfRoundsService.createRound({ courseId, teeBoxId, date })
golfRoundsService.fetchRounds(golferId)
golfRoundsService.fetchRoundDetails(roundId)
golfRoundsService.saveHoleScore(roundId, holeNumber, scoreData)
golfRoundsService.completeRound(roundId)
golfRoundsService.deleteRound(roundId)
```

**Special Features**:
- Handicap differential calculation
- Statistics aggregation (GIR, putts, etc.)
- Offline sync integration

---

### tournaments.ts

**File**: [src/services/tournaments.ts](src/services/tournaments.ts) (10.6 KB)

**Methods**:
```typescript
tournamentsService.fetchTournaments()
tournamentsService.fetchTournamentById(id)
tournamentsService.fetchMyTournaments(golferId)
tournamentsService.registerForTournament(tournamentId, teeBoxId)
tournamentsService.fetchTournamentGroups(tournamentId)
tournamentsService.updateHoleScore(roundId, holeNumber, scoreData)
tournamentsService.fetchLeaderboard(tournamentId)
tournamentsService.submitDispute(scoreId, note)
```

**Special Features**:
- Dispute flag system
- Dense rank leaderboard view
- Group/flight player lists

---

### teeTimes.ts

**File**: [src/services/teeTimes.ts](src/services/teeTimes.ts) (4.7 KB)

**Methods**:
```typescript
teeTimesService.fetchTeeTimeSlots(courseId, date)
teeTimesService.checkAvailability(slotId)
```

**Availability Calculation**: `max_players - COUNT(reservations)`

---

### reservations.ts

**File**: [src/services/reservations.ts](src/services/reservations.ts) (3.8 KB)

**Methods**:
```typescript
reservationsService.createReservation({ teeTimeSlotId, numPlayers, addOns })
reservationsService.fetchMyReservations(golferId)
reservationsService.cancelReservation(reservationId)
```

**Add-Ons**: `golf_cart`, `caddy`, `clubs`, `push_cart`, `assistance`

---

### weather.ts

**File**: [src/services/weather.ts](src/services/weather.ts) (4.2 KB)

**Methods**:
```typescript
weatherService.fetchWeather(location)
```

**Returns**:
```typescript
{
  current: {
    temp_f, condition, wind_mph, humidity, feelslike_f
  },
  forecast: [
    { date, maxtemp_f, mintemp_f, condition, chance_of_rain }
  ]
}
```

**API**: WeatherAPI.com (3-day forecast)

---

### notifications.ts

**File**: [src/services/notifications.ts](src/services/notifications.ts) (3.1 KB)

**Methods**:
```typescript
notificationsService.fetchNotifications(golferId)
notificationsService.markAsRead(notificationId)
```

---

### rssArticles.ts

**File**: [src/services/rssArticles.ts](src/services/rssArticles.ts) (1.4 KB)

**Methods**:
```typescript
rssArticlesService.fetchArticles()
```

**Note**: Minimal implementation; likely fetches from `app_config` or external RSS.

---

## State Management

### React Query Configuration

**File**: [App.tsx](App.tsx)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      gcTime: 10 * 60 * 1000,     // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});
```

**Query Keys Pattern**:
```typescript
['courses']
['courses', courseId]
['tournaments']
['tournaments', tournamentId]
['myTournaments', golferId]
['leaderboard', tournamentId]
['golfRounds', golferId]
['roundDetails', roundId]
```

---

### Context APIs

#### AuthContext

**File**: [src/hooks/useAuth.tsx](src/hooks/useAuth.tsx)

**Provides**:
```typescript
{
  user: User | null,
  profile: GolferProfile | null,
  loading: boolean,
  signIn: (email, password) => Promise<void>,
  signOut: () => Promise<void>
}
```

**Usage**: `const { user, profile, signIn } = useAuth();`

---

#### ThemeContext

**File**: [src/contexts/ThemeContext.tsx](src/contexts/ThemeContext.tsx)

**Provides**:
```typescript
{
  isDark: boolean,
  toggleTheme: () => void,
  colors: ThemeColors
}
```

**Persistence**: AsyncStorage key `@teetimecloud_theme`

---

#### LanguageContext

**File**: [src/contexts/LanguageContext.tsx](src/contexts/LanguageContext.tsx)

**Provides**:
```typescript
{
  language: 'en' | 'es',
  changeLanguage: (lang: 'en' | 'es') => void
}
```

**Persistence**: AsyncStorage key `@teetimecloud_language`

---

### Local Storage (AsyncStorage)

**Keys Used**:
- `@teetimecloud_session`: Auth session
- `@teetimecloud_language`: Selected language
- `@teetimecloud_theme`: Dark/light mode
- `golf_round_{roundId}`: Offline round data
- `round_sync_queue`: Pending sync operations
- `scorecard_scores_{tournamentRoundId}`: Tournament score cache
- `scorecard_sync_queue`: Pending tournament score updates

**Utils**: [src/lib/storage.ts](src/lib/storage.ts)

---

## Internationalization

### Setup

**Library**: i18next + react-i18next

**Initialization**: [src/contexts/LanguageContext.tsx](src/contexts/LanguageContext.tsx)

```typescript
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: require('@/locales/en.json') },
      es: { translation: require('@/locales/es.json') }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });
```

---

### Translation Files

**English**: [src/locales/en.json](src/locales/en.json) (496 lines)
**Spanish**: [src/locales/es.json](src/locales/es.json) (496 lines)

**Structure**:
```json
{
  "common": {
    "buttons": { "save": "Save", "cancel": "Cancel" },
    "labels": { "email": "Email", "password": "Password" }
  },
  "screens": {
    "home": { "welcome": "Welcome" },
    "tournaments": { "title": "Tournaments" }
  },
  "errors": {
    "network": "Network error",
    "generic": "Something went wrong"
  }
}
```

---

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();

  return (
    <>
      <Text>{t('common.buttons.save')}</Text>
      <Text>{t('screens.home.welcome', { name: 'John' })}</Text>
    </>
  );
};
```

---

### Language Switching

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <Button onPress={() => changeLanguage(language === 'en' ? 'es' : 'en')}>
      {language.toUpperCase()}
    </Button>
  );
};
```

**Component**: [src/components/LanguageSelector.tsx](src/components/LanguageSelector.tsx)

---

## Offline & Sync Architecture

### Personal Round Sync

**File**: [src/utils/personalRoundSync.ts](src/utils/personalRoundSync.ts)

**Architecture**:
1. **Local Storage**: Hole scores saved to AsyncStorage (`golf_round_{roundId}`)
2. **Sync Queue**: Pending updates stored in `round_sync_queue`
3. **AppState Listener**: Syncs when app resumes from background
4. **Manual Trigger**: Can manually call `syncPendingRoundUpdates()`

**Flow**:
```
User enters score
  ↓
Save to AsyncStorage (instant)
  ↓
Add to sync queue
  ↓
App goes to background
  ↓
App returns to foreground (AppState: active)
  ↓
Sync queue processed
  ↓
Upload to Supabase
  ↓
Clear from queue on success
```

**Key Functions**:
```typescript
import {
  saveRoundLocally,
  loadRoundLocally,
  syncPendingRoundUpdates
} from '@/utils/personalRoundSync';

// Save hole score locally
await saveRoundLocally(roundId, holeNumber, scoreData);

// Load round from cache
const cachedRound = await loadRoundLocally(roundId);

// Manually trigger sync
await syncPendingRoundUpdates();
```

---

### Tournament Scorecard Sync

**File**: [src/utils/scorecardSync.ts](src/utils/scorecardSync.ts)

**Architecture**:
1. **Score State Persistence**: Current scorecard state cached
2. **30-Second Auto-Sync**: Interval-based background sync
3. **Queue-Based Updates**: Multiple hole updates batched
4. **Network Status Awareness**: Checks network before sync

**Flow**:
```
User enters tournament score
  ↓
Update local state (instant)
  ↓
Save to AsyncStorage
  ↓
Add to sync queue
  ↓
Every 30 seconds:
  ↓
Process sync queue
  ↓
Upload to Supabase (batch)
  ↓
Clear from queue on success
```

**Key Functions**:
```typescript
import {
  saveScorecardLocally,
  loadScorecardLocally,
  syncScorecardUpdates
} from '@/utils/scorecardSync';

// Cache scorecard state
await saveScorecardLocally(tournamentRoundId, scores);

// Load cached scorecard
const cachedScores = await loadScorecardLocally(tournamentRoundId);

// Trigger sync
await syncScorecardUpdates(tournamentRoundId);
```

**Used In**: [src/screens/tournaments/ScorecardScreen.tsx](src/screens/tournaments/ScorecardScreen.tsx)

---

### Network Detection

**File**: [src/hooks/useNetworkStatus.ts](src/hooks/useNetworkStatus.ts)

**Current Implementation**:
- Monitors `AppState` (foreground/background)
- Returns `isConnected` boolean

**⚠️ Limitation**: Does not detect real network status (WiFi/cellular on/off).

**TODO**: Integrate `@react-native-community/netinfo` for production.

---

## Navigation Structure

### RootNavigator

**File**: [src/navigation/RootNavigator.tsx](src/navigation/RootNavigator.tsx)

**Structure**:
```
RootNavigator
  ├── AuthStack (if !user)
  │   ├── Landing
  │   ├── SignIn
  │   ├── ForgotPassword
  │   └── UpdatePassword
  │
  └── AppTabs (if user)
      ├── Home (Stack)
      │   ├── HomeScreen
      │   ├── CoursesScreen
      │   ├── CourseDetailScreen
      │   ├── CourseTeeTimesScreen
      │   ├── ReservationScreen
      │   └── RSSArticlesScreen
      │
      ├── TeeTimesTab
      │   └── TeeTimesScreen
      │
      ├── TournamentsStack
      │   ├── TournamentListScreen
      │   ├── TournamentDetailScreen
      │   ├── TournamentRegistrationScreen
      │   ├── TournamentGroupListScreen
      │   ├── ScorecardScreen
      │   └── LeaderboardScreen
      │
      ├── RoundsStack
      │   ├── RoundsListScreen
      │   ├── NewRoundScreen
      │   ├── PersonalScorecardScreen
      │   └── RoundDetailScreen
      │
      └── ProfileStack
          ├── ProfileScreen
          ├── ProfileEditScreen
          ├── UpdatePasswordScreen
          ├── NotificationsScreen
          ├── SupportScreen
          └── TermsOfUseScreen
```

---

### AppTabs Configuration

**File**: [src/navigation/AppTabs.tsx](src/navigation/AppTabs.tsx)

**5 Tabs**:
1. **Home**: Golf flag icon (main dashboard)
2. **Tee Times**: Calendar icon (reservations)
3. **Tournaments**: Trophy icon (tournament operations)
4. **Rounds**: Target icon (personal rounds)
5. **Profile**: User icon (settings, profile)

**Icons**: Lucide React Native

**Styling**: Golf-themed colors with gradient badges.

---

### Navigation Patterns

**Stack Navigation**:
```typescript
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type StackParamList = {
  CourseDetail: { courseId: string };
};

type NavProp = NativeStackNavigationProp<StackParamList, 'CourseDetail'>;

const Component = () => {
  const navigation = useNavigation<NavProp>();

  const goToCourse = (id: string) => {
    navigation.navigate('CourseDetail', { courseId: id });
  };
};
```

**Tab Navigation**:
```typescript
navigation.navigate('TournamentsStack', {
  screen: 'TournamentDetail',
  params: { tournamentId: '123' }
});
```

---

## UI/UX Design System

### Typography

**Font Family**: System default (San Francisco on iOS, Roboto on Android)

**Scale**:
- **Heading XL**: 28–32px, semibold → Screen titles
- **Heading L**: 24px, semibold → Section headers
- **Body M**: 16px, regular → Default paragraph text
- **Body S**: 14px, medium → Labels, secondary info

**NativeWind Classes**:
```tsx
<Text className="text-3xl font-semibold">Heading XL</Text>
<Text className="text-2xl font-semibold">Heading L</Text>
<Text className="text-base">Body M</Text>
<Text className="text-sm font-medium">Body S</Text>
```

---

### Color Palette

**File**: [tailwind.config.js](tailwind.config.js)

**Primary Colors**:
```js
primary: {
  DEFAULT: '#2d7a4e',  // Main green
  dark: '#1d4d34',     // Dark green
  light: '#3e9d64'     // Light green
}
```

**Neutrals**:
```js
charcoal: '#1a1d21',
gray: { 50: '#f9fafb', ..., 900: '#111827' }
```

**Accents**:
```js
gold: '#d4af37',
bronze: '#cd7f32',
sand: '#c2b280'
```

**Usage**:
```tsx
<View className="bg-primary dark:bg-primary-dark">
  <Text className="text-gray-900 dark:text-gray-100">Text</Text>
</View>
```

---

### Icon System

**Library**: Lucide React Native

**Style**: Line-based, 1.5–2px stroke weight, rounded corners

**Common Icons**:
- Golf: `Flag`, `Target`, `Trophy`
- Navigation: `Home`, `Calendar`, `User`
- Actions: `Plus`, `Edit`, `Trash2`, `Check`
- Status: `Wifi`, `WifiOff`, `AlertCircle`

**Usage**:
```tsx
import { Flag, Trophy, User } from 'lucide-react-native';

<Flag size={24} color="#2d7a4e" strokeWidth={2} />
```

---

### Spacing Scale

**8px Base Unit**:
- `p-1`: 4px (0.5 × 8)
- `p-2`: 8px (1 × 8)
- `p-3`: 12px (1.5 × 8)
- `p-4`: 16px (2 × 8)
- `p-6`: 24px (3 × 8)
- `p-8`: 32px (4 × 8)

**Usage**:
```tsx
<View className="p-4 mb-6">
  <Text className="mb-2">Title</Text>
  <Text className="mb-4">Body</Text>
</View>
```

---

### Component Patterns

#### Card

```tsx
<View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-md">
  <Text className="text-lg font-semibold text-gray-900 dark:text-white">
    Title
  </Text>
  <Text className="text-sm text-gray-600 dark:text-gray-400">
    Description
  </Text>
</View>
```

#### Button

```tsx
<TouchableOpacity className="bg-primary rounded-lg px-6 py-3">
  <Text className="text-white font-semibold text-center">
    Action
  </Text>
</TouchableOpacity>
```

#### Input

```tsx
<TextInput
  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
  placeholder="Enter text"
  placeholderTextColor="#9ca3af"
/>
```

---

### Dark Mode

**Context**: [src/contexts/ThemeContext.tsx](src/contexts/ThemeContext.tsx)

**Toggle Component**: [src/components/ThemeToggle.tsx](src/components/ThemeToggle.tsx)

**Usage**:
```tsx
import { useTheme } from '@/contexts/ThemeContext';

const Component = () => {
  const { isDark, colors } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Text</Text>
    </View>
  );
};
```

**NativeWind**: Use `dark:` prefix for dark mode styles.

---

## Testing & Quality

### Type Checking

**Command**: `npm run type-check` (or `npx tsc --noEmit`)

**Config**: [tsconfig.json](tsconfig.json)

**Strict Mode**: Enabled

**Current Issues**: 61 instances of `any` type across codebase.

---

### Linting

**Command**: `npm run lint`

**Config**: [.eslintrc.js](.eslintrc.js)

**Rules**: TypeScript + React Native recommended

**Status**: No ESLint disables found (good practice).

---

### Code Formatting

**Tool**: Prettier

**Config**: [.prettierrc](.prettierrc)

**Command**: `npm run format` (if configured)

---

### Error Tracking

**Tool**: Sentry

**Setup**: [App.tsx](App.tsx)

**Configuration**:
```typescript
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  _experiments: {
    profilesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  },
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration()
  ]
});
```

**Environment Variable**: `EXPO_PUBLIC_SENTRY_DSN`

---

## Deployment

### Expo Application Services (EAS)

**Config**: [eas.json](eas.json)

**Builds**:
- Development
- Preview
- Production

**Commands**:
```bash
# Development build
npx eas build --profile development --platform ios

# Production build
npx eas build --profile production --platform all

# Submit to App Store / Play Store
npx eas submit --platform ios
npx eas submit --platform android
```

---

### Environment Variables

**Required Variables**:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_SENTRY_DSN=https://sentry.io/dsn
EXPO_PUBLIC_WEATHER_API_KEY=your-weather-api-key
```

**File**: `.env` (local), EAS Secrets (production)

**⚠️ Current Issue**: Weather API key is hardcoded in `src/services/weather.ts` (should be moved to env).

---

### Build Process

```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Build for iOS simulator
npx eas build --profile development --platform ios

# Run on device
npx expo start --dev-client
```

---

## Common Tasks

### Add a New Screen

1. **Create screen file**: `src/screens/NewScreen.tsx`
   ```typescript
   import React from 'react';
   import { View, Text } from 'react-native';

   export const NewScreen = () => {
     return (
       <View className="flex-1 bg-white dark:bg-charcoal p-4">
         <Text className="text-xl font-semibold">New Screen</Text>
       </View>
     );
   };
   ```

2. **Add to navigation**: `src/navigation/AppTabs.tsx` or relevant stack
   ```typescript
   <Stack.Screen name="NewScreen" component={NewScreen} />
   ```

3. **Add translations**: `src/locales/en.json` and `src/locales/es.json`
   ```json
   "screens": {
     "newScreen": {
       "title": "New Screen"
     }
   }
   ```

---

### Add a New Service Function

1. **Add method to service**: `src/services/example.ts`
   ```typescript
   export const exampleService = {
     async newMethod(param: string) {
       const { data, error } = await supabase
         .from('table')
         .select('*')
         .eq('field', param);

       if (error) throw error;
       return data;
     }
   };
   ```

2. **Use in screen with React Query**:
   ```typescript
   const { data } = useQuery({
     queryKey: ['exampleKey', param],
     queryFn: () => exampleService.newMethod(param)
   });
   ```

---

### Add a New Database Table Type

1. **Update Supabase schema** (in Supabase dashboard)

2. **Regenerate types**:
   ```bash
   npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
   ```

3. **Use in service**:
   ```typescript
   import type { Database } from '@/types/database.types';

   type NewTable = Database['public']['Tables']['new_table']['Row'];
   ```

---

### Add a New Translation

1. **Add key to both locale files**: `en.json` and `es.json`
   ```json
   // en.json
   "category": {
     "newKey": "English text"
   }

   // es.json
   "category": {
     "newKey": "Texto en español"
   }
   ```

2. **Use in component**:
   ```typescript
   const { t } = useTranslation();
   return <Text>{t('category.newKey')}</Text>;
   ```

---

### Implement Pagination

```typescript
const [page, setPage] = useState(1);
const ITEMS_PER_PAGE = 20;

const { data, isLoading } = useQuery({
  queryKey: ['items', page],
  queryFn: () => service.fetchItems(page, ITEMS_PER_PAGE)
});

const loadMore = () => setPage(prev => prev + 1);

<FlatList
  data={data}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

---

### Handle Offline Sync

1. **Save to local storage**:
   ```typescript
   import AsyncStorage from '@react-native-async-storage/async-storage';

   await AsyncStorage.setItem('key', JSON.stringify(data));
   ```

2. **Add to sync queue**:
   ```typescript
   const queue = await AsyncStorage.getItem('sync_queue') || '[]';
   const parsed = JSON.parse(queue);
   parsed.push({ id, data, timestamp: Date.now() });
   await AsyncStorage.setItem('sync_queue', JSON.stringify(parsed));
   ```

3. **Process queue on app resume**:
   ```typescript
   useEffect(() => {
     const subscription = AppState.addEventListener('change', state => {
       if (state === 'active') {
         syncQueue();
       }
     });
     return () => subscription.remove();
   }, []);
   ```

---

## Quick Reference

### File Paths (Commonly Used)

| File | Path | Purpose |
|------|------|---------|
| Root App | [App.tsx](App.tsx) | Entry point |
| Auth Hook | [src/hooks/useAuth.tsx](src/hooks/useAuth.tsx) | Authentication |
| Supabase Client | [src/lib/supabaseClient.ts](src/lib/supabaseClient.ts) | DB connection |
| Home Screen | [src/screens/HomeScreen.tsx](src/screens/HomeScreen.tsx) | Dashboard |
| Tournament Scoring | [src/screens/tournaments/ScorecardScreen.tsx](src/screens/tournaments/ScorecardScreen.tsx) | Live scoring |
| Personal Scoring | [src/screens/rounds/PersonalScorecardScreen.tsx](src/screens/rounds/PersonalScorecardScreen.tsx) | Personal rounds |
| Round Sync | [src/utils/personalRoundSync.ts](src/utils/personalRoundSync.ts) | Offline sync |
| Theme Context | [src/contexts/ThemeContext.tsx](src/contexts/ThemeContext.tsx) | Dark mode |
| Language Context | [src/contexts/LanguageContext.tsx](src/contexts/LanguageContext.tsx) | i18n |

---

### Import Aliases

```typescript
import { Component } from '@/components/Component';
import { useAuth } from '@/hooks/useAuth';
import { service } from '@/services/service';
import { Type } from '@/types';
import { helper } from '@/utils/helper';
```

**Config**: [tsconfig.json](tsconfig.json) (`"@/*": ["src/*"]`)

---

### Useful Commands

```bash
# Start development server
npx expo start

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build for iOS
npx eas build --profile development --platform ios

# Build for Android
npx eas build --profile development --platform android

# Submit to stores
npx eas submit --platform all

# Generate Supabase types
npx supabase gen types typescript --project-id PROJECT_ID > src/types/database.types.ts
```

---

## Contact & Support

**Project**: TeeTime Cloud Mobile
**Developer**: Mikhail
**Repository**: (Add GitHub URL if applicable)
**Documentation**: `/Users/Mikhail/TeeTimeCloud/TeeTimeCloudMobile/.docs/`

---

**End of Knowledge Base** | Last Updated: 2025-12-05
