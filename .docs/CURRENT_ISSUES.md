# TeeTime Cloud Mobile — Current Issues & Bugs

**Last Updated**: 2025-12-05
**Version**: 1.0.0
**Purpose**: Comprehensive tracking of existing bugs, issues, technical debt, and required fixes.

---

## Table of Contents

1. [Critical Issues (Security & Stability)](#critical-issues-security--stability)
2. [High Priority Issues (Functionality)](#high-priority-issues-functionality)
3. [Medium Priority Issues (UX & Quality)](#medium-priority-issues-ux--quality)
4. [Low Priority Issues (Polish)](#low-priority-issues-polish)
5. [Missing Translations](#missing-translations)
6. [UI/UX Inconsistencies](#uiux-inconsistencies)
7. [Technical Debt](#technical-debt)
8. [Performance Concerns](#performance-concerns)

---

## Critical Issues (Security & Stability)

### 🔴 ISSUE-001: Exposed Weather API Key

**Severity**: Critical (Security)
**File**: [src/services/weather.ts:5](../src/services/weather.ts#L5)

**Problem**:
Weather API key is hardcoded directly in source code:
```typescript
const WEATHER_API_KEY = 'd6b143fd40d4428e95763949251311';
```

**Impact**:
- API key visible in version control
- Could be rate-limited by malicious users
- Violates security best practices

**Solution**:
1. Move key to environment variables:
   ```typescript
   const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
   ```

2. Update `.env.example`:
   ```
   EXPO_PUBLIC_WEATHER_API_KEY=your_api_key_here
   ```

3. Add to EAS Secrets for production builds

4. Add validation to ensure key exists:
   ```typescript
   if (!WEATHER_API_KEY) {
     throw new Error('Weather API key not configured');
   }
   ```

**Status**: 🔴 Open

---

### 🔴 ISSUE-002: Type Safety - 61 instances of `any` type

**Severity**: Critical (Code Quality)
**Files**: Multiple (see breakdown below)

**Problem**:
Codebase contains 61 instances of the `any` type, reducing type safety:

**Breakdown by Category**:

1. **Catch blocks** (most common):
   ```typescript
   } catch (error: any) {
     console.error('Error:', error);
   }
   ```
   **Should be**:
   ```typescript
   } catch (error) {
     if (error instanceof Error) {
       console.error('Error:', error.message);
     }
   }
   ```

2. **Array types** ([src/utils/personalRoundSync.ts](../src/utils/personalRoundSync.ts)):
   ```typescript
   holeData: any[]
   ```

3. **Render item callbacks**:
   ```typescript
   renderItem={({ item }: { item: any }) => <Component />}
   ```

**Impact**:
- Loss of TypeScript type checking benefits
- Harder to refactor safely
- Runtime errors not caught at compile time
- Poor IDE autocomplete support

**Solution**:
1. Replace `error: any` with proper error handling:
   ```typescript
   } catch (error) {
     const message = error instanceof Error ? error.message : 'Unknown error';
     console.error('Operation failed:', message);
   }
   ```

2. Define proper interfaces for data structures:
   ```typescript
   interface HoleData {
     hole_number: number;
     strokes: number;
     putts?: number;
     fairway_hit?: boolean;
     green_in_regulation?: boolean;
   }

   const holeData: HoleData[] = [];
   ```

3. Use generic types for callbacks:
   ```typescript
   renderItem={({ item }: { item: CourseType }) => <CourseCard course={item} />}
   ```

**Files to Update**:
- [src/utils/personalRoundSync.ts](../src/utils/personalRoundSync.ts) - 8 instances
- [src/screens/*.tsx](../src/screens/) - Multiple catch blocks
- [src/services/*.ts](../src/services/) - Error handling
- [src/components/*.tsx](../src/components/) - Render props

**Status**: 🔴 Open

---

### 🔴 ISSUE-003: Incomplete Network Detection

**Severity**: High (Functionality)
**File**: [src/hooks/useNetworkStatus.ts](../src/hooks/useNetworkStatus.ts)

**Problem**:
Current implementation only monitors AppState (foreground/background), not actual network connectivity:

```typescript
// Current implementation
const [isConnected, setIsConnected] = useState(true);

useEffect(() => {
  const subscription = AppState.addEventListener('change', (state) => {
    setIsConnected(state === 'active');
  });
  return () => subscription.remove();
}, []);
```

**Impact**:
- Cannot detect real network disconnections
- Users may attempt operations without connectivity
- Sync queue may fail silently
- Poor offline experience

**Solution**:
1. Install `@react-native-community/netinfo`:
   ```bash
   npm install @react-native-community/netinfo
   ```

2. Implement real network detection:
   ```typescript
   import NetInfo from '@react-native-community/netinfo';

   export const useNetworkStatus = () => {
     const [isConnected, setIsConnected] = useState(true);

     useEffect(() => {
       const unsubscribe = NetInfo.addEventListener(state => {
         setIsConnected(state.isConnected ?? false);
       });

       return () => unsubscribe();
     }, []);

     return { isConnected };
   };
   ```

3. Update sync utilities to check network before operations
4. Add visual indicator when offline

**Files to Update**:
- [src/hooks/useNetworkStatus.ts](../src/hooks/useNetworkStatus.ts)
- [src/utils/personalRoundSync.ts](../src/utils/personalRoundSync.ts)
- [src/utils/scorecardSync.ts](../src/utils/scorecardSync.ts)
- [src/screens/tournaments/ScorecardScreen.tsx](../src/screens/tournaments/ScorecardScreen.tsx)

**Status**: 🔴 Open

---

## High Priority Issues (Functionality)

### 🟠 ISSUE-004: Sync Queue May Lose Updates

**Severity**: High (Data Integrity)
**Files**: [src/utils/personalRoundSync.ts](../src/utils/personalRoundSync.ts), [src/utils/scorecardSync.ts](../src/utils/scorecardSync.ts)

**Problem**:
1. Sync relies entirely on AppState listener (app resume)
2. No background sync capability
3. Network timeouts could orphan queue items
4. No retry mechanism with exponential backoff

**Impact**:
- Lost scores if app crashes before sync
- No sync if user doesn't return to app
- Failed syncs may not retry

**Solution**:
1. Add retry mechanism with exponential backoff:
   ```typescript
   async function syncWithRetry(operation: () => Promise<void>, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         await operation();
         return;
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
       }
     }
   }
   ```

2. Add timestamps to queue items for staleness detection:
   ```typescript
   interface QueueItem {
     id: string;
     data: any;
     timestamp: number;
     retryCount: number;
   }
   ```

3. Implement background sync using `expo-task-manager`:
   ```bash
   npx expo install expo-task-manager expo-background-fetch
   ```

4. Add error logging for failed syncs

**Status**: 🟠 Open

---

### 🟠 ISSUE-005: Tournament Dispute Flow - Incomplete Error Handling

**Severity**: High (UX)
**Files**: [src/screens/tournaments/ScorecardScreen.tsx](../src/screens/tournaments/ScorecardScreen.tsx), [src/services/tournaments.ts](../src/services/tournaments.ts)

**Problem**:
1. Dispute submission may fail silently
2. No success confirmation for user
3. No validation of dispute note before submission
4. No ability to view/edit existing disputes

**Impact**:
- Users don't know if dispute was submitted
- Potential duplicate disputes
- Poor dispute management UX

**Solution**:
1. Add proper error handling:
   ```typescript
   try {
     await tournamentsService.submitDispute(scoreId, note);
     Alert.alert(
       t('success.title'),
       t('success.disputeSubmitted'),
       [{ text: t('common.ok') }]
     );
   } catch (error) {
     Alert.alert(
       t('errors.title'),
       t('errors.disputeFailed'),
       [{ text: t('common.retry'), onPress: () => retryDispute() }]
     );
   }
   ```

2. Add validation:
   ```typescript
   if (!disputeNote.trim()) {
     Alert.alert(t('errors.title'), t('errors.disputeNoteRequired'));
     return;
   }
   ```

3. Add dispute status indicator in UI
4. Add ability to view dispute history

**Status**: 🟠 Open

---

### 🟠 ISSUE-006: Missing Pagination in Tournament Lists

**Severity**: Medium (Performance)
**Files**: [src/screens/tournaments/TournamentListScreen.tsx](../src/screens/tournaments/TournamentListScreen.tsx), [src/services/tournaments.ts](../src/services/tournaments.ts)

**Problem**:
- Tournament lists may load all records at once
- No virtual scrolling for long lists
- Could cause performance issues with many tournaments

**Impact**:
- Slow loading with large datasets
- High memory usage
- Poor performance on older devices

**Solution**:
1. Add pagination to tournament service:
   ```typescript
   async fetchTournaments(page = 1, limit = 20) {
     const from = (page - 1) * limit;
     const to = from + limit - 1;

     const { data, error } = await supabase
       .from('tournaments')
       .select('*')
       .order('start_date', { ascending: false })
       .range(from, to);

     if (error) throw error;
     return data;
   }
   ```

2. Implement infinite scroll:
   ```typescript
   <FlatList
     data={tournaments}
     onEndReached={() => setPage(p => p + 1)}
     onEndReachedThreshold={0.5}
   />
   ```

3. Add loading indicator at bottom of list

**Status**: 🟠 Open

---

## Medium Priority Issues (UX & Quality)

### 🟡 ISSUE-007: Hardcoded UI Strings (Not Translated)

**Severity**: Medium (i18n)
**Files**: [src/components/ScorecardGrid.tsx:63,77](../src/components/ScorecardGrid.tsx#L63)

**Problem**:
Some UI strings are hardcoded and not wrapped in `t()` function:

```typescript
// Line 63
<Text>Hole {holeNumber}</Text>

// Line 77
<Text>Par {par}</Text>
```

**Impact**:
- Broken Spanish translation experience
- Inconsistent i18n implementation

**Solution**:
1. Update translation files:
   ```json
   // en.json
   "scorecard": {
     "hole": "Hole {{number}}",
     "par": "Par {{value}}"
   }

   // es.json
   "scorecard": {
     "hole": "Hoyo {{number}}",
     "par": "Par {{value}}"
   }
   ```

2. Update component:
   ```typescript
   const { t } = useTranslation();

   <Text>{t('scorecard.hole', { number: holeNumber })}</Text>
   <Text>{t('scorecard.par', { value: par })}</Text>
   ```

**Other Affected Files**:
- Search for hardcoded strings in all screen files
- Check `AppTabs.tsx` for fallback strings

**Status**: 🟡 Open

---

### 🟡 ISSUE-008: No Empty State UX

**Severity**: Medium (UX)
**Files**: Multiple list screens

**Problem**:
Many screens show empty lists without helpful UX:
- No "No tournaments available" message
- No "Start your first round" CTA
- No helpful illustrations or guidance

**Affected Screens**:
- [TournamentListScreen.tsx](../src/screens/tournaments/TournamentListScreen.tsx)
- [RoundsListScreen.tsx](../src/screens/rounds/RoundsListScreen.tsx)
- [TeeTimesScreen.tsx](../src/screens/TeeTimesScreen.tsx)
- [NotificationsScreen.tsx](../src/screens/NotificationsScreen.tsx)

**Impact**:
- Confusing user experience
- Users don't know what to do next
- App feels incomplete

**Solution**:
1. Create `EmptyState` component:
   ```typescript
   interface EmptyStateProps {
     icon: React.ReactNode;
     title: string;
     description: string;
     actionLabel?: string;
     onAction?: () => void;
   }

   export const EmptyState: React.FC<EmptyStateProps> = ({
     icon,
     title,
     description,
     actionLabel,
     onAction
   }) => (
     <View className="flex-1 justify-center items-center p-8">
       {icon}
       <Text className="text-xl font-semibold mt-4 text-center">{title}</Text>
       <Text className="text-gray-600 dark:text-gray-400 mt-2 text-center">
         {description}
       </Text>
       {actionLabel && onAction && (
         <TouchableOpacity
           className="bg-primary rounded-lg px-6 py-3 mt-6"
           onPress={onAction}
         >
           <Text className="text-white font-semibold">{actionLabel}</Text>
         </TouchableOpacity>
       )}
     </View>
   );
   ```

2. Use in screens:
   ```typescript
   {data?.length === 0 && (
     <EmptyState
       icon={<Trophy size={64} color="#9ca3af" />}
       title={t('tournaments.emptyState.title')}
       description={t('tournaments.emptyState.description')}
       actionLabel={t('tournaments.emptyState.browse')}
       onAction={() => navigation.navigate('CoursesScreen')}
     />
   )}
   ```

**Status**: 🟡 Open

---

### 🟡 ISSUE-009: No Loading Skeletons

**Severity**: Medium (UX)
**Files**: All list screens

**Problem**:
Screens show generic loading spinner instead of skeleton screens, causing:
- Poor perceived performance
- Layout shift when content loads
- Generic loading experience

**Solution**:
1. Create skeleton components:
   ```typescript
   export const TournamentCardSkeleton = () => (
     <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
       <View className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
       <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
       <View className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
     </View>
   );
   ```

2. Use during loading:
   ```typescript
   {isLoading ? (
     <>
       <TournamentCardSkeleton />
       <TournamentCardSkeleton />
       <TournamentCardSkeleton />
     </>
   ) : (
     <FlatList data={data} renderItem={...} />
   )}
   ```

**Affected Screens**:
- All list screens (tournaments, courses, rounds, etc.)

**Status**: 🟡 Open

---

### 🟡 ISSUE-010: No Offline Mode Indicator

**Severity**: Medium (UX)
**Files**: [src/screens/tournaments/ScorecardScreen.tsx](../src/screens/tournaments/ScorecardScreen.tsx)

**Problem**:
- Network status shown only with Wifi icons on scorecard
- No persistent offline indicator
- Users may not know why updates are queued

**Impact**:
- Confusion about app behavior
- Users attempt operations that require connectivity
- Poor offline experience communication

**Solution**:
1. Create global network status banner:
   ```typescript
   export const NetworkStatusBanner = () => {
     const { isConnected } = useNetworkStatus();

     if (isConnected) return null;

     return (
       <View className="bg-yellow-500 p-2">
         <Text className="text-white text-center font-medium">
           {t('common.offline')}
         </Text>
       </View>
     );
   };
   ```

2. Add to root navigator:
   ```typescript
   <SafeAreaProvider>
     <NetworkStatusBanner />
     <RootNavigator />
   </SafeAreaProvider>
   ```

3. Show sync queue count when offline:
   ```typescript
   {!isConnected && queueCount > 0 && (
     <Text>{t('common.pendingUpdates', { count: queueCount })}</Text>
   )}
   ```

**Status**: 🟡 Open

---

### 🟡 ISSUE-011: Inconsistent Error Messages

**Severity**: Medium (UX)
**Files**: Multiple

**Problem**:
Mix of localized and hardcoded error messages:

```typescript
// Some files
throw new Error('Failed to fetch courses');

// Other files
Alert.alert(t('errors.title'), t('errors.fetchFailed'));
```

**Impact**:
- Inconsistent user experience
- Some errors not translated
- Harder to maintain error messages

**Solution**:
1. Standardize all errors in translation files:
   ```json
   "errors": {
     "title": "Error",
     "network": "Network error occurred",
     "fetchCourses": "Failed to load courses",
     "fetchTournaments": "Failed to load tournaments",
     "submitScore": "Failed to submit score",
     "generic": "Something went wrong"
   }
   ```

2. Create error helper:
   ```typescript
   export const showError = (errorKey: string, retry?: () => void) => {
     const { t } = useTranslation();

     Alert.alert(
       t('errors.title'),
       t(`errors.${errorKey}`),
       [
         { text: t('common.cancel'), style: 'cancel' },
         ...(retry ? [{ text: t('common.retry'), onPress: retry }] : [])
       ]
     );
   };
   ```

3. Use consistently:
   ```typescript
   } catch (error) {
     showError('fetchCourses', () => refetch());
   }
   ```

**Status**: 🟡 Open

---

### 🟡 ISSUE-012: HomeScreen - Complex Data Loading

**Severity**: Medium (Performance)
**File**: [src/screens/HomeScreen.tsx](../src/screens/HomeScreen.tsx) (31.6 KB)

**Problem**:
HomeScreen loads 6+ data sources in parallel:
- User profile
- Upcoming reservations
- Weather data
- My tournaments
- Featured courses
- RSS articles

**Current Issues**:
- No granular error states
- Single loading state for all data
- No partial data display
- All-or-nothing approach

**Impact**:
- Long initial load time
- Single failure affects entire screen
- Poor perceived performance

**Solution**:
1. Split into independent queries with individual error states:
   ```typescript
   const profileQuery = useQuery(['profile'], fetchProfile);
   const reservationsQuery = useQuery(['reservations'], fetchReservations);
   const weatherQuery = useQuery(['weather'], fetchWeather);
   // etc.
   ```

2. Show sections independently:
   ```typescript
   {reservationsQuery.isLoading ? (
     <ReservationsSkeleton />
   ) : reservationsQuery.error ? (
     <ErrorCard onRetry={reservationsQuery.refetch} />
   ) : (
     <ReservationsSection data={reservationsQuery.data} />
   )}
   ```

3. Add pull-to-refresh for all sections

**Status**: 🟡 Open

---

## Low Priority Issues (Polish)

### 🟢 ISSUE-013: Inconsistent Color Definitions

**Severity**: Low (Visual)
**Files**: [src/screens/SignInScreen.tsx](../src/screens/SignInScreen.tsx), [tailwind.config.js](../tailwind.config.js)

**Problem**:
SignIn screen uses different gradient color than defined primary:

```typescript
// SignInScreen.tsx
<LinearGradient colors={['#0B3D2E', '#1a5c43']} />

// tailwind.config.js
primary: {
  DEFAULT: '#2d7a4e',
  dark: '#1d4d34'
}
```

**Impact**:
- Visual inconsistency
- Harder to maintain brand colors
- Confusing color system

**Solution**:
1. Consolidate all brand colors in Tailwind config:
   ```js
   colors: {
     primary: {
       DEFAULT: '#2d7a4e',
       dark: '#1d4d34',
       light: '#3e9d64'
     },
     gradientStart: '#0B3D2E',
     gradientEnd: '#1a5c43'
   }
   ```

2. Import colors in components:
   ```typescript
   import resolveConfig from 'tailwindcss/resolveConfig';
   import tailwindConfig from '../../tailwind.config.js';

   const { theme } = resolveConfig(tailwindConfig);
   const colors = theme.colors;

   <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} />
   ```

**Status**: 🟢 Open

---

### 🟢 ISSUE-014: Missing Accessibility Labels

**Severity**: Low (Accessibility)
**Files**: Multiple

**Problem**:
- Icon-only buttons without accessibility labels
- Images without alt text
- Poor screen reader support

**Examples**:
```typescript
// Bad
<TouchableOpacity onPress={onEdit}>
  <Edit size={24} />
</TouchableOpacity>

// Good
<TouchableOpacity
  onPress={onEdit}
  accessibilityLabel={t('common.edit')}
  accessibilityRole="button"
>
  <Edit size={24} />
</TouchableOpacity>
```

**Solution**:
1. Add accessibility props to all interactive elements
2. Add `accessibilityLabel` to images
3. Use `accessibilityRole` for semantic meaning
4. Test with screen reader (TalkBack/VoiceOver)

**Status**: 🟢 Open

---

### 🟢 ISSUE-015: No Image Optimization

**Severity**: Low (Performance)
**File**: [src/screens/CourseDetailScreen.tsx](../src/screens/CourseDetailScreen.tsx)

**Problem**:
- Course gallery images loaded at full resolution
- No progressive loading
- No image size optimization
- Could be slow on poor networks

**Solution**:
1. Use Expo Image component:
   ```typescript
   import { Image } from 'expo-image';

   <Image
     source={{ uri: imageUrl }}
     contentFit="cover"
     placeholder={blurhash}
     transition={200}
     style={{ width: 300, height: 200 }}
   />
   ```

2. Add image resizing on Supabase storage
3. Implement lazy loading for gallery

**Status**: 🟢 Open

---

### 🟢 ISSUE-016: Large Component Files

**Severity**: Low (Maintainability)
**Files**:
- [src/screens/HomeScreen.tsx](../src/screens/HomeScreen.tsx) - 31.6 KB
- [src/screens/rounds/PersonalScorecardScreen.tsx](../src/screens/rounds/PersonalScorecardScreen.tsx) - 27 KB
- [src/screens/tournaments/ScorecardScreen.tsx](../src/screens/tournaments/ScorecardScreen.tsx) - 16 KB

**Problem**:
Some components are very large and handle multiple responsibilities.

**Impact**:
- Harder to maintain
- Difficult to test
- Poor code organization

**Solution**:
Refactor into smaller, focused components:

**Example - HomeScreen.tsx**:
```
HomeScreen.tsx (coordinator)
  ├── HomeHeader.tsx
  ├── UpcomingReservationsSection.tsx
  ├── WeatherSection.tsx
  ├── MyTournamentsSection.tsx
  ├── FeaturedCoursesSection.tsx
  └── RSSArticlesSection.tsx
```

**Status**: 🟢 Open

---

## Missing Translations

### TRANS-001: AppTabs Fallback Strings

**File**: [src/navigation/AppTabs.tsx](../src/navigation/AppTabs.tsx)

**Issue**:
Tab names have fallback strings suggesting incomplete i18n:

```typescript
title: t('tabs.tournaments') || 'Tournaments'
title: t('tabs.rounds') || 'Rounds'
```

**Solution**:
Ensure all tab keys exist in translation files:
```json
// en.json
"tabs": {
  "home": "Home",
  "teeTimes": "Tee Times",
  "tournaments": "Tournaments",
  "rounds": "Rounds",
  "profile": "Profile"
}

// es.json
"tabs": {
  "home": "Inicio",
  "teeTimes": "Horarios",
  "tournaments": "Torneos",
  "rounds": "Rondas",
  "profile": "Perfil"
}
```

**Status**: 🟡 Open

---

### TRANS-002: Hardcoded Hole/Par Text

**File**: [src/components/ScorecardGrid.tsx:63,77](../src/components/ScorecardGrid.tsx#L63)

**Issue**: Already documented in ISSUE-007

**Status**: 🟡 Open

---

### TRANS-003: Missing Error Message Keys

**Issue**:
Some error messages may not have translation keys. Needs comprehensive audit.

**Action Required**:
1. Search all files for hardcoded error strings
2. Add keys to translation files
3. Update code to use `t()` function

**Status**: 🟡 Open

---

## UI/UX Inconsistencies

### UX-001: Inconsistent Styling Approach

**Severity**: Low
**Files**: Multiple

**Problem**:
Mix of three styling approaches:
1. NativeWind classes: `className="p-4 bg-white"`
2. StyleSheet: `style={styles.container}`
3. Inline styles: `style={{ padding: 16 }}`

**Example**:
Some screens use pure NativeWind, others use StyleSheet, some use both.

**Impact**:
- Inconsistent codebase
- Harder to maintain
- Confusing for new developers

**Solution**:
**Recommended Pattern**:
- Use NativeWind for simple, static styles
- Use StyleSheet for complex, dynamic styles
- Avoid inline styles unless absolutely necessary

**Document this in coding guidelines**

**Status**: 🟢 Open

---

### UX-002: No Success Confirmation Flows

**Severity**: Medium
**Files**: Multiple

**Problem**:
Many operations lack success confirmation:
- Tournament registration
- Score submission
- Reservation creation
- Profile updates

**Impact**:
- Users unsure if action succeeded
- May retry unnecessarily

**Solution**:
Add toast/alert for successful operations:
```typescript
import { Alert } from 'react-native';

// After successful operation
Alert.alert(
  t('success.title'),
  t('success.tournamentRegistered'),
  [{ text: t('common.ok') }]
);
```

Or create reusable Toast component using `react-native-toast-message`

**Status**: 🟡 Open

---

## Technical Debt

### TECH-001: No Request Deduplication in React Query

**Severity**: Low
**File**: [App.tsx](../App.tsx)

**Problem**:
React Query not configured for request deduplication. Multiple components requesting same data may trigger duplicate requests.

**Solution**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,  // Add this
      refetchOnReconnect: true  // Add this
    }
  }
});
```

**Status**: 🟢 Open

---

### TECH-002: No Notification Deep Linking

**Severity**: Medium
**File**: [src/services/notifications.ts](../src/services/notifications.ts)

**Problem**:
Notifications exist but no deep linking configured. Tapping notification doesn't navigate to relevant screen.

**Solution**:
1. Configure deep linking in [app.json](../app.json)
2. Add notification handler:
   ```typescript
   import * as Notifications from 'expo-notifications';

   Notifications.addNotificationResponseReceivedListener(response => {
     const { screen, params } = response.notification.request.content.data;
     navigation.navigate(screen, params);
   });
   ```

**Status**: 🟡 Open

---

### TECH-003: No Background Sync

**Severity**: Medium
**Files**: [src/utils/personalRoundSync.ts](../src/utils/personalRoundSync.ts), [src/utils/scorecardSync.ts](../src/utils/scorecardSync.ts)

**Problem**:
Sync only occurs when app is active (foreground). No background task support.

**Solution**:
Implement using `expo-task-manager` and `expo-background-fetch`:
```bash
npx expo install expo-task-manager expo-background-fetch
```

**Status**: 🟠 Open

---

## Performance Concerns

### PERF-001: HomeScreen Multiple Parallel Requests

**Severity**: Medium
**File**: [src/screens/HomeScreen.tsx](../src/screens/HomeScreen.tsx)

**Problem**: Already documented in ISSUE-012

**Status**: 🟡 Open

---

### PERF-002: No Virtual Scrolling for Long Lists

**Severity**: Medium
**Files**: Multiple list screens

**Problem**:
FlatList used but no `windowSize` optimization for very long lists.

**Solution**:
```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  windowSize={21}  // Default is 21, reduce for memory savings
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  removeClippedSubviews={true}
/>
```

**Status**: 🟢 Open

---

### PERF-003: Unnecessary Re-renders

**Severity**: Low
**Files**: Multiple

**Problem**:
Some components may re-render unnecessarily due to:
- Inline function definitions in props
- Missing `useMemo` / `useCallback`
- Non-memoized computed values

**Solution**:
```typescript
// Bad
<Component onPress={() => handlePress(item.id)} />

// Good
const handlePress = useCallback(() => {
  doSomething(item.id);
}, [item.id]);

<Component onPress={handlePress} />
```

**Status**: 🟢 Open (needs profiling to confirm)

---

## Summary Statistics

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Security & Stability | 3 | 0 | 0 | 0 | 3 |
| Functionality | 0 | 3 | 0 | 0 | 3 |
| UX & Quality | 0 | 0 | 6 | 0 | 6 |
| Polish | 0 | 0 | 0 | 4 | 4 |
| **Total** | **3** | **3** | **6** | **4** | **16** |

**Plus**:
- 3 Translation issues
- 2 UX inconsistencies
- 3 Technical debt items
- 3 Performance concerns

**Grand Total**: 27 documented issues

---

## Recommended Fix Order

### Phase 1: Critical (Week 1)
1. ✅ ISSUE-001: Move weather API key to environment
2. ✅ ISSUE-002: Replace all `any` types with proper types
3. ✅ ISSUE-003: Implement real network detection

### Phase 2: High Priority (Week 2)
4. ✅ ISSUE-004: Add sync retry mechanism
5. ✅ ISSUE-005: Fix tournament dispute flow
6. ✅ ISSUE-006: Add pagination to tournaments

### Phase 3: Medium Priority (Week 3-4)
7. ✅ ISSUE-007: Fix hardcoded translations
8. ✅ ISSUE-008: Add empty state components
9. ✅ ISSUE-009: Add loading skeletons
10. ✅ ISSUE-010: Add offline indicator
11. ✅ ISSUE-011: Standardize error messages
12. ✅ ISSUE-012: Refactor HomeScreen data loading

### Phase 4: Polish (Ongoing)
13. All low priority issues
14. Translation audits
15. UX inconsistencies
16. Performance optimizations

---

**End of Current Issues** | Last Updated: 2025-12-05
