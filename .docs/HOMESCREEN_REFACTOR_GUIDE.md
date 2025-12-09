# HomeScreen Refactor Guide - ISSUE-012

**Status**: Implementation Guide Ready
**Date**: 2025-12-05

---

## Problem Statement

The current HomeScreen (`src/screens/HomeScreen.tsx`) loads 6+ data sources in a single `loadHomeData()` function with:
- Single try-catch block for all requests
- Single loading state for entire screen
- No granular error handling
- Poor user experience when one section fails

---

## Solution Overview

Refactor HomeScreen to use:
1. **Individual hooks** for each data source (already created)
2. **Granular loading states** per section
3. **Section-specific error cards** with retry buttons
4. **Progressive rendering** - show sections as data loads
5. **Skeleton loaders** for each section

---

## New Hooks Created

### Location
`src/hooks/useHomeData.ts`

###Available Hooks:
1. **`useHomeCourse(homeCourseId)`** - Fetches home course name and location
2. **`useWeather(latitude, longitude)`** - Fetches weather data
3. **`useUpcomingEvents(courseId)`** - Fetches course events
4. **`useNextTeeTime(userId)`** - Fetches next tee time reservation
5. **`useUnreadCount(userId)`** - Fetches unread notification count
6. **`useActiveTournaments(userId)`** - Fetches active tournaments
7. **`useRecentRounds(userId, limit)`** - Fetches recent golf rounds

Each hook returns:
```typescript
{
  data: T | null,      // The fetched data
  loading: boolean,    // Loading state
  error: Error | null, // Error if fetch failed
  refetch: () => void  // Function to retry
}
```

---

## New Components Created

### 1. SectionErrorCard
**Location**: `src/components/SectionErrorCard.tsx`

Displays error with retry button:
```tsx
<SectionErrorCard
  errorMessage={t('errors.fetchWeather')}
  onRetry={refetchWeather}
/>
```

### 2. Skeleton Components
**Location**: `src/components/skeletons/`

- `WeatherSkeleton` - For weather section
- `TeeTimeSkeleton` - For next tee time section
- `TournamentCardSkeleton` - For tournament cards
- `RoundCardSkeleton` - For round cards

---

## Implementation Pattern

### Before (Current):
```tsx
const [loading, setLoading] = useState(true);
const [weather, setWeather] = useState(null);
const [nextTeeTime, setNextTeeTime] = useState(null);
// ... more state

const loadHomeData = async () => {
  try {
    setLoading(true);

    // Fetch home course
    const courseRes = await coursesService.fetchCourseById(...);

    // Fetch weather
    const weatherRes = await weatherService.getCurrentWeather(...);

    // Fetch next tee time
    const nextRes = await reservationsService.fetchNextReservation(...);

    // ... more fetches
  } catch (error) {
    console.error('Error loading home data:', error);
  } finally {
    setLoading(false);
  }
};

// Single loading screen
if (loading) {
  return <ActivityIndicator />;
}
```

### After (Refactored):
```tsx
import {
  useHomeCourse,
  useWeather,
  useNextTeeTime,
  useActiveTournaments,
  useRecentRounds,
} from '@/hooks/useHomeData';
import { SectionErrorCard } from '@/components/SectionErrorCard';
import { WeatherSkeleton, TeeTimeSkeleton } from '@/components/skeletons';

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { t } = useTranslation();

  // Individual hooks for each section
  const {
    homeCourseName,
    homeCourseLocation,
    loading: homeCourseLoading,
    error: homeCourseError,
    refetch: refetchHomeCourse
  } = useHomeCourse(profile?.home_course_id || null);

  const {
    weather,
    loading: weatherLoading,
    error: weatherError,
    refetch: refetchWeather
  } = useWeather(
    homeCourseLocation?.latitude || null,
    homeCourseLocation?.longitude || null
  );

  const {
    nextTeeTime,
    loading: nextTeeTimeLoading,
    error: nextTeeTimeError,
    refetch: refetchNextTeeTime
  } = useNextTeeTime(user?.id || null);

  const {
    activeTournaments,
    loading: tournamentsLoading,
    error: tournamentsError,
    refetch: refetchTournaments
  } = useActiveTournaments(user?.id || null);

  const {
    recentRounds,
    loading: roundsLoading,
    error: roundsError,
    refetch: refetchRounds
  } = useRecentRounds(user?.id || null);

  // Global refetch for pull-to-refresh
  const onRefresh = () => {
    refetchHomeCourse();
    refetchWeather();
    refetchNextTeeTime();
    refetchTournaments();
    refetchRounds();
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={onRefresh} />
      }
    >
      {/* Profile Section - Always show */}
      <View style={styles.profileSection}>
        {/* ... profile UI ... */}
      </View>

      {/* Weather Section */}
      {weatherLoading ? (
        <WeatherSkeleton />
      ) : weatherError ? (
        <SectionErrorCard
          errorMessage={t('errors.fetchWeather')}
          onRetry={refetchWeather}
        />
      ) : weather ? (
        <View style={styles.weatherSection}>
          {/* ... weather UI ... */}
        </View>
      ) : null}

      {/* Next Tee Time Section */}
      {nextTeeTimeLoading ? (
        <TeeTimeSkeleton />
      ) : nextTeeTimeError ? (
        <SectionErrorCard
          errorMessage={t('errors.fetchTeeTimes')}
          onRetry={refetchNextTeeTime}
        />
      ) : nextTeeTime ? (
        <View style={styles.teeTimeSection}>
          {/* ... tee time UI ... */}
        </View>
      ) : null}

      {/* Active Tournaments Section */}
      {tournamentsLoading ? (
        <>
          <TournamentCardSkeleton />
          <TournamentCardSkeleton />
        </>
      ) : tournamentsError ? (
        <SectionErrorCard
          errorMessage={t('errors.fetchTournaments')}
          onRetry={refetchTournaments}
        />
      ) : activeTournaments.length > 0 ? (
        <View style={styles.tournamentsSection}>
          <Text style={styles.sectionTitle}>{t('home.myTournaments')}</Text>
          {activeTournaments.map(tournament => (
            <TournamentCard key={tournament.id} {...tournament} />
          ))}
        </View>
      ) : null}

      {/* Recent Rounds Section */}
      {roundsLoading ? (
        <>
          <RoundCardSkeleton />
          <RoundCardSkeleton />
        </>
      ) : roundsError ? (
        <SectionErrorCard
          errorMessage={t('errors.fetchRounds')}
          onRetry={refetchRounds}
        />
      ) : recentRounds.length > 0 ? (
        <View style={styles.roundsSection}>
          <Text style={styles.sectionTitle}>{t('home.recentRounds')}</Text>
          {recentRounds.map(round => (
            <RoundCard key={round.id} {...round} />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
```

---

## Translation Keys Needed

Add to `src/locales/en.json` and `src/locales/es.json`:

```json
"errors": {
  "fetchWeather": "Failed to load weather data",
  "fetchEvents": "Failed to load events"
}
```

(Already added: fetchCourses, fetchTournaments, fetchTeeTimes, fetchRounds)

---

## Benefits of Refactor

### 1. **Better User Experience**
- Users see sections as they load (progressive rendering)
- One failed section doesn't block others
- Clear error messages with retry buttons
- Professional loading skeletons

### 2. **Better Performance**
- Data fetches happen in parallel automatically
- Each section can be retried independently
- No blocking "all-or-nothing" approach

### 3. **Better Maintainability**
- Each data source has its own hook
- Easy to add new sections
- Easy to debug specific sections
- Clear separation of concerns

### 4. **Better Testing**
- Each hook can be tested independently
- Mock specific sections for testing
- Easier to reproduce error states

---

## Implementation Steps

### Step 1: Import New Dependencies
```tsx
import {
  useHomeCourse,
  useWeather,
  useUpcomingEvents,
  useNextTeeTime,
  useUnreadCount,
  useActiveTournaments,
  useRecentRounds,
} from '@/hooks/useHomeData';
import { SectionErrorCard } from '@/components/SectionErrorCard';
import {
  WeatherSkeleton,
  TeeTimeSkeleton,
  TournamentCardSkeleton,
  RoundCardSkeleton,
} from '@/components/skeletons';
```

### Step 2: Replace State with Hooks
Remove:
```tsx
const [loading, setLoading] = useState(true);
const [weather, setWeather] = useState(null);
const [nextTeeTime, setNextTeeTime] = useState(null);
const loadHomeData = async () => { /* ... */ };
```

Add:
```tsx
const homeCourse = useHomeCourse(profile?.home_course_id || null);
const weather = useWeather(homeCourse.homeCourseLocation?.latitude || null, homeCourse.homeCourseLocation?.longitude || null);
// ... etc
```

### Step 3: Update Each Section
For each data section in the UI, replace with the pattern:
```tsx
{loading ? (
  <Skeleton />
) : error ? (
  <SectionErrorCard errorMessage={t('errors.X')} onRetry={refetch} />
) : data ? (
  <ActualContent />
) : null}
```

### Step 4: Update Pull-to-Refresh
```tsx
const onRefresh = () => {
  homeCourse.refetch();
  weather.refetch();
  nextTeeTime.refetch();
  tournaments.refetch();
  rounds.refetch();
};
```

### Step 5: Remove Old Loading Screen
Delete:
```tsx
if (loading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator />
    </View>
  );
}
```

### Step 6: Test
- Test each section loading independently
- Test error states by disconnecting network
- Test retry functionality
- Test pull-to-refresh
- Test dark mode

---

## Example Section Refactor

### Weather Section - Before:
```tsx
{weather && (
  <View style={styles.section}>
    <View style={styles.weatherDetails}>
      {/* weather UI */}
    </View>
  </View>
)}
```

### Weather Section - After:
```tsx
{weatherLoading ? (
  <WeatherSkeleton />
) : weatherError ? (
  <SectionErrorCard
    errorMessage={t('errors.fetchWeather')}
    onRetry={refetchWeather}
  />
) : weather ? (
  <View style={[homeStyles.section, isDark && homeStyles.sectionDark]}>
    <View style={homeStyles.weatherDetails}>
      <View style={homeStyles.weatherItem}>
        <Thermometer size={20} color={isDark ? '#adb5bd' : '#868e96'} />
        <Text style={[homeStyles.weatherLabel, isDark && homeStyles.weatherLabelDark]}>
          {t('home.weather.temperature')}
        </Text>
        <Text style={[homeStyles.weatherValue, isDark && homeStyles.weatherValueDark]}>
          {Math.round(weather.current?.temp_f)}°F
        </Text>
      </View>
      {/* ... other weather items ... */}
    </View>
  </View>
) : null}
```

---

## Files to Modify

1. **`src/screens/HomeScreen.tsx`** (main refactor)
   - Import new hooks and components
   - Replace state with hooks
   - Update each section with loading/error/data pattern
   - Update onRefresh to call all refetch functions
   - Remove old loadHomeData function
   - Remove global loading state

2. **`src/locales/en.json`** (add missing error keys)
   ```json
   "errors": {
     "fetchWeather": "Failed to load weather data",
     "fetchEvents": "Failed to load events"
   }
   ```

3. **`src/locales/es.json`** (add Spanish translations)
   ```json
   "errors": {
     "fetchWeather": "Error al cargar datos del clima",
     "fetchEvents": "Error al cargar eventos"
   }
   ```

---

## Testing Checklist

- [ ] All sections load independently
- [ ] Skeleton loaders appear during loading
- [ ] Error cards appear when network fails
- [ ] Retry buttons work correctly
- [ ] Pull-to-refresh refetches all sections
- [ ] Dark mode styles work
- [ ] Translations work (English & Spanish)
- [ ] Navigation from sections works
- [ ] No console errors
- [ ] Performance is good (no regression)

---

## Rollback Plan

If issues arise, the refactor can be easily rolled back since:
- New hooks are separate files
- New components are separate files
- Only HomeScreen.tsx is modified
- Git revert will restore original HomeScreen

---

**End of Guide**
