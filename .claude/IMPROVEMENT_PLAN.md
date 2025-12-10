# TeeTime Cloud Mobile — Improvement Plan

**Last Updated**: 2025-12-05
**Version**: 1.0.0
**Purpose**: Roadmap for enhancing existing functionalities with detailed implementation strategies.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & User Management](#authentication--user-management)
3. [Tournament Experience](#tournament-experience)
4. [Personal Round Tracking](#personal-round-tracking)
5. [Course Discovery & Tee Times](#course-discovery--tee-times)
6. [Offline & Sync](#offline--sync)
7. [Performance Optimization](#performance-optimization)
8. [UI/UX Enhancement](#uiux-enhancement)
9. [Analytics & Insights](#analytics--insights)
10. [Social Features](#social-features)

---

## Overview

This document outlines improvements to **existing** TeeTime Cloud features. These enhancements focus on:
- Improving user experience
- Adding depth to current features
- Performance optimization
- Better data visualization
- Enhanced social interaction

---

## Authentication & User Management

### IMP-AUTH-001: Social Login Integration

**Current State**: Email/password only via Supabase Auth

**Enhancement**:
Add OAuth providers for easier onboarding:
- Sign in with Google
- Sign in with Apple (required for App Store)
- Sign in with Facebook (optional)

**Implementation**:

1. **Configure Supabase OAuth**:
   ```bash
   # In Supabase Dashboard > Authentication > Providers
   # Enable Google, Apple, Facebook
   ```

2. **Update SignInScreen**:
   ```typescript
   // src/screens/SignInScreen.tsx
   import * as WebBrowser from 'expo-web-browser';
   import { makeRedirectUri } from 'expo-auth-session';

   const handleGoogleSignIn = async () => {
     const redirectUrl = makeRedirectUri();
     const { data, error } = await supabase.auth.signInWithOAuth({
       provider: 'google',
       options: { redirectTo: redirectUrl }
     });

     if (error) {
       showError('signInFailed');
       return;
     }

     if (data.url) {
       await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
     }
   };
   ```

3. **Add Social Buttons**:
   ```tsx
   <View className="space-y-3">
     <SocialLoginButton
       provider="google"
       onPress={handleGoogleSignIn}
       icon={<GoogleIcon />}
       label={t('auth.signInWithGoogle')}
     />
     <SocialLoginButton
       provider="apple"
       onPress={handleAppleSignIn}
       icon={<AppleIcon />}
       label={t('auth.signInWithApple')}
     />
   </View>
   ```

4. **Handle OAuth Callback**:
   ```typescript
   // App.tsx
   useEffect(() => {
     const handleUrl = async (event: { url: string }) => {
       const { data } = await supabase.auth.getSessionFromUrl({ url: event.url });
       if (data.session) {
         // User authenticated, create profile if first time
       }
     };

     Linking.addEventListener('url', handleUrl);
     return () => Linking.removeAllListeners('url');
   }, []);
   ```

**Benefits**:
- Faster sign-up flow
- Better conversion rates
- Required for iOS App Store (Apple Sign In)

**Effort**: Medium (3-5 days)
**Priority**: High

---

### IMP-AUTH-002: Enhanced Profile Management

**Current State**: Basic profile with handicap, name, email

**Enhancement**:
Rich golfer profiles with:
- Profile banner image
- Golf club affiliations
- Preferred courses
- Playing style tags (aggressive, conservative, etc.)
- Equipment preferences (brand loyalty tracking)
- Home course weather widget
- Playing partners (friends list)
- Privacy settings

**Implementation**:

1. **Update Database Schema**:
   ```sql
   ALTER TABLE golfer_profiles ADD COLUMN banner_image_url TEXT;
   ALTER TABLE golfer_profiles ADD COLUMN bio TEXT;
   ALTER TABLE golfer_profiles ADD COLUMN preferred_courses UUID[];
   ALTER TABLE golfer_profiles ADD COLUMN playing_style TEXT[];
   ALTER TABLE golfer_profiles ADD COLUMN equipment JSONB;
   ALTER TABLE golfer_profiles ADD COLUMN privacy_settings JSONB DEFAULT '{
     "show_handicap": true,
     "show_stats": true,
     "show_rounds": "friends",
     "show_tournaments": true
   }'::jsonb;

   CREATE TABLE golfer_connections (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     golfer_id UUID REFERENCES golfer_profiles NOT NULL,
     connected_golfer_id UUID REFERENCES golfer_profiles NOT NULL,
     status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')),
     created_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(golfer_id, connected_golfer_id)
   );
   ```

2. **Create Profile Components**:
   ```typescript
   // src/components/ProfileBanner.tsx
   export const ProfileBanner: React.FC<{ profile: GolferProfile }> = ({ profile }) => (
     <View className="relative">
       <Image
         source={{ uri: profile.banner_image_url || defaultBanner }}
         className="w-full h-48"
       />
       <View className="absolute bottom-4 left-4 flex-row items-end">
         <Image
           source={{ uri: profile.profile_image_url }}
           className="w-24 h-24 rounded-full border-4 border-white"
         />
         <View className="ml-4 mb-2">
           <Text className="text-2xl font-bold text-white shadow-lg">
             {profile.first_name} {profile.last_name}
           </Text>
           <Text className="text-white font-medium shadow-lg">
             {t('profile.handicap')}: {profile.handicap}
           </Text>
         </View>
       </View>
     </View>
   );
   ```

3. **Add Privacy Settings Screen**:
   ```typescript
   // src/screens/PrivacySettingsScreen.tsx
   export const PrivacySettingsScreen = () => {
     const { profile, updateProfile } = useProfile();
     const [settings, setSettings] = useState(profile.privacy_settings);

     const handleSave = async () => {
       await updateProfile({ privacy_settings: settings });
       Alert.alert(t('success.title'), t('success.privacyUpdated'));
     };

     return (
       <ScrollView className="flex-1 bg-white dark:bg-charcoal">
         <SettingToggle
           label={t('privacy.showHandicap')}
           value={settings.show_handicap}
           onChange={(val) => setSettings({ ...settings, show_handicap: val })}
         />
         <SettingPicker
           label={t('privacy.showRounds')}
           value={settings.show_rounds}
           options={['public', 'friends', 'private']}
           onChange={(val) => setSettings({ ...settings, show_rounds: val })}
         />
         {/* More settings... */}
       </ScrollView>
     );
   };
   ```

**Benefits**:
- Richer user profiles
- Better community building
- Privacy control
- Enhanced personalization

**Effort**: Large (2 weeks)
**Priority**: Medium

---

### IMP-AUTH-003: Two-Factor Authentication

**Current State**: Password-only security

**Enhancement**:
Add optional 2FA for account security.

**Implementation**:

1. **Use Supabase MFA**:
   ```typescript
   // Enable 2FA
   const { data, error } = await supabase.auth.mfa.enroll({
     factorType: 'totp'
   });

   // Show QR code for authenticator app
   const qrCode = data.totp.qr_code;

   // Verify 2FA code
   await supabase.auth.mfa.verify({
     factorId: data.id,
     code: userEnteredCode
   });
   ```

2. **Add 2FA Settings Screen**:
   - Enable/disable 2FA
   - Show QR code for enrollment
   - Recovery codes generation
   - Backup methods

**Benefits**:
- Enhanced security
- Meet enterprise requirements
- Protect high-value accounts

**Effort**: Medium (3-5 days)
**Priority**: Low

---

## Tournament Experience

### IMP-TOURN-001: Advanced Tournament Formats

**Current State**: Basic stroke play tournaments

**Enhancement**:
Support multiple tournament formats:
- **Match Play**: Head-to-head matchups
- **Stableford**: Points-based scoring
- **Best Ball**: Team format (2/4 players)
- **Scramble**: Team format (all players)
- **Skins**: Hole-by-hole competition

**Implementation**:

1. **Update Database**:
   ```sql
   ALTER TABLE tournaments ADD COLUMN format TEXT CHECK (format IN (
     'stroke_play',
     'match_play',
     'stableford',
     'best_ball',
     'scramble',
     'skins'
   )) DEFAULT 'stroke_play';

   ALTER TABLE tournaments ADD COLUMN format_config JSONB DEFAULT '{
     "points": {"eagle": 4, "birdie": 3, "par": 2, "bogey": 1},
     "team_size": 2,
     "skins_carryover": true
   }'::jsonb;
   ```

2. **Create Format-Specific Scoring Components**:
   ```typescript
   // src/components/scoring/StablefordScoring.tsx
   export const StablefordScoring: React.FC<{ hole: Hole }> = ({ hole }) => {
     const calculatePoints = (strokes: number, par: number) => {
       const diff = par - strokes;
       if (diff >= 2) return 4; // Eagle+
       if (diff === 1) return 3; // Birdie
       if (diff === 0) return 2; // Par
       if (diff === -1) return 1; // Bogey
       return 0; // Double bogey+
     };

     return (
       <View>
         <Text>Strokes: {hole.strokes}</Text>
         <Text className="text-lg font-bold">
           Points: {calculatePoints(hole.strokes, hole.par)}
         </Text>
       </View>
     );
   };
   ```

3. **Format-Specific Leaderboards**:
   ```typescript
   // src/screens/tournaments/FormatLeaderboard.tsx
   const renderLeaderboardItem = (item: LeaderboardEntry) => {
     switch (tournament.format) {
       case 'stableford':
         return <StablefordLeaderboardCard entry={item} />;
       case 'match_play':
         return <MatchPlayBracket entry={item} />;
       default:
         return <StrokePlayLeaderboardCard entry={item} />;
     }
   };
   ```

**Benefits**:
- More tournament variety
- Appeal to different player preferences
- Team play support
- Advanced competition formats

**Effort**: Large (2-3 weeks)
**Priority**: High

---

### IMP-TOURN-002: Live Tournament Updates & Push Notifications

**Current State**: Manual refresh for leaderboard

**Enhancement**:
Real-time updates with push notifications:
- Leaderboard position changes
- Group mate score updates
- Tournament announcements
- Weather delays
- Tee time changes

**Implementation**:

1. **Setup Supabase Realtime**:
   ```typescript
   // src/hooks/useTournamentRealtime.ts
   export const useTournamentRealtime = (tournamentId: string) => {
     const queryClient = useQueryClient();

     useEffect(() => {
       const channel = supabase
         .channel(`tournament:${tournamentId}`)
         .on(
           'postgres_changes',
           {
             event: 'UPDATE',
             schema: 'public',
             table: 'tournament_scores',
             filter: `tournament_id=eq.${tournamentId}`
           },
           (payload) => {
             // Invalidate leaderboard query
             queryClient.invalidateQueries(['leaderboard', tournamentId]);

             // Show notification if enabled
             if (shouldNotify(payload)) {
               showPushNotification({
                 title: t('tournament.scoreUpdate'),
                 body: t('tournament.playerScored', {
                   player: payload.new.golfer_name,
                   score: payload.new.strokes
                 })
               });
             }
           }
         )
         .subscribe();

       return () => {
         supabase.removeChannel(channel);
       };
     }, [tournamentId]);
   };
   ```

2. **Configure Push Notifications**:
   ```bash
   npx expo install expo-notifications
   ```

   ```typescript
   // src/utils/notifications.ts
   import * as Notifications from 'expo-notifications';

   export const setupNotifications = async () => {
     const { status } = await Notifications.requestPermissionsAsync();
     if (status !== 'granted') return;

     const token = await Notifications.getExpoPushTokenAsync();

     // Save token to database
     await supabase
       .from('golfer_profiles')
       .update({ push_token: token.data })
       .eq('id', currentUserId);
   };

   Notifications.setNotificationHandler({
     handleNotification: async () => ({
       shouldShowAlert: true,
       shouldPlaySound: true,
       shouldSetBadge: true
     })
   });
   ```

3. **Tournament Notification Settings**:
   ```typescript
   // src/screens/tournaments/TournamentNotificationSettings.tsx
   export const TournamentNotificationSettings = () => (
     <View className="p-4">
       <SettingToggle
         label={t('notifications.leaderboardChanges')}
         value={settings.leaderboard}
         onChange={(val) => updateSetting('leaderboard', val)}
       />
       <SettingToggle
         label={t('notifications.groupMates')}
         value={settings.groupMates}
         onChange={(val) => updateSetting('groupMates', val)}
       />
       <SettingToggle
         label={t('notifications.announcements')}
         value={settings.announcements}
         onChange={(val) => updateSetting('announcements', val)}
       />
     </View>
   );
   ```

**Benefits**:
- Enhanced engagement
- Real-time competition awareness
- Better tournament communication
- Reduced need for manual refreshes

**Effort**: Medium (1 week)
**Priority**: High

---

### IMP-TOURN-003: Tournament Statistics & Performance Analysis

**Current State**: Basic scoring only

**Enhancement**:
Detailed tournament performance analytics:
- Round-by-round breakdown
- Hole difficulty analysis
- Best/worst holes
- Scoring trends
- Comparison to field average
- Statistical leaders (driving, putting, etc.)

**Implementation**:

1. **Create Analytics View**:
   ```sql
   CREATE VIEW tournament_analytics AS
   SELECT
     t.id AS tournament_id,
     h.hole_number,
     AVG(s.strokes) AS avg_strokes,
     MIN(s.strokes) AS best_score,
     MAX(s.strokes) AS worst_score,
     COUNT(CASE WHEN s.green_in_regulation THEN 1 END)::FLOAT / COUNT(*)::FLOAT AS gir_percentage,
     AVG(s.putts) AS avg_putts
   FROM tournaments t
   JOIN tournament_rounds tr ON tr.tournament_id = t.id
   JOIN tournament_scores s ON s.tournament_round_id = tr.id
   JOIN course_holes h ON h.hole_number = s.hole_number
   GROUP BY t.id, h.hole_number;
   ```

2. **Create Analytics Screen**:
   ```typescript
   // src/screens/tournaments/TournamentAnalytics.tsx
   export const TournamentAnalytics = ({ tournamentId }: Props) => {
     const { data: analytics } = useQuery(
       ['tournamentAnalytics', tournamentId],
       () => tournamentsService.fetchAnalytics(tournamentId)
     );

     return (
       <ScrollView className="flex-1 bg-white dark:bg-charcoal">
         <Section title={t('analytics.performanceSummary')}>
           <StatCard
             label={t('analytics.averageScore')}
             value={analytics.avgScore}
             comparison={analytics.fieldAvg}
           />
           <StatCard
             label={t('analytics.bestRound')}
             value={analytics.bestRound}
           />
           <StatCard
             label={t('analytics.gir')}
             value={`${analytics.girPercentage}%`}
           />
         </Section>

         <Section title={t('analytics.scoringByHole')}>
           <BarChart
             data={analytics.holeScores}
             xKey="hole"
             yKey="score"
             height={200}
           />
         </Section>

         <Section title={t('analytics.statisticalLeaders')}>
           <LeaderTable
             categories={[
               'driving_distance',
               'fairway_accuracy',
               'gir',
               'putting_average',
               'sand_saves'
             ]}
             data={analytics.leaders}
           />
         </Section>
       </ScrollView>
     );
   };
   ```

3. **Add to Tournament Detail**:
   ```typescript
   <Tab.Navigator>
     <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
     <Tab.Screen name="Groups" component={GroupListScreen} />
     <Tab.Screen name="Analytics" component={TournamentAnalytics} />
   </Tab.Navigator>
   ```

**Benefits**:
- Deeper insights
- Performance tracking
- Competitive intelligence
- Enhanced engagement

**Effort**: Medium (1 week)
**Priority**: Medium

---

### IMP-TOURN-004: Tournament Registration Enhancements

**Current State**: Simple registration with tee box selection

**Enhancement**:
- Team registration (for team formats)
- Partner selection
- Payment integration (Stripe)
- Waitlist management
- Registration deadline reminders
- Group preference (friends grouping)

**Implementation**:

1. **Update Registration Flow**:
   ```typescript
   // src/screens/tournaments/TournamentRegistrationScreen.tsx
   export const TournamentRegistrationScreen = ({ tournament }: Props) => {
     const [step, setStep] = useState(1);

     return (
       <View className="flex-1">
         {step === 1 && <TeeBoxSelection onNext={setStep} />}
         {step === 2 && tournament.isTeamFormat && (
           <TeamMemberSelection onNext={setStep} />
         )}
         {step === 3 && <GroupPreferences onNext={setStep} />}
         {step === 4 && tournament.entry_fee > 0 && (
           <PaymentScreen onNext={setStep} />
         )}
         {step === 5 && <RegistrationConfirmation />}
       </View>
     );
   };
   ```

2. **Payment Integration**:
   ```bash
   npm install @stripe/stripe-react-native
   ```

   ```typescript
   // src/services/payments.ts
   import { useStripe } from '@stripe/stripe-react-native';

   export const processPayment = async (amount: number) => {
     const { confirmPayment } = useStripe();

     const { clientSecret } = await supabase.functions.invoke('create-payment-intent', {
       body: { amount, currency: 'usd' }
     });

     const { error } = await confirmPayment(clientSecret, {
       type: 'Card'
     });

     if (error) throw error;
   };
   ```

**Benefits**:
- Streamlined registration
- Payment collection
- Better grouping
- Waitlist management

**Effort**: Large (2 weeks)
**Priority**: Medium

---

## Personal Round Tracking

### IMP-ROUNDS-001: Advanced Statistics Dashboard

**Current State**: Basic stats (GIR, putts, fairways)

**Enhancement**:
Comprehensive stats dashboard with:
- Scoring average by hole
- Best/worst holes
- Scoring trends over time
- Handicap progression chart
- Shot distribution analysis
- Course difficulty rating
- Personal records

**Implementation**:

1. **Create Stats Service**:
   ```typescript
   // src/services/stats.ts
   export const statsService = {
     async fetchPlayerStats(golferId: string, timeRange: 'month' | 'quarter' | 'year' | 'all') {
       const { data, error } = await supabase.rpc('calculate_player_stats', {
         p_golfer_id: golferId,
         p_time_range: timeRange
       });

       if (error) throw error;
       return data;
     },

     async fetchHandicapProgression(golferId: string) {
       const { data, error } = await supabase
         .from('golf_rounds')
         .select('date, handicap_differential')
         .eq('golfer_id', golferId)
         .order('date', { ascending: true })
         .limit(20);

       if (error) throw error;
       return data;
     }
   };
   ```

2. **Create Stats Dashboard Screen**:
   ```typescript
   // src/screens/rounds/StatsScreen.tsx
   export const StatsScreen = () => {
     const { user } = useAuth();
     const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');

     const { data: stats } = useQuery(
       ['stats', user.id, timeRange],
       () => statsService.fetchPlayerStats(user.id, timeRange)
     );

     return (
       <ScrollView className="flex-1 bg-white dark:bg-charcoal">
         <TimeRangeSelector value={timeRange} onChange={setTimeRange} />

         <Section title={t('stats.scoringAverage')}>
           <StatCard
             label={t('stats.overall')}
             value={stats.avgScore}
             trend={stats.scoreTrend}
           />
           <LineChart
             data={stats.scoreHistory}
             height={200}
             showTrend
           />
         </Section>

         <Section title={t('stats.handicapProgression')}>
           <LineChart
             data={stats.handicapHistory}
             height={200}
             yLabel={t('stats.handicap')}
           />
         </Section>

         <Section title={t('stats.strengths')}>
           <RadarChart
             categories={['Driving', 'Approach', 'Short Game', 'Putting']}
             values={[
               stats.drivingScore,
               stats.approachScore,
               stats.shortGameScore,
               stats.puttingScore
             ]}
           />
         </Section>

         <Section title={t('stats.bestWorstHoles')}>
           <HoleComparisonTable
             bestHoles={stats.bestHoles}
             worstHoles={stats.worstHoles}
           />
         </Section>
       </ScrollView>
     );
   };
   ```

3. **Add Charts Library**:
   ```bash
   npm install react-native-chart-kit
   ```

**Benefits**:
- Actionable insights
- Track improvement
- Identify weaknesses
- Goal setting support

**Effort**: Large (2 weeks)
**Priority**: High

---

### IMP-ROUNDS-002: Shot Tracking & Course Mapping

**Current State**: Hole-level scoring only

**Enhancement**:
Individual shot tracking with GPS:
- Shot distance measurement
- Club selection per shot
- Miss direction (left/right)
- Lie type (fairway, rough, bunker)
- Visual course map with shot paths

**Implementation**:

1. **Update Schema**:
   ```sql
   CREATE TABLE golf_shots (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     golf_round_hole_id UUID REFERENCES golf_round_holes NOT NULL,
     shot_number INTEGER NOT NULL,
     club TEXT,
     distance_yards INTEGER,
     start_lat NUMERIC,
     start_lng NUMERIC,
     end_lat NUMERIC,
     end_lng NUMERIC,
     lie_type TEXT CHECK (lie_type IN ('tee', 'fairway', 'rough', 'bunker', 'green')),
     miss_direction TEXT CHECK (miss_direction IN ('straight', 'left', 'right')),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Shot Tracker Component**:
   ```bash
   npx expo install expo-location
   ```

   ```typescript
   // src/components/ShotTracker.tsx
   import * as Location from 'expo-location';

   export const ShotTracker: React.FC<{ holeId: string }> = ({ holeId }) => {
     const [shotStart, setShotStart] = useState<Location.LocationObject | null>(null);

     const recordShotStart = async () => {
       const location = await Location.getCurrentPositionAsync({});
       setShotStart(location);
     };

     const recordShotEnd = async (club: string) => {
       const endLocation = await Location.getCurrentPositionAsync({});

       const distance = calculateDistance(
         shotStart.coords.latitude,
         shotStart.coords.longitude,
         endLocation.coords.latitude,
         endLocation.coords.longitude
       );

       await shotsService.recordShot({
         holeId,
         club,
         distance,
         startLat: shotStart.coords.latitude,
         startLng: shotStart.coords.longitude,
         endLat: endLocation.coords.latitude,
         endLng: endLocation.coords.longitude
       });
     };

     return (
       <View>
         <Button onPress={recordShotStart}>
           {t('shotTracking.markStart')}
         </Button>
         <ClubSelector onSelect={recordShotEnd} />
       </View>
     );
   };
   ```

3. **Course Map Visualization**:
   ```bash
   npm install react-native-maps
   ```

   ```typescript
   // src/components/CourseMap.tsx
   import MapView, { Polyline, Marker } from 'react-native-maps';

   export const CourseMap: React.FC<{ shots: Shot[] }> = ({ shots }) => (
     <MapView
       initialRegion={{
         latitude: shots[0].start_lat,
         longitude: shots[0].start_lng,
         latitudeDelta: 0.01,
         longitudeDelta: 0.01
       }}
     >
       {shots.map((shot, index) => (
         <React.Fragment key={shot.id}>
           <Marker
             coordinate={{
               latitude: shot.start_lat,
               longitude: shot.start_lng
             }}
             title={`Shot ${index + 1}`}
             description={`${shot.club} - ${shot.distance_yards}y`}
           />
           <Polyline
             coordinates={[
               { latitude: shot.start_lat, longitude: shot.start_lng },
               { latitude: shot.end_lat, longitude: shot.end_lng }
             ]}
             strokeColor="#2d7a4e"
             strokeWidth={3}
           />
         </React.Fragment>
       ))}
     </MapView>
   );
   ```

**Benefits**:
- Detailed shot analysis
- Club selection insights
- Visual round playback
- Advanced analytics

**Effort**: Very Large (3-4 weeks)
**Priority**: Low (Advanced feature)

---

### IMP-ROUNDS-003: Round Goals & Challenges

**Current State**: Simple score tracking

**Enhancement**:
Pre-round goal setting and challenges:
- Score target
- GIR goal (e.g., "Hit 10+ greens")
- Fairway accuracy goal
- Putting goal (e.g., "No 3-putts")
- Progress tracking during round
- Achievement unlocking

**Implementation**:

1. **Database Schema**:
   ```sql
   CREATE TABLE round_goals (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     golf_round_id UUID REFERENCES golf_rounds NOT NULL,
     goal_type TEXT CHECK (goal_type IN ('score', 'gir', 'fairways', 'putts', 'no_big_numbers')),
     target_value NUMERIC,
     achieved BOOLEAN DEFAULT false,
     created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE achievements (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     golfer_id UUID REFERENCES golfer_profiles NOT NULL,
     achievement_type TEXT,
     title TEXT,
     description TEXT,
     icon_url TEXT,
     earned_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Goal Setting Screen**:
   ```typescript
   // src/screens/rounds/RoundGoalsScreen.tsx
   export const RoundGoalsScreen = ({ roundId }: Props) => {
     const [goals, setGoals] = useState<RoundGoal[]>([]);

     const addGoal = (type: GoalType, target: number) => {
       setGoals([...goals, { type, target }]);
     };

     return (
       <View className="p-4">
         <Text className="text-xl font-bold mb-4">
           {t('goals.setYourGoals')}
         </Text>

         <GoalPicker
           type="score"
           label={t('goals.targetScore')}
           onSelect={(val) => addGoal('score', val)}
         />

         <GoalPicker
           type="gir"
           label={t('goals.greensInRegulation')}
           onSelect={(val) => addGoal('gir', val)}
         />

         <GoalToggle
           type="no_big_numbers"
           label={t('goals.noDoubleBogeys')}
           onToggle={(enabled) => enabled && addGoal('no_big_numbers', 0)}
         />

         <Button onPress={() => saveGoals(roundId, goals)}>
           {t('common.save')}
         </Button>
       </View>
     );
   };
   ```

3. **Goal Progress Component**:
   ```typescript
   // src/components/GoalProgress.tsx
   export const GoalProgress: React.FC<{ roundId: string }> = ({ roundId }) => {
     const { data: goals } = useQuery(
       ['roundGoals', roundId],
       () => goalsService.fetchGoals(roundId)
     );

     const { data: currentProgress } = useQuery(
       ['roundProgress', roundId],
       () => roundsService.fetchRoundProgress(roundId)
     );

     return (
       <View className="p-4 bg-white dark:bg-gray-800 rounded-lg">
         <Text className="text-lg font-semibold mb-2">
           {t('goals.progress')}
         </Text>
         {goals?.map((goal) => (
           <ProgressBar
             key={goal.id}
             label={goal.title}
             current={currentProgress[goal.type]}
             target={goal.target}
             achieved={currentProgress[goal.type] >= goal.target}
           />
         ))}
       </View>
     );
   };
   ```

**Benefits**:
- Motivation boost
- Focused improvement
- Gamification
- Better engagement

**Effort**: Medium (1 week)
**Priority**: Medium

---

## Course Discovery & Tee Times

### IMP-COURSES-001: Advanced Course Filters

**Current State**: Basic search by name, city, state

**Enhancement**:
Rich filtering options:
- Distance from current location
- Price range
- Course difficulty (slope rating)
- Amenities (cart required, range, pro shop, restaurant)
- Course type (public, private, semi-private, resort)
- Rating/reviews
- Availability on specific dates

**Implementation**:

1. **Update Schema**:
   ```sql
   ALTER TABLE courses ADD COLUMN latitude NUMERIC;
   ALTER TABLE courses ADD COLUMN longitude NUMERIC;
   ALTER TABLE courses ADD COLUMN price_range TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$'));
   ALTER TABLE courses ADD COLUMN course_type TEXT CHECK (course_type IN ('public', 'private', 'semi_private', 'resort'));
   ALTER TABLE courses ADD COLUMN amenities JSONB DEFAULT '{
     "driving_range": false,
     "putting_green": false,
     "pro_shop": false,
     "restaurant": false,
     "cart_required": false,
     "caddies_available": false
   }'::jsonb;
   ALTER TABLE courses ADD COLUMN avg_rating NUMERIC DEFAULT 0;
   ALTER TABLE courses ADD COLUMN review_count INTEGER DEFAULT 0;

   CREATE INDEX idx_courses_location ON courses USING gist (
     ll_to_earth(latitude, longitude)
   );
   ```

2. **Enhanced Filter Component**:
   ```typescript
   // src/components/CourseFilters.tsx
   export const CourseFilters: React.FC<{ onApply: (filters) => void }> = ({ onApply }) => {
     const [filters, setFilters] = useState({
       distance: 50, // miles
       priceRange: ['$', '$$', '$$$'],
       courseType: 'all',
       minRating: 0,
       amenities: []
     });

     return (
       <ScrollView className="p-4">
         <FilterSection title={t('filters.distance')}>
           <Slider
             value={filters.distance}
             minimumValue={0}
             maximumValue={100}
             step={5}
             onValueChange={(val) => setFilters({ ...filters, distance: val })}
           />
           <Text>{filters.distance} miles</Text>
         </FilterSection>

         <FilterSection title={t('filters.priceRange')}>
           <MultiSelect
             options={['$', '$$', '$$$', '$$$$']}
             selected={filters.priceRange}
             onChange={(val) => setFilters({ ...filters, priceRange: val })}
           />
         </FilterSection>

         <FilterSection title={t('filters.amenities')}>
           <Checkbox
             label={t('amenities.drivingRange')}
             checked={filters.amenities.includes('driving_range')}
             onChange={(checked) => toggleAmenity('driving_range', checked)}
           />
           {/* More amenity checkboxes */}
         </FilterSection>

         <Button onPress={() => onApply(filters)}>
           {t('filters.apply')}
         </Button>
       </ScrollView>
     );
   };
   ```

3. **Location-Based Search**:
   ```typescript
   // src/services/courses.ts
   async fetchNearby(latitude: number, longitude: number, radiusMiles: number) {
     const { data, error } = await supabase.rpc('courses_nearby', {
       lat: latitude,
       lng: longitude,
       radius_miles: radiusMiles
     });

     if (error) throw error;
     return data;
   }
   ```

   ```sql
   -- Supabase function
   CREATE OR REPLACE FUNCTION courses_nearby(
     lat NUMERIC,
     lng NUMERIC,
     radius_miles NUMERIC
   )
   RETURNS SETOF courses AS $$
   BEGIN
     RETURN QUERY
     SELECT *
     FROM courses
     WHERE earth_distance(
       ll_to_earth(latitude, longitude),
       ll_to_earth(lat, lng)
     ) <= (radius_miles * 1609.34) -- Convert miles to meters
     AND is_active = true
     ORDER BY earth_distance(
       ll_to_earth(latitude, longitude),
       ll_to_earth(lat, lng)
     );
   END;
   $$ LANGUAGE plpgsql;
   ```

**Benefits**:
- Better course discovery
- Personalized results
- Location-based recommendations
- Filter by preferences

**Effort**: Medium (1 week)
**Priority**: High

---

### IMP-COURSES-002: Course Reviews & Ratings

**Current State**: No user-generated content

**Enhancement**:
User reviews and ratings system:
- 5-star rating
- Written reviews
- Photo uploads
- Review helpful votes
- Course owner responses
- Review moderation

**Implementation**:

1. **Database Schema**:
   ```sql
   CREATE TABLE course_reviews (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     course_id UUID REFERENCES courses NOT NULL,
     golfer_id UUID REFERENCES golfer_profiles NOT NULL,
     rating INTEGER CHECK (rating BETWEEN 1 AND 5),
     title TEXT,
     review_text TEXT,
     photos TEXT[],
     helpful_count INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(course_id, golfer_id) -- One review per golfer per course
   );

   CREATE TABLE review_helpful_votes (
     review_id UUID REFERENCES course_reviews NOT NULL,
     golfer_id UUID REFERENCES golfer_profiles NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     PRIMARY KEY (review_id, golfer_id)
   );

   -- Trigger to update course avg_rating and review_count
   CREATE OR REPLACE FUNCTION update_course_rating()
   RETURNS TRIGGER AS $$
   BEGIN
     UPDATE courses
     SET
       avg_rating = (SELECT AVG(rating) FROM course_reviews WHERE course_id = NEW.course_id),
       review_count = (SELECT COUNT(*) FROM course_reviews WHERE course_id = NEW.course_id)
     WHERE id = NEW.course_id;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER course_review_rating_update
   AFTER INSERT OR UPDATE ON course_reviews
   FOR EACH ROW EXECUTE FUNCTION update_course_rating();
   ```

2. **Review Form Screen**:
   ```typescript
   // src/screens/WriteReviewScreen.tsx
   export const WriteReviewScreen = ({ courseId }: Props) => {
     const [rating, setRating] = useState(5);
     const [title, setTitle] = useState('');
     const [review, setReview] = useState('');
     const [photos, setPhotos] = useState<string[]>([]);

     const submitReview = async () => {
       await reviewsService.createReview({
         courseId,
         rating,
         title,
         reviewText: review,
         photos
       });

       Alert.alert(t('success.title'), t('success.reviewSubmitted'));
       navigation.goBack();
     };

     return (
       <ScrollView className="p-4">
         <StarRating value={rating} onChange={setRating} size={40} />

         <TextInput
           placeholder={t('reviews.titlePlaceholder')}
           value={title}
           onChangeText={setTitle}
           className="border rounded-lg p-3 mt-4"
         />

         <TextInput
           placeholder={t('reviews.reviewPlaceholder')}
           value={review}
           onChangeText={setReview}
           multiline
           numberOfLines={6}
           className="border rounded-lg p-3 mt-4"
         />

         <PhotoPicker photos={photos} onChange={setPhotos} max={5} />

         <Button onPress={submitReview} className="mt-6">
           {t('reviews.submit')}
         </Button>
       </ScrollView>
     );
   };
   ```

3. **Reviews List Component**:
   ```typescript
   // src/components/ReviewsList.tsx
   export const ReviewsList: React.FC<{ courseId: string }> = ({ courseId }) => {
     const { data: reviews } = useQuery(
       ['reviews', courseId],
       () => reviewsService.fetchReviews(courseId)
     );

     return (
       <FlatList
         data={reviews}
         renderItem={({ item }) => (
           <ReviewCard
             review={item}
             onHelpful={() => reviewsService.markHelpful(item.id)}
           />
         )}
       />
     );
   };
   ```

**Benefits**:
- Social proof
- Course selection guidance
- Community engagement
- Course improvement feedback

**Effort**: Large (2 weeks)
**Priority**: Medium

---

### IMP-COURSES-003: Favorite Courses & Wishlists

**Current State**: No course bookmarking

**Enhancement**:
- Favorite courses (quick access)
- Wishlist (want to play)
- Played courses (history)
- Custom lists (e.g., "Best Views", "Challenging Courses")

**Implementation**:

1. **Database Schema**:
   ```sql
   CREATE TABLE course_lists (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     golfer_id UUID REFERENCES golfer_profiles NOT NULL,
     name TEXT NOT NULL,
     description TEXT,
     is_system BOOLEAN DEFAULT false, -- For favorites, wishlist, played
     created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE course_list_items (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     list_id UUID REFERENCES course_lists NOT NULL,
     course_id UUID REFERENCES courses NOT NULL,
     notes TEXT,
     added_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(list_id, course_id)
   );

   -- Create system lists on user registration
   -- Favorites, Wishlist, Played
   ```

2. **List Management**:
   ```typescript
   // src/services/courseLists.ts
   export const courseListsService = {
     async addToList(listId: string, courseId: string, notes?: string) {
       const { error } = await supabase
         .from('course_list_items')
         .insert([{ list_id: listId, course_id: courseId, notes }]);

       if (error) throw error;
     },

     async removeFromList(listId: string, courseId: string) {
       const { error } = await supabase
         .from('course_list_items')
         .delete()
         .eq('list_id', listId)
         .eq('course_id', courseId);

       if (error) throw error;
     },

     async fetchLists(golferId: string) {
       const { data, error } = await supabase
         .from('course_lists')
         .select(`
           *,
           items:course_list_items(count)
         `)
         .eq('golfer_id', golferId);

       if (error) throw error;
       return data;
     }
   };
   ```

3. **Quick Add Component**:
   ```typescript
   // src/components/AddToListButton.tsx
   export const AddToListButton: React.FC<{ courseId: string }> = ({ courseId }) => {
     const [showLists, setShowLists] = useState(false);
     const { data: lists } = useQuery(['courseLists'], courseListsService.fetchLists);

     return (
       <>
         <IconButton icon={<Bookmark />} onPress={() => setShowLists(true)} />

         <Modal visible={showLists} onClose={() => setShowLists(false)}>
           <Text className="text-xl font-bold mb-4">
             {t('lists.addToCourse')}
           </Text>
           {lists?.map((list) => (
             <TouchableOpacity
               key={list.id}
               onPress={() => {
                 courseListsService.addToList(list.id, courseId);
                 setShowLists(false);
               }}
               className="p-3 border-b"
             >
               <Text>{list.name}</Text>
             </TouchableOpacity>
           ))}
         </Modal>
       </>
     );
   };
   ```

**Benefits**:
- Personalized course organization
- Quick access to favorites
- Trip planning support
- Played course tracking

**Effort**: Medium (4-5 days)
**Priority**: Medium

---

## Offline & Sync

### IMP-SYNC-001: Improved Sync Queue Management

**Current State**: Basic queue with AppState listener

**Enhancement** (See CURRENT_ISSUES.md ISSUE-004):
- Retry mechanism with exponential backoff
- Sync priority levels
- Conflict resolution
- Background sync
- Sync status indicator
- Manual sync trigger

**Implementation**: See CURRENT_ISSUES.md for detailed solution.

**Effort**: Medium (1 week)
**Priority**: High

---

### IMP-SYNC-002: Offline Course Data Caching

**Current State**: No offline course data

**Enhancement**:
- Download course data for offline use
- Pre-cache favorite courses
- Offline scorecards
- Sync when back online

**Implementation**:

1. **Course Download Service**:
   ```typescript
   // src/services/offlineCourses.ts
   export const offlineCoursesService = {
     async downloadCourse(courseId: string) {
       const course = await coursesService.fetchCourseById(courseId);
       const teeBoxes = await coursesService.fetchTeeBoxes(courseId);
       const holes = await coursesService.fetchHoles(courseId);

       const cacheData = {
         course,
         teeBoxes,
         holes,
         cachedAt: Date.now()
       };

       await AsyncStorage.setItem(
         `offline_course_${courseId}`,
         JSON.stringify(cacheData)
       );
     },

     async getCachedCourse(courseId: string) {
       const cached = await AsyncStorage.getItem(`offline_course_${courseId}`);
       if (!cached) return null;

       const data = JSON.parse(cached);

       // Check if cache is stale (older than 7 days)
       const isStale = Date.now() - data.cachedAt > 7 * 24 * 60 * 60 * 1000;
       if (isStale) return null;

       return data;
     }
   };
   ```

2. **Offline Indicator**:
   ```typescript
   // In CourseDetailScreen
   const { isConnected } = useNetworkStatus();
   const cachedCourse = await offlineCoursesService.getCachedCourse(courseId);

   {!isConnected && cachedCourse && (
     <Badge variant="info">
       {t('offline.cachedData')}
     </Badge>
   )}
   ```

**Benefits**:
- Play without connectivity
- Faster data access
- Remote course support

**Effort**: Medium (5-7 days)
**Priority**: Medium

---

## Performance Optimization

### IMP-PERF-001: Image Optimization & CDN

**Current State**: Full-resolution images loaded

**Enhancement**:
- Resize images on upload
- Generate thumbnails
- Use CDN for fast delivery
- Progressive image loading
- WebP format support

**Implementation**:

1. **Supabase Storage Transformations**:
   ```typescript
   // When uploading images
   const { data, error } = await supabase.storage
     .from('course-images')
     .upload(filePath, file, {
       cacheControl: '3600',
       upsert: false
     });

   // When displaying images
   const imageUrl = supabase.storage
     .from('course-images')
     .getPublicUrl(filePath, {
       transform: {
         width: 800,
         height: 600,
         resize: 'cover',
         quality: 80
       }
     });
   ```

2. **Progressive Image Component**:
   ```bash
   npx expo install expo-image
   ```

   ```typescript
   import { Image } from 'expo-image';

   <Image
     source={{ uri: imageUrl }}
     placeholder={blurhash}
     contentFit="cover"
     transition={200}
     recyclingKey={imageUrl}
     style={{ width: '100%', height: 200 }}
   />
   ```

**Benefits**:
- Faster load times
- Reduced bandwidth
- Better user experience
- Lower costs

**Effort**: Small (2-3 days)
**Priority**: High

---

### IMP-PERF-002: Query Optimization & Indexing

**Current State**: Basic database queries

**Enhancement**:
- Add database indexes
- Optimize slow queries
- Use materialized views
- Query result caching

**Implementation**:

1. **Add Indexes**:
   ```sql
   -- Frequently filtered columns
   CREATE INDEX idx_tournaments_status ON tournaments(status);
   CREATE INDEX idx_tournaments_date ON tournaments(start_date, end_date);
   CREATE INDEX idx_golf_rounds_golfer_date ON golf_rounds(golfer_id, date DESC);
   CREATE INDEX idx_tournament_scores_round ON tournament_scores(tournament_round_id);

   -- Composite indexes for common queries
   CREATE INDEX idx_courses_active_city ON courses(is_active, city) WHERE is_active = true;
   CREATE INDEX idx_tee_time_slots_course_date ON tee_time_slots(course_id, date) WHERE is_active = true;
   ```

2. **Materialized Views for Leaderboards**:
   ```sql
   CREATE MATERIALIZED VIEW tournament_leaderboard_current AS
   SELECT
     t.id AS tournament_id,
     g.id AS golfer_id,
     g.first_name,
     g.last_name,
     SUM(s.strokes) AS total_strokes,
     DENSE_RANK() OVER (PARTITION BY t.id ORDER BY SUM(s.strokes)) AS rank
   FROM tournaments t
   JOIN tournament_rounds tr ON tr.tournament_id = t.id
   JOIN golfer_profiles g ON g.id = tr.golfer_id
   JOIN tournament_scores s ON s.tournament_round_id = tr.id
   WHERE t.status = 'active'
   GROUP BY t.id, g.id, g.first_name, g.last_name;

   CREATE UNIQUE INDEX ON tournament_leaderboard_current(tournament_id, golfer_id);

   -- Refresh periodically (every 30 seconds during active tournaments)
   REFRESH MATERIALIZED VIEW CONCURRENTLY tournament_leaderboard_current;
   ```

**Benefits**:
- Faster queries
- Better app responsiveness
- Reduced database load
- Lower costs

**Effort**: Small (2-3 days)
**Priority**: High

---

## UI/UX Enhancement

### IMP-UX-001: Onboarding Flow

**Current State**: No onboarding for new users

**Enhancement**:
Multi-step onboarding:
1. Welcome screen
2. Feature highlights (tournaments, rounds, tee times)
3. Permission requests (location, notifications)
4. Profile setup (handicap, home course)
5. Course preferences

**Implementation**:

1. **Onboarding Screens**:
   ```bash
   npm install react-native-onboarding-swiper
   ```

   ```typescript
   // src/screens/OnboardingScreen.tsx
   import Onboarding from 'react-native-onboarding-swiper';

   export const OnboardingScreen = () => {
     const { completeOnboarding } = useAuth();

     return (
       <Onboarding
         pages={[
           {
             backgroundColor: '#2d7a4e',
             image: <Image source={require('@/assets/welcome.png')} />,
             title: t('onboarding.welcome.title'),
             subtitle: t('onboarding.welcome.subtitle')
           },
           {
             backgroundColor: '#1d4d34',
             image: <Trophy size={100} color="#fff" />,
             title: t('onboarding.tournaments.title'),
             subtitle: t('onboarding.tournaments.subtitle')
           },
           {
             backgroundColor: '#3e9d64',
             image: <Target size={100} color="#fff" />,
             title: t('onboarding.rounds.title'),
             subtitle: t('onboarding.rounds.subtitle')
           }
         ]}
         onDone={completeOnboarding}
         onSkip={completeOnboarding}
       />
     );
   };
   ```

2. **Track Onboarding State**:
   ```sql
   ALTER TABLE golfer_profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
   ALTER TABLE golfer_profiles ADD COLUMN onboarding_step TEXT;
   ```

**Benefits**:
- Better first impression
- Increased activation
- Permission acceptance
- Feature discovery

**Effort**: Small (3-4 days)
**Priority**: Medium

---

### IMP-UX-002: Dark Mode Refinement

**Current State**: Basic dark mode support

**Enhancement**:
- Refined dark theme colors
- Smooth transitions
- Per-screen theme override
- OLED black mode option

**Implementation**:

1. **Enhanced Theme System**:
   ```typescript
   // src/contexts/ThemeContext.tsx
   export type ThemeMode = 'light' | 'dark' | 'oled';

   const themes = {
     light: {
       background: '#ffffff',
       surface: '#f9fafb',
       text: '#111827',
       textSecondary: '#6b7280',
       primary: '#2d7a4e',
       border: '#e5e7eb'
     },
     dark: {
       background: '#1a1d21',
       surface: '#2d3139',
       text: '#f9fafb',
       textSecondary: '#9ca3af',
       primary: '#3e9d64',
       border: '#374151'
     },
     oled: {
       background: '#000000',
       surface: '#0a0a0a',
       text: '#ffffff',
       textSecondary: '#a0a0a0',
       primary: '#3e9d64',
       border: '#1a1a1a'
     }
   };
   ```

**Benefits**:
- Better dark mode experience
- Battery savings (OLED)
- User preference

**Effort**: Small (2-3 days)
**Priority**: Low

---

## Analytics & Insights

### IMP-ANALYTICS-001: Player Comparison Tool

**Current State**: Individual stats only

**Enhancement**:
Compare stats with:
- Friends
- Same handicap golfers
- Club averages
- Pro benchmarks

**Implementation**:

1. **Comparison Screen**:
   ```typescript
   // src/screens/ComparisonScreen.tsx
   export const ComparisonScreen = () => {
     const { user } = useAuth();
     const [compareWith, setCompareWith] = useState<'friends' | 'handicap' | 'club'>('friends');

     const { data: myStats } = useQuery(['stats', user.id], () =>
       statsService.fetchPlayerStats(user.id, 'year')
     );

     const { data: comparisonStats } = useQuery(
       ['comparisonStats', compareWith],
       () => statsService.fetchComparisonStats(user.id, compareWith)
     );

     return (
       <ScrollView>
         <ComparisonSelector value={compareWith} onChange={setCompareWith} />

         <StatComparison
           label={t('stats.avgScore')}
           myValue={myStats.avgScore}
           theirValue={comparisonStats.avgScore}
         />

         <StatComparison
           label={t('stats.gir')}
           myValue={`${myStats.gir}%`}
           theirValue={`${comparisonStats.gir}%`}
         />

         {/* More comparisons */}
       </ScrollView>
     );
   };
   ```

**Benefits**:
- Competitive insights
- Motivation
- Identify improvement areas

**Effort**: Medium (4-5 days)
**Priority**: Low

---

## Social Features

### IMP-SOCIAL-001: Activity Feed

**Current State**: No social feed

**Enhancement**:
Activity feed showing:
- Friend rounds completed
- Tournament results
- Personal bests
- Course reviews
- Achievements earned

**Implementation**:

1. **Activity Feed Schema**:
   ```sql
   CREATE TABLE activity_feed (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     golfer_id UUID REFERENCES golfer_profiles NOT NULL,
     activity_type TEXT CHECK (activity_type IN (
       'round_completed',
       'tournament_result',
       'personal_best',
       'course_review',
       'achievement_earned'
     )),
     metadata JSONB,
     created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE INDEX idx_activity_feed_golfer_date ON activity_feed(golfer_id, created_at DESC);
   ```

2. **Feed Screen**:
   ```typescript
   // src/screens/ActivityFeedScreen.tsx
   export const ActivityFeedScreen = () => {
     const { data: activities } = useQuery(
       ['activityFeed'],
       () => socialService.fetchActivityFeed()
     );

     return (
       <FlatList
         data={activities}
         renderItem={({ item }) => <ActivityCard activity={item} />}
         onEndReached={loadMore}
       />
     );
   };
   ```

**Benefits**:
- Social engagement
- Friend activity awareness
- Community building

**Effort**: Large (1-2 weeks)
**Priority**: Low

---

## Summary & Prioritization

### High Priority (Next 1-2 Months)
1. ✅ IMP-AUTH-001: Social Login Integration
2. ✅ IMP-TOURN-001: Advanced Tournament Formats
3. ✅ IMP-TOURN-002: Live Updates & Push Notifications
4. ✅ IMP-ROUNDS-001: Advanced Statistics Dashboard
5. ✅ IMP-COURSES-001: Advanced Course Filters
6. ✅ IMP-SYNC-001: Improved Sync Queue
7. ✅ IMP-PERF-001: Image Optimization
8. ✅ IMP-PERF-002: Query Optimization

### Medium Priority (3-6 Months)
9. IMP-AUTH-002: Enhanced Profile Management
10. IMP-TOURN-003: Tournament Analytics
11. IMP-TOURN-004: Registration Enhancements
12. IMP-ROUNDS-003: Round Goals & Challenges
13. IMP-COURSES-002: Course Reviews & Ratings
14. IMP-COURSES-003: Favorite Courses
15. IMP-SYNC-002: Offline Course Caching
16. IMP-UX-001: Onboarding Flow

### Low Priority (6+ Months / Future)
17. IMP-AUTH-003: Two-Factor Authentication
18. IMP-ROUNDS-002: Shot Tracking & GPS
19. IMP-UX-002: Dark Mode Refinement
20. IMP-ANALYTICS-001: Player Comparison
21. IMP-SOCIAL-001: Activity Feed

---

**End of Improvement Plan** | Last Updated: 2025-12-05
