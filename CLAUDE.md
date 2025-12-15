# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**TeeTime Cloud Mobile** is a premium React Native mobile application for golf course management and tournament operations. Built with Expo, Supabase, and TypeScript.

**Tech Stack:**
- **Framework:** React Native with Expo SDK ~52.0
- **Language:** TypeScript (strict mode)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Backend:** Supabase (PostgreSQL with generated types)
- **State Management:** @tanstack/react-query for server state, React Context for global state
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **Internationalization:** i18next (English & Spanish)
- **Icons:** Lucide React Native
- **Error Tracking:** Sentry

---

## Development Commands

### Essential Commands

```bash
# Install dependencies
npm install
# OR
make install

# Start development server
npm start
# OR
make start

# Run on specific platforms
npm run android    # Android
npm run ios        # iOS
npm run web        # Web

# Code quality
npm run lint       # ESLint
npm run format     # Prettier
npm run test       # Jest
# OR use make targets
make lint
make format
make type-check
```

### Makefile Targets

The project includes a comprehensive Makefile. Run `make help` to see all available commands. Key targets:

- `make env-check` - Verify environment configuration
- `make doctor` - Run Expo health check
- `make clean` - Clean build artifacts and cache
- `make deep-clean` - Full clean and reinstall
- `make pod-install` - Install iOS CocoaPods (after adding native deps)
- `make build-dev` - Build development version with EAS
- `make build-preview` - Build preview version
- `make build-prod` - Build production version

### Environment Setup

1. Copy `.env.example` to `.env`
2. Configure required environment variables:
   - `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
   - `EXPO_PUBLIC_WEATHER_API_KEY` - Weather API key

---

## Architecture & File Structure

### Directory Organization

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers (Theme, Language, Notifications)
├── hooks/          # Custom React hooks
├── lib/            # Core libraries (Supabase client, storage wrapper)
├── locales/        # i18n translation files (en.json, es.json)
├── navigation/     # Navigation structure (Stacks, Tabs, Root)
├── screens/        # Screen components organized by feature
├── services/       # Backend API service layer (all Supabase interactions)
├── types/          # TypeScript type definitions
└── utils/          # Utility functions and helpers
```

### Import Aliases

The project uses TypeScript path aliases configured in `tsconfig.json`:

```typescript
@/*            -> src/*
@components/*  -> src/components/*
@screens/*     -> src/screens/*
@services/*    -> src/services/*
@hooks/*       -> src/hooks/*
@types/*       -> src/types/*
@utils/*       -> src/utils/*
@lib/*         -> src/lib/*
@navigation/*  -> src/navigation/*
```

**Always use these aliases** instead of relative imports.

---

## Key Architectural Patterns

### 1. Component Composition & Organization

**CRITICAL: Never create large monolithic screens or components.**

#### Component Size Rules
- Main screens should be **under 200 lines** of code
- If a screen/component exceeds this limit, extract sections into smaller components
- Create a dedicated directory for related components under `src/components/[feature-name]/`

#### Styling Separation
- **NEVER** use inline `StyleSheet.create()` in screen files
- Extract all styles to a separate `styles.ts` file in the component directory
- Export styles as a named constant (e.g., `export const featureStyles = StyleSheet.create({...})`)

#### Recommended Structure
```
src/
├── screens/
│   └── FeatureScreen.tsx          # Main screen (< 200 lines, imports subcomponents)
└── components/
    └── feature-name/
        ├── index.ts               # Export all components and styles
        ├── styles.ts              # All StyleSheet definitions
        ├── SubComponentA.tsx      # Focused subcomponent
        ├── SubComponentB.tsx      # Focused subcomponent
        └── SubComponentC.tsx      # Focused subcomponent
```

#### Refactoring Workflow
When creating or updating a complex screen:
1. **Identify** logical sections (header, gallery, content, actions, etc.)
2. **Create** a component directory under `src/components/`
3. **Extract** each section into its own component file
4. **Move** all `StyleSheet` definitions to `styles.ts`
5. **Create** `index.ts` to export all components and styles
6. **Update** the main screen to import and compose components

#### Example
See `src/screens/CourseDetailScreen.tsx` and `src/components/course-detail/` for a reference implementation.

**Benefits:**
- ✅ Improved maintainability and readability
- ✅ Better code reusability across the app
- ✅ Easier testing of individual components
- ✅ Clearer separation of concerns
- ✅ Simplified code reviews

### 2. Service Layer Pattern

**All backend interactions must be in `src/services/`**. Services export typed functions that interact with Supabase.

Example structure:
```typescript
// src/services/tournaments.ts
import { supabase } from '@/lib/supabaseClient';
import { ApiResponse } from '@/types';
import { Tables } from '@/types/supabase';

export type Tournament = Tables<'tournaments'>;

export const tournamentsService = {
  async fetchTournaments(page = 1, limit = 20): Promise<ApiResponse<Tournament[]>> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('start_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  }
};
```

**Never write Supabase queries directly in components or screens.**

### 3. Supabase Type Safety

The project uses auto-generated Supabase types in `src/types/supabase.ts`.

- Always import `Database` and use `Tables<'table_name'>` for table types
- Never use `any` for database queries
- The Supabase client is typed: `createClient<Database>(...)`

### 4. Provider Architecture

The app wraps multiple providers in `App.tsx`:

```
SafeAreaProvider
  → LanguageProvider (i18n)
    → ThemeProvider (dark/light mode)
      → QueryClientProvider (react-query)
        → AuthProvider (authentication state)
          → NotificationProvider
```

Access these via custom hooks:
- `useAuth()` - User authentication state
- `useTheme()` - Dark/light mode
- `useTranslation()` from react-i18next - Translations

### 5. Navigation Structure

```
RootNavigator
  ├── AuthStack (when user is not authenticated)
  │   ├── LandingScreen
  │   ├── SignInScreen
  │   └── ForgotPasswordScreen
  └── AppTabs (when user is authenticated)
      ├── HomeTab
      ├── TournamentsStack
      ├── RoundsStack
      ├── TeeTimesTab
      └── ProfileTab
```

Navigation is conditional based on authentication state (see `src/navigation/RootNavigator.tsx`).

### 6. Internationalization (i18n)

- All user-facing text must be in `src/locales/en.json` and `src/locales/es.json`
- Use `t('key')` from `useTranslation()` hook
- Never hardcode user-facing strings
- Nested keys use dot notation: `t('screens.home.title')`

Example:
```typescript
import { useTranslation } from 'react-i18next';

function MyScreen() {
  const { t } = useTranslation();
  return <Text>{t('screens.myScreen.welcomeMessage')}</Text>;
}
```

### 7. Styling with NativeWind

- Use NativeWind classes via `className` prop
- Avoid inline `style` prop unless for dynamic styles
- Follow the custom color palette in `tailwind.config.js`:
  - Primary greens: `primary`, `fairway`
  - Premium neutrals: `neutral-*`
  - Dark mode: `dark:` prefix
- Theme-aware components use `dark:` classes

Example:
```typescript
<View className="bg-light-background dark:bg-dark-background p-4">
  <Text className="text-neutral-900 dark:text-neutral-50 text-lg font-semibold">
    {t('title')}
  </Text>
</View>
```

### 8. React Query Patterns

- Use `@tanstack/react-query` for server state
- Query client configured in `App.tsx` with:
  - 2 retries
  - 5-minute stale time
  - 10-minute cache time
- Prefer custom hooks that wrap queries (see `src/hooks/useHomeData.ts`)

Example:
```typescript
import { useQuery } from '@tanstack/react-query';
import { tournamentsService } from '@services/tournaments';

const { data, isLoading, error } = useQuery({
  queryKey: ['tournaments', page],
  queryFn: () => tournamentsService.fetchTournaments(page),
});
```

---

## Important Guidelines

### Data Fetching & Pagination

For endpoints that can return over 300 rows:
- Implement pagination (20 items per page)
- Use virtual scrolling (FlatList with pagination)
- Pass `page` and `limit` parameters to service functions

### Error Handling

- Services return `ApiResponse<T>` type: `{ data: T | null, error: string | null }`
- Always handle both success and error cases
- Use Sentry for error tracking (already configured)

### Component Naming

- Components: `PascalCase` (e.g., `TournamentCard.tsx`)
- Files: Match component name
- Hooks: `camelCase` starting with `use` (e.g., `useAuth.tsx`)
- Services: `camelCase` with `Service` suffix (e.g., `tournamentsService`)

### TypeScript

- Strict mode enabled
- Always provide explicit types for function parameters and return values
- Use generated Supabase types from `@/types/supabase`
- Avoid `any` - use `unknown` if type is truly unknown

### Mobile Performance

- Avoid heavy computations on the UI thread
- Use `React.memo()` for expensive components
- Implement pagination and virtual scrolling for long lists
- Batch state updates when possible

### Security

- Never commit `.env` file
- Keep secrets in environment variables
- Update `.env.example` when adding new env vars
- All environment variables must use `EXPO_PUBLIC_` prefix to be accessible

---

## Supabase Client Setup

The Supabase client is initialized in `src/lib/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '@/types/supabase';

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

**Key points:**
- Client is typed with `Database` for full type safety
- Uses `AsyncStorage` for session persistence
- Auto-refresh and persist session enabled

---

## Design System

### Premium Golf-Inspired Visual Style

**Color Palette** (see `tailwind.config.js`):
- **Primary Greens:** Professional golf course aesthetic
  - `primary-500`: #2d7a4e (default)
  - `fairway`: #3d8b5d
- **Accent Colors:** Subtle, premium touches
  - `accent-gold`: #c5a572
  - `accent-bronze`: #b8956a
- **Neutrals:** Cool grays and charcoal
  - Light mode: `neutral-50` to `neutral-900`
  - Dark mode: Deep charcoal with green undertones

**Typography Hierarchy:**
- Heading XL: 28-32px, semibold (screen titles)
- Heading L: 24px, semibold (section headers)
- Body M: 16px, regular (default text)
- Body S: 14px, medium (labels, secondary info)

**Icon Guidelines:**
- Use Lucide React Native exclusively
- Stroke-based, 1.5-2px weight
- Golf-specific icons preferred (flag, golf ball, tee marker)
- Avoid generic/overused icons

**UI Personality:** Premium but friendly, sporty, modern, minimal. Avoid generic "flat blue app" aesthetics.

---

## Testing

Tests use Jest. Run with:
```bash
npm test
# OR
make test
```

Test files should be co-located with source files or in `__tests__` directories.

---

## Building & Deployment

The project uses EAS Build for native builds:

```bash
# Development build
make build-dev

# Preview build (internal testing)
make build-preview

# Production build
make build-prod
```

Build configuration in `eas.json`.

---

## Common Patterns

### Creating a New Screen

1. Create screen component in `src/screens/[feature]/`
2. Add translations to `en.json` and `es.json`
3. Add to navigation stack
4. Create service functions if backend interaction needed
5. Use NativeWind for styling
6. Implement proper loading and error states

### Adding a New Service

1. Create file in `src/services/`
2. Import Supabase client and types
3. Export typed functions that return `ApiResponse<T>`
4. Handle errors gracefully
5. Use generated types from `@/types/supabase`

### Adding Environment Variables

1. Add to `.env` (never commit)
2. Update `.env.example` with placeholder
3. Use `EXPO_PUBLIC_` prefix
4. Access via `process.env.EXPO_PUBLIC_YOUR_VAR`
5. Add TypeScript type declaration if needed

---

## Existing Project Components

The project already has many reusable components. **Always check for existing components before creating new ones.** Key components include:

- `TournamentCard` - Display tournament information
- `ScorecardGrid` - Golf scorecard display
- `NetworkStatusBanner` - Offline/online status
- `NotificationHeaderButton` - Notification bell with badge

Browse `src/components/` before implementing new UI elements.
