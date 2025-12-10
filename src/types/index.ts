import { Tables, Database as SupabaseDatabase } from './supabase';
import { NavigatorScreenParams } from '@react-navigation/native';

// Database types
export type Database = SupabaseDatabase;
export type Course = Tables<'courses'>;
export type TeeTimeSlot = Tables<'tee_time_slots'>;
export type TeeTimeReservation = Tables<'tee_time_reservations'>;
export type GolferProfile = Tables<'golfer_profiles'>;
export type Notification = Tables<'notifications'>;
export type CourseEvent = Tables<'course_events'>;
export type CourseGallery = Tables<'course_gallery'>;
export type TeeBox = Tables<'tee_boxes'>;
export type Tournament = Tables<'tournaments'>;
export type TournamentGroup = Tables<'tournament_groups'>;
export type TournamentRound = Tables<'tournament_rounds'>;
export type TournamentLeaderboard = Tables<'tournament_leaderboard_dense_rank'>;
export type GolfRound = Tables<'golf_rounds'>;
export type GolfRoundHole = Tables<'golf_round_holes'>;

// Custom types for UI
export interface TeeTimeSlotWithAvailability extends TeeTimeSlot {
  available_players?: number;
  reservation_count?: number;
}

export interface ReservationWithDetails extends TeeTimeReservation {
  slot?: TeeTimeSlot;
  course?: Course;
}

export interface CourseWithDetails extends Course {
  gallery?: CourseGallery[];
  events?: CourseEvent[];
  tee_boxes?: TeeBox[];
}

// Location types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CourseWithDistance extends Course {
  distance_miles: number;
}

export type LocationSearchMode = 'name' | 'nearMe' | 'nearCity';

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  profile?: GolferProfile;
}

// Navigation types
export type RootStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  ForgotPassword: undefined;
  UpdatePassword: { token?: string };
  App: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Courses: NavigatorScreenParams<CoursesStackParamList> | undefined;
  TeeTimes: undefined;
  Tournaments: NavigatorScreenParams<TournamentsStackParamList> | undefined;
  Rounds: NavigatorScreenParams<RoundsStackParamList> | undefined;
  RSSArticles: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
  Menu: undefined;
};

export type AppTab5ParamList = {
  Home: undefined;
  Courses: NavigatorScreenParams<CoursesStackParamList> | undefined;
  Tournaments: NavigatorScreenParams<TournamentsStackParamList> | undefined;
  RSSArticles: undefined;
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined;
};


export type CoursesStackParamList = {
  CoursesList: undefined;
  CourseDetail: { courseId: string };
  CourseTeeTimesScreen: { courseId: string; courseName: string };
  ReservationScreen: { slotId: string; courseId: string };
};

export type TournamentsStackParamList = {
  TournamentsList: undefined;
  TournamentDetail: { tournamentId: string };
  TournamentGroupList: { groupId: string; groupName: string };
  TournamentRegistration: { tournamentId: string };
  Scorecard: { roundId: string };
  Leaderboard: { tournamentId: string };
  GolferScorecardPreview: {
    roundId: string;
    golferInfo: {
      firstName: string;
      lastName: string;
      avatarUrl?: string;
      groupName: string;
    };
  };
};

export type RoundsStackParamList = {
  RoundsList: undefined;
  NewRound: { preselectedCourseId?: string };
  PersonalScorecard: { roundId: string; isEditing?: boolean };
  RoundDetail: { roundId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ProfileEdit: undefined;
  UpdatePassword: undefined;
  Support: undefined;
  TermsOfUse: undefined;
  Notifications: undefined;
};

// Form types
export interface SignInFormData {
  email: string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface UpdatePasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface ReservationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  holes: number;
  golfCartRequired: boolean;
  caddyRequired: boolean;
  clubsRequired: boolean;
  pushCartRequired: boolean;
  assistanceRequired: boolean;
  notes?: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  handicapIndex?: number;
}

// Service types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams {
  query?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeParams {
  startDate: string;
  endDate: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}