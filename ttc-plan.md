# TeeTime Cloud — React Native + Supabase

> **Purpose:** A machine-friendly plan file for an AI or developer to implement the first iteration (MVP) of _TeeTime Cloud_ — a React Native mobile app backed by Supabase. The plan is structured so an AI can generate code, tests, and CI tasks from each section.

---

## 1. Project overview

**App name:** TeeTime Cloud

**Platform:** React Native (TypeScript)

**Backend / BaaS:** Supabase (Auth, Database, Storage, Realtime)

**MVP scope (first iteration):**

- Auth handled by Supabase (SignIn only; no SignUp in app)
- Basic screens (Landing, SignIn, Forgot / Update password)
- Authenticated flows: Home, Available Courses (search), Course Detail, Course Tee Time availability, Tee Time Reservation flow, Notifications list, Tee Times list (past & upcoming), Golfer Profile (edit, support, logout)
- Database schema will be provided as a TypeScript file later — plan includes interfaces & placeholders for the schema.

---

## 2. High-level architecture

- **Client:** React Native + TypeScript, using React Navigation (stack + bottom tabs), state management with React Query + context for session (or optionally Zustand). Use Supabase JS client for auth & db.
- **Storage:** Supabase Storage for course image gallery.
- **Realtime / notifications:** Use Supabase Realtime for in-app notifications. (Push notifications via FCM later — out of scope for MVP.)
- **API patterns:** Direct client-to-Supabase SQL/REST calls via Supabase client (no custom server in MVP). Encapsulate in `services/*` files.

---

## 3. Tech stack & libraries

- React Native (Expo managed or bare? — **recommend Expo** for faster dev if no native modules required)
- TypeScript
- supabase-js (client)
- @react-navigation/native, @react-navigation/stack, @react-navigation/bottom-tabs
- react-query / @tanstack/react-query (data fetching & cache)
- react-hook-form (forms)
- zod (schema validation)
- axios (if needed, otherwise supabase client)
- dayjs (date handling)
- testing-library/react-native, jest
- Eslint + Prettier

---

## 4. Project file structure (suggested)

```
TeeTimeCloudMobile/
├─ src/
│  ├─ App.tsx
│  ├─ expo.ts (if using Expo)
│  ├─ lib/
│  │  ├─ supabaseClient.ts
│  │  └─ storage.ts
│  ├─ navigation/
│  │  ├─ RootNavigator.tsx
│  │  ├─ AuthStack.tsx
│  │  └─ AppTabs.tsx
│  ├─ screens/
│  │  ├─ LandingScreen.tsx
│  │  ├─ SignInScreen.tsx
│  │  ├─ ForgotPasswordScreen.tsx
│  │  ├─ UpdatePasswordScreen.tsx
│  │  ├─ HomeScreen.tsx
│  │  ├─ CoursesScreen.tsx
│  │  ├─ CourseDetailScreen.tsx
│  │  ├─ CourseTeeTimesScreen.tsx
│  │  ├─ ReservationScreen.tsx
│  │  ├─ NotificationsScreen.tsx
│  │  ├─ TeeTimesScreen.tsx
│  │  └─ ProfileScreen.tsx
│  ├─ components/
│  │  ├─ CourseCard.tsx
│  │  ├─ TeeTimeSlot.tsx
│  │  ├─ Gallery.tsx
│  │  └─ NotificationItem.tsx
│  ├─ services/
│  │  ├─ courses.ts
│  │  ├─ reservation.ts
│  │  └─ notifications.ts
│  ├─ hooks/
│  │  └─ useAuth.ts
│  ├─ types/
│  │  ├─ index.ts
│  │  └─ supabase.ts
│  └─ utils/
│     └─ date.ts
├─ package.json
└─ tsconfig.json
```

---

## 5. Supabase setup (recommended)

- No need to create DB in Supabase for this project.

---

## 6. TypeScript interfaces (starter)

- Models are in the TypeScript file src/types/supabase.ts.

---

## 7. Screens & responsibilities (detailed)

### Unauthenticated

**Landing Screen**

- Shows app name, short description, features
- Button -> SignIn

**SignIn Screen**

- Fields: email, password
- Submit -> supabase.auth.signInWithPassword
- Links: Forgot password
- No SignUp action in-app

**Forgot Password Screen**

- Field: email
- Action: supabase.auth.resetPasswordForEmail(email)
- After reset email link, user lands on UpdatePasswordScreen (if using magic link flow) or updates password via link provided by Supabase (outside app). For MVP, include an Update Password screen that accepts a recovery token if desired.

**Update Password Screen**

- Accepts new password and confirmation
- If using a recovery flow token, it will call an API endpoint or supabase.auth.updateUser with the new password.

### Authenticated

**Home Screen**

- Shows summary: profile snippet, home golf course, next tee time, upcoming events for home course, quick link to notifications
- Data sources: `users` profile, `reservations` query for next upcoming, `events` for home course

**Available Golf Courses**

- Search input: server-side search by `name ILIKE %term%`
- List: CourseCard components

**Course Detail Screen**

- Params: `courseId`
- Data: `golf_courses` row
- Show: gallery (carousel), description, amenities list, button -> Course Tee Times, list of future events for this course

**Course Tee Times Screen**

- Params: `courseId`
- Provide date picker (today..today + N days) — N: configurable (e.g., 30)
- Query: `tee_time_slots` where `start_datetime` between selectedDate start/end and `course_id` = courseId and `is_available` = true
- UI: list of `TeeTimeSlot` components with available slots

**Reservation / Tee Time Details Screen**

- Show chosen slot details (time, players cap, price)
- Checkboxes: services offered (e.g., cart, caddie, range balls) — fetch from or infer from course row or separate `services` table
- Notes input
- Confirm button -> create `reservations` row via supabase client and optionally mark slot as reserved or decrement available spots

**Notifications Screen**

- List notifications from `notifications` table for user
- Mark read

**Tee Times Screen**

- Tabs or sections: Upcoming, Past
- Query reservations by user sorted by date

**Profile Screen**

- Show profile details
- Links: Edit Profile, Support (mailto or pre-filled chat/screen), Logout (supabase.auth.signOut())

---

## 8. Services (encapsulate supabase calls)

Create small service files for all DB interactions. Example functions:

- `courses.ts`

  - `fetchCourses(query, page?)`
  - `fetchCourseById(id)`
  - `fetchCourseEvents(courseId)`

- `teeTimes.ts`

  - `fetchTeeTimes(courseId, date)`
  - `reserveSlot(userId, slotId, services, notes)`

- `reservations.ts`

  - `fetchUserReservations(userId, filter?)`

- `notifications.ts`
  - `fetchNotifications(userId)`
  - `subscribeToNotifications(userId, onMessage)` — uses realtime

Each service should return typed results and encapsulate error handling + retry logic.

---

## 9. Data flows & edge cases

- **No past dates:** Enforce date picker min to `today` for tee time slots reservation.
- **Concurrent bookings:** When user confirms reservation, perform a transactional check: verify slot still available (re-query slot row with RLS/locking if possible) then insert reservation and update slot availability. With Supabase Postgres, prefer to implement a Postgres function (RPC) or set business logic with Postgres triggers if concurrency is critical. For MVP, optimistic check with re-query and fail with message if not available.
- **Auth state:** Use Supabase auth state listener to persist session and redirect to Auth or App flow.
- **Permissions:** RLS to ensure users can only view/modify their reservations and notifications.

---

## 10. UI / Navigation suggestions

- Root navigator decides between `AuthStack` and `AppTabs` depending on session.
- `AppTabs` could have: Home, Courses, Tee Times, Notifications, Profile.
- Use a consistent Card component and spacing system.

---

## 11. Placeholder environment variables

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_URL` (if Expo requires public vars)

---

## 12. Acceptance criteria (MVP done)

- Users can sign in with email/password via Supabase.
- Logged-in users see Home screen with profile snippet and their next tee time (if any).
- Users can search courses and view course details and gallery.
- Users can view available tee time slots for a selected date (today..N days ahead).
- Users can create a reservation from a slot with services and notes.
- Users can view notifications and a list of their reservations.
- Profile screen allows logout.

---
