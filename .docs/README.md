# TeeTime Cloud Mobile

A React Native mobile application for booking golf course tee times, built with Expo and Supabase.

## Features

- 🔐 Authentication with Supabase (Sign In, Password Reset)
- ⛳ Browse and search golf courses
- 📅 View available tee time slots
- 📝 Make tee time reservations
- 🔔 Real-time notifications
- 👤 User profile management
- 📱 Native iOS and Android support

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **Navigation**: React Navigation v6
- **State Management**: React Query + Context API
- **Forms**: React Hook Form + Zod
- **Date Handling**: Day.js

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio
- Supabase account and project

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TeeTimeCloudMobile
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Running the App

Start the development server:
```bash
npm start
```

Run on specific platform:
```bash
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser
```

## Project Structure

```
TeeTimeCloudMobile/
├── src/
│   ├── components/      # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Configuration files (Supabase client)
│   ├── navigation/     # Navigation setup
│   ├── screens/        # Screen components
│   ├── services/       # API service functions
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── App.tsx             # Root component
├── package.json
└── tsconfig.json
```

## Key Services

### Authentication (`hooks/useAuth.ts`)
- Sign in / Sign out
- Password reset
- Session management
- Profile fetching

### Courses (`services/courses.ts`)
- Fetch courses
- Search courses
- Get course details
- Fetch course events and gallery

### Tee Times (`services/teeTimes.ts`)
- Fetch available slots
- Reserve tee time
- Check availability

### Reservations (`services/reservations.ts`)
- Fetch user reservations
- Get upcoming bookings
- Cancel reservations

### Notifications (`services/notifications.ts`)
- Fetch notifications
- Real-time subscription
- Mark as read

## Database Schema

The app uses the following main tables from Supabase:
- `courses` - Golf course information
- `tee_time_slots` - Available tee times
- `tee_time_reservations` - User bookings
- `golfer_profiles` - User profiles
- `notifications` - User notifications
- `course_events` - Course events
- `course_gallery` - Course images

See `src/types/supabase.ts` for complete schema definitions.

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Implement proper error handling

### State Management
- Use React Query for server state
- Use Context API for auth state
- Keep component state local when possible

### Navigation
- Auth flow separate from App flow
- Stack navigation for related screens
- Bottom tabs for main app sections

## Testing

Run tests:
```bash
npm test
```

Run linter:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Environment Variables

Required environment variables:
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

## Troubleshooting

### Common Issues

1. **Metro bundler cache issues**:
```bash
expo start -c
```

2. **iOS Simulator not opening**:
```bash
npx expo run:ios
```

3. **Android build fails**:
- Ensure Android Studio and SDK are properly installed
- Check Java version compatibility

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linter
4. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions, please open an issue on GitHub or contact support.