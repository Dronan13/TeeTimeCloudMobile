import { useState, useEffect, useCallback } from 'react';
import { coursesService } from '@/services/courses';
import { weatherService } from '@/services/weather';
import { reservationsService } from '@/services/reservations';
import { notificationsService } from '@/services/notifications';
import { tournamentsService } from '@/services/tournaments';
import { golfRoundsService } from '@/services/golfRounds';
import { CourseEvent, Database } from '@/types';

interface UseHomeCourseResult {
  homeCourseName: string | null;
  homeCourseLocation: { latitude: number; longitude: number } | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseWeatherResult {
  weather: any;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseUpcomingEventsResult {
  events: CourseEvent[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseNextTeeTimeResult {
  nextTeeTime: Database['public']['Views']['tee_time_reservations_with_slot']['Row'] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseUnreadCountResult {
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseActiveTournamentsResult {
  activeTournaments: any[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseRecentRoundsResult {
  recentRounds: any[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetches home course information
 */
export const useHomeCourse = (homeCourseId: string | null): UseHomeCourseResult => {
  const [homeCourseName, setHomeCourseName] = useState<string | null>(null);
  const [homeCourseLocation, setHomeCourseLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!homeCourseId) {
      setHomeCourseName(null);
      setHomeCourseLocation(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const courseRes = await coursesService.fetchCourseById(homeCourseId);
      if (courseRes.data?.name) {
        setHomeCourseName(courseRes.data.name);
      }

      const location = courseRes.data?.location as any;
      if (location?.latitude && location?.longitude) {
        setHomeCourseLocation({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch home course'));
    } finally {
      setLoading(false);
    }
  }, [homeCourseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { homeCourseName, homeCourseLocation, loading, error, refetch: fetchData };
};

/**
 * Fetches weather data for a location
 */
export const useWeather = (latitude: number | null, longitude: number | null): UseWeatherResult => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!latitude || !longitude) {
      setWeather(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const weatherRes = await weatherService.getCurrentWeather(latitude, longitude);
      if (weatherRes.data) {
        setWeather(weatherRes.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch weather'));
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { weather, loading, error, refetch: fetchData };
};

/**
 * Fetches upcoming events for a course
 */
export const useUpcomingEvents = (courseId: string | null): UseUpcomingEventsResult => {
  const [events, setEvents] = useState<CourseEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!courseId) {
      setEvents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const eventsRes = await coursesService.fetchCourseEvents(courseId);
      if (eventsRes.data) {
        setEvents(eventsRes.data.slice(0, 3));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch events'));
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { events, loading, error, refetch: fetchData };
};

/**
 * Fetches next tee time reservation
 */
export const useNextTeeTime = (userId: string | null): UseNextTeeTimeResult => {
  const [nextTeeTime, setNextTeeTime] = useState<Database['public']['Views']['tee_time_reservations_with_slot']['Row'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setNextTeeTime(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextRes = await reservationsService.fetchNextReservation(userId);
      if (nextRes.data) {
        setNextTeeTime(nextRes.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch next tee time'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { nextTeeTime, loading, error, refetch: fetchData };
};

/**
 * Fetches unread notification count
 */
export const useUnreadCount = (userId: string | null): UseUnreadCountResult => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unreadRes = await notificationsService.fetchUnreadCount(userId);
      if (unreadRes.data !== null) {
        setUnreadCount(unreadRes.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch unread count'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { unreadCount, loading, error, refetch: fetchData };
};

/**
 * Fetches active tournaments for user
 */
export const useActiveTournaments = (userId: string | null): UseActiveTournamentsResult => {
  const [activeTournaments, setActiveTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setActiveTournaments([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tournamentsRes = await tournamentsService.fetchUserActiveTournaments(userId);
      if (tournamentsRes.data) {
        setActiveTournaments(tournamentsRes.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tournaments'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { activeTournaments, loading, error, refetch: fetchData };
};

/**
 * Fetches recent golf rounds for user
 */
export const useRecentRounds = (userId: string | null, limit = 3): UseRecentRoundsResult => {
  const [recentRounds, setRecentRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setRecentRounds([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const roundsRes = await golfRoundsService.fetchRecentGolfRounds(userId, limit);
      if (roundsRes.data) {
        setRecentRounds(roundsRes.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch rounds'));
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { recentRounds, loading, error, refetch: fetchData };
};
