# Geographical Search for Courses - Implementation Plan

## Overview
Add the ability to search for golf courses by proximity to user's location or a specified city, display distances, and sort/filter by distance.

## Architecture Decision
**Hybrid approach**: Server-side distance calculation via Supabase RPC function (primary) with client-side Haversine fallback. This enables efficient pagination with distance-sorted results.

---

## Phase 1: Infrastructure Setup

### 1.1 Install expo-location
```bash
npx expo install expo-location
```

### 1.2 Update app.json permissions
Add to `ios.infoPlist`:
```json
"NSLocationWhenInUseUsageDescription": "TeeTime Cloud uses your location to find golf courses near you."
```

Add to `android.permissions`:
```json
["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"]
```

Add to `plugins`:
```json
["expo-location", { "locationAlwaysAndWhenInUsePermission": "..." }]
```

### 1.3 Create location utility
**New file**: `src/utils/location.ts`
- `Coordinates` interface (`latitude`, `longitude`)
- `calculateDistanceMiles(point1, point2)` - Haversine formula
- `formatDistance(miles)` - Display formatting ("1.2 mi", "< 0.1 mi")

### 1.4 Create location hook
**New file**: `src/hooks/useLocation.ts`
- Get/cache device GPS coordinates
- Handle permission states (`undetermined`, `granted`, `denied`)
- Expose `requestPermission()`, `refreshLocation()`
- Use `expo-location` APIs

---

## Phase 2: Backend (Supabase)

### 2.1 Create RPC function
**Supabase SQL**: `get_courses_near_location`

Parameters:
- `user_lat`, `user_lon` (coordinates)
- `max_distance_miles` (default: 100)
- `search_term` (optional name filter)
- `page_number`, `page_limit` (pagination)

Returns: courses with `distance_miles` calculated, sorted by distance ASC

Uses Haversine formula on `location` JSON field (`latitude`, `longitude`).

---

## Phase 3: Service Layer

### 3.1 Update courses service
**File**: `src/services/courses.ts`

Add methods:
- `fetchCoursesNearLocation(params)` - Calls RPC function
- `geocodeCity(cityName)` - Uses WeatherAPI search endpoint for city-to-coordinates

Add type:
```typescript
interface CourseWithDistance extends Course {
  distance_miles: number;
}
```

---

## Phase 4: UI Components

### 4.1 DistanceBadge component
**New file**: `src/components/DistanceBadge.tsx`
- Compact badge showing distance (e.g., "1.2 mi")
- Navigation icon + formatted distance
- Dark mode support, brand green accent

### 4.2 LocationPermissionPrompt component
**New file**: `src/components/LocationPermissionPrompt.tsx`
- Prompt UI for requesting location access
- Different states for `undetermined` vs `denied`
- "Enable Location" / "Open Settings" buttons

### 4.3 Add translations
**Files**: `src/locales/en.json`, `src/locales/es.json`
- Location permission prompts
- "Near Me", "Near City", search placeholders
- Error/empty states

---

## Phase 5: CoursesScreen Integration

### 5.1 Add search mode toggle
**File**: `src/screens/CoursesScreen.tsx`

Add segmented control with 3 modes:
1. **Search by Name** (current default)
2. **Near Me** (uses device GPS)
3. **Near City** (text input for city name)

### 5.2 Add state management
```typescript
const [searchMode, setSearchMode] = useState<'name' | 'nearMe' | 'nearCity'>('name');
const [maxDistance, setMaxDistance] = useState<number>(50);
```

### 5.3 Update fetch logic
- `nearMe` mode: Get GPS → call `fetchCoursesNearLocation`
- `nearCity` mode: Geocode city → call `fetchCoursesNearLocation`
- `name` mode: Existing `fetchCourses` behavior

### 5.4 Update course cards
- Show `DistanceBadge` when in location mode
- Cards already have location text (city, state)

### 5.5 Add distance filter
- Slider or segmented control: 10, 25, 50, 100, 200 mi
- Default: 50 miles

### 5.6 Handle permission states
- Show `LocationPermissionPrompt` when `undetermined`/`denied`
- Loading state while fetching GPS
- Error state with retry option

---

## Phase 6: Types Update

**File**: `src/types/index.ts`

Add:
```typescript
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CourseWithDistance extends Course {
  distance_miles: number;
}

export type LocationSearchMode = 'name' | 'nearMe' | 'nearCity';
```

---

## Files to Modify
| File | Changes |
|------|---------|
| `app.json` | Add location permissions |
| `src/services/courses.ts` | Add `fetchCoursesNearLocation`, `geocodeCity` |
| `src/screens/CoursesScreen.tsx` | Search mode toggle, distance display, permission UI |
| `src/types/index.ts` | Add location types |
| `src/locales/en.json` | Add location translations |
| `src/locales/es.json` | Add Spanish translations |

## New Files to Create
| File | Purpose |
|------|---------|
| `src/utils/location.ts` | Haversine calculation, distance formatting |
| `src/hooks/useLocation.ts` | Device GPS hook with permissions |
| `src/components/DistanceBadge.tsx` | Distance display component |
| `src/components/LocationPermissionPrompt.tsx` | Permission request UI |

## Supabase Changes
- Create RPC function `get_courses_near_location`

---

## Implementation Order
1. Install `expo-location` + update `app.json`
2. Create `src/utils/location.ts`
3. Create `src/hooks/useLocation.ts`
4. Create Supabase RPC function
5. Update `src/services/courses.ts`
6. Create UI components (`DistanceBadge`, `LocationPermissionPrompt`)
7. Add translations
8. Update `CoursesScreen.tsx` with full integration
9. Update `src/types/index.ts`
10. Test permission flows on iOS/Android
