# TeeTime Cloud - Complete Setup Guide

This guide will walk you through setting up the TeeTime Cloud mobile application from scratch.

## Step 1: Create Project Structure

Create the following folder structure:

```
TeeTimeCloudMobile/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── navigation/
│   ├── screens/
│   ├── services/
│   ├── types/
│   └── utils/
├── .env.example
├── .eslintrc.js
├── .prettierrc.js
├── App.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## Step 2: Initialize Expo Project

```bash
# Create a new Expo project
npx create-expo-app TeeTimeCloudMobile --template blank-typescript

# Navigate to project directory
cd TeeTimeCloudMobile
```

## Step 3: Install Dependencies

```bash
# Core dependencies
npm install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill

# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# State management and data fetching
npm install @tanstack/react-query

# Forms and validation
npm install react-hook-form zod

# Date utilities
npm install dayjs

# Dev dependencies
npm install --save-dev @types/react @types/react-native @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks prettier @testing-library/react-native jest
```

## Step 4: Copy Type Definitions

1. Copy the `supabase.ts` file you provided into `src/types/supabase.ts`
2. This contains all your database type definitions

## Step 5: Configure Environment Variables

1. Create `.env` file in the root:
```bash
cp .env.example .env
```

2. Add your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from your Supabase project:
- Go to Project Settings → API
- Copy the Project URL and anon/public key

## Step 6: Create Core Files

Copy all the provided files into their respective locations:

### Configuration Files
- `package.json` → root
- `tsconfig.json` → root
- `.eslintrc.js` → root
- `.prettierrc.js` → root
- `App.tsx` → root

### Library Files
- `src/lib/supabaseClient.ts`
- `src/lib/storage.ts`

### Type Files
- `src/types/index.ts`
- `src/types/supabase.ts` (your provided file)

### Hooks
- `src/hooks/useAuth.ts`

### Services
- `src/services/courses.ts`
- `src/services/teeTimes.ts`
- `src/services/reservations.ts`
- `src/services/notifications.ts`

### Utils
- `src/utils/date.ts`

### Navigation
- `src/navigation/RootNavigator.tsx`
- `src/navigation/AuthStack.tsx`
- `src/navigation/AppTabs.tsx`

### Screens
- `src/screens/LandingScreen.tsx`
- `src/screens/SignInScreen.tsx`
- Plus all other screen placeholders

## Step 7: Update app.json

Update your `app.json` to include:

```json
{
  "expo": {
    "name": "TeeTime Cloud",
    "slug": "teetime-cloud",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#22c55e"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.teetimecloud"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#22c55e"
      },
      "package": "com.yourcompany.teetimecloud"
    },
    "scheme": "teetimecloud",
    "plugins": []
  }
}
```

## Step 8: Set Up Supabase (Backend)

### Row Level Security (RLS)

Since your backend already exists, ensure these RLS policies are in place:

#### Golfer Profiles
```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON golfer_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON golfer_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

#### Courses (Public Read)
```sql
-- Anyone can read active courses
CREATE POLICY "Anyone can view active courses"
  ON courses FOR SELECT
  USING (active = true);
```

#### Tee Time Slots (Public Read)
```sql
-- Anyone can view available tee time slots
CREATE POLICY "Anyone can view available slots"
  ON tee_time_slots FOR SELECT
  USING (status = 'available');
```

#### Reservations
```sql
-- Users can create their own reservations
CREATE POLICY "Users can create reservations"
  ON tee_time_reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can view their own reservations
CREATE POLICY "Users can view own reservations"
  ON tee_time_reservations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own reservations
CREATE POLICY "Users can update own reservations"
  ON tee_time_reservations FOR UPDATE
  USING (auth.uid() = user_id);
```

#### Notifications
```sql
-- Users can read their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
```

## Step 9: Test the Setup

### Start the Development Server
```bash
npm start
```

### Test on Different Platforms

1. **iOS Simulator** (Mac only):
```bash
npm run ios
```

2. **Android Emulator**:
```bash
npm run android
```

3. **Web Browser**:
```bash
npm run web
```

### Test Physical Device
- Install Expo Go app on your phone
- Scan the QR code shown in terminal

## Step 10: Verify Core Functionality

### Test Authentication Flow
1. Open the app → Should show Landing Screen
2. Tap "Get Started" or "Sign In"
3. Enter credentials and sign in
4. Should navigate to Home screen with bottom tabs

### Test Basic Navigation
1. Verify all bottom tabs work: Home, Courses, Tee Times, Notifications, Profile
2. Test back navigation in Courses stack
3. Test sign out from Profile

## Step 11: Create Test User in Supabase

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter email and password
4. Use these credentials to test sign in

Or use SQL:
```sql
-- This will be done through Supabase Auth UI or signup flow
```

## Step 12: Customize the App

### Brand Colors
Update colors in screen styles:
- Primary: `#22c55e` (green)
- Text: `#111827`, `#374151`, `#6b7280`
- Background: `#fff`

### Add Icons
Consider adding a proper icon library:
```bash
npm install @expo/vector-icons
```

Then update tab icons in `AppTabs.tsx` to use proper icons instead of emojis.

## Common Issues and Solutions

### Issue: "Cannot find module '@/types'"
**Solution**: Make sure tsconfig.json paths are set up correctly and restart Metro bundler with cache clear:
```bash
npm start -- --clear
```

### Issue: Supabase client errors
**Solution**: 
- Verify environment variables are correct
- Check that `react-native-url-polyfill` is imported in supabaseClient.ts
- Restart the app

### Issue: Navigation types errors
**Solution**: Make sure all navigation types in `src/types/index.ts` match your screen names

### Issue: iOS build fails
**Solution**: 
```bash
cd ios && pod install && cd ..
npx expo run:ios
```

## Next Steps

Now that the basic structure is set up:

1. **Implement Remaining Screens**: Build out the full UI for each screen
2. **Add Components**: Create reusable components (CourseCard, TeeTimeSlot, etc.)
3. **Improve Error Handling**: Add better error messages and retry logic
4. **Add Loading States**: Implement skeletons/spinners for better UX
5. **Implement Search**: Add search functionality for courses
6. **Add Images**: Implement course gallery with image carousel
7. **Push Notifications**: Set up Firebase Cloud Messaging
8. **Testing**: Write unit and integration tests
9. **Polish UI**: Improve styling and animations

## Development Workflow

```bash
# Start development
npm start

# Run linter
npm run lint

# Format code
npm run format

# Run tests
npm test
```

## Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)

## Getting Help

If you encounter issues:
1. Check the error message carefully
2. Clear Metro bundler cache: `npm start -- --clear`
3. Check Supabase logs in dashboard
4. Review this guide and README.md
5. Check GitHub issues or create a new one

Good luck with your TeeTime Cloud app! 🏌️⛳
