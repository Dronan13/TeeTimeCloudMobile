import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@/hooks/useAuth';
import { reservationsService } from '@/services/reservations';
import { notificationsService } from '@/services/notifications';
import { coursesService } from '@/services/courses';
import { weatherService } from '@/services/weather';
import { ReservationWithDetails, Notification, CourseEvent, AppTabParamList, CoursesStackParamList } from '@/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, 'Home'>,
  StackNavigationProp<CoursesStackParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextTeeTime, setNextTeeTime] = useState<ReservationWithDetails | null>(null);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<CourseEvent[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [homeCourseName, setHomeCourseName] = useState<string>('');

  useEffect(() => {
    loadHomeData();
  }, [user?.id]);

  const loadHomeData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch home course name if available
      if (profile?.home_course_id) {
        const courseRes = await coursesService.fetchCourseById(profile.home_course_id);
        if (courseRes.data?.name) {
          setHomeCourseName(courseRes.data.name);
        }
      }

      // Fetch next tee time
      const nextRes = await reservationsService.fetchNextReservation(user.id);
      if (nextRes.data) {
        setNextTeeTime(nextRes.data);

        // Fetch weather for the course location if available
        const courseLocation = nextRes.data.course?.location as any;
        if (courseLocation?.lat && courseLocation?.lng) {
          const weatherRes = await weatherService.getCurrentWeather(
            courseLocation.lat,
            courseLocation.lng
          );
          if (weatherRes.data) {
            setWeather(weatherRes.data);
          }
        }

        // Fetch upcoming events for the home course
        if (nextRes.data.course?.id) {
          const eventsRes = await coursesService.fetchCourseEvents(nextRes.data.course.id);
          if (eventsRes.data) {
            setUpcomingEvents(eventsRes.data.slice(0, 3));
          }
        }
      } else if (profile?.home_course_id) {
        // If no tee time, try to get weather for home course
        const courseRes = await coursesService.fetchCourseById(profile.home_course_id);
        const homeCourseLocation = courseRes.data?.location as any;
        if (homeCourseLocation?.lat && homeCourseLocation?.lng) {
          const weatherRes = await weatherService.getCurrentWeather(
            homeCourseLocation.lat,
            homeCourseLocation.lng
          );
          if (weatherRes.data) {
            setWeather(weatherRes.data);
          }
        }

        // Fetch events for home course
        const eventsRes = await coursesService.fetchCourseEvents(profile.home_course_id);
        if (eventsRes.data) {
          setUpcomingEvents(eventsRes.data.slice(0, 3));
        }
      }

      // Fetch recent notifications
      const notificationsRes = await notificationsService.fetchNotifications(user.id);
      if (notificationsRes.data) {
        setRecentNotifications(notificationsRes.data.slice(0, 3));
      }

      // Fetch unread count
      const unreadRes = await notificationsService.fetchUnreadCount(user.id);
      if (unreadRes.data !== null) {
        setUnreadCount(unreadRes.data);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  if (loading) {
    return (
      <View style={homeStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <ScrollView
      style={homeStyles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Profile Snapshot */}
      <View style={homeStyles.profileSection}>
        <View style={homeStyles.profileInfo}>
          <View style={homeStyles.avatar}>
            <Text style={homeStyles.avatarText}>
              {profile?.first_name?.[0] || 'G'}
              {profile?.last_name?.[0] || ''}
            </Text>
          </View>
          <View style={homeStyles.profileDetails}>
            <Text style={homeStyles.profileName}>
              {profile?.first_name || 'Golfer'} {profile?.last_name || ''}
            </Text>
            {homeCourseName && (
              <Text style={homeStyles.homeCourse}>🏌️ {homeCourseName}</Text>
            )}
            {profile?.handicap_index !== null && profile?.handicap_index !== undefined && (
              <Text style={homeStyles.handicap}>Handicap: {profile.handicap_index}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={homeStyles.viewProfileLink}>View Profile →</Text>
        </TouchableOpacity>
      </View>

      {/* Next Tee Time / Book CTA */}
      <View style={homeStyles.section}>
        {nextTeeTime ? (
          <View style={homeStyles.nextTeeTimeCard}>
            <Text style={homeStyles.sectionTitle}>Next Tee Time</Text>
            <View style={homeStyles.teeTimeDetails}>
              <Text style={homeStyles.teeTimeDate}>
                📅 {dayjs(nextTeeTime.slot?.tee_date).format('dddd, MMMM D, YYYY')}
              </Text>
              <Text style={homeStyles.teeTimeTime}>
                ⏰ {dayjs(nextTeeTime.slot?.tee_date).format('h:mm A')}
              </Text>
              <Text style={homeStyles.teeTimeCourse}>
                ⛳ {nextTeeTime.course?.name || 'Golf Course'}
              </Text>
              <Text style={homeStyles.teeTimeHoles}>
                🏌️ {nextTeeTime.holes} Holes
              </Text>
              {nextTeeTime.booking_status && (
                <View style={homeStyles.statusBadge}>
                  <Text style={homeStyles.statusText}>
                    {nextTeeTime.booking_status.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={homeStyles.button}
              onPress={() => navigation.navigate('TeeTimes')}
            >
              <Text style={homeStyles.buttonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={homeStyles.bookCTACard}>
            <Text style={homeStyles.sectionTitle}>No Upcoming Tee Times</Text>
            <Text style={homeStyles.ctaSubtext}>Ready to hit the links?</Text>
            <TouchableOpacity
              style={homeStyles.button}
              onPress={() => navigation.navigate('Courses')}
            >
              <Text style={homeStyles.buttonText}>Book a Tee Time</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quick Actions Row */}
      <View style={homeStyles.section}>
        <Text style={homeStyles.sectionTitle}>Quick Actions</Text>
        <View style={homeStyles.quickActionsRow}>
          <TouchableOpacity
            style={homeStyles.quickActionButton}
            onPress={() => navigation.navigate('Courses')}
          >
            <Text style={homeStyles.quickActionIcon}>⛳</Text>
            <Text style={homeStyles.quickActionText}>Book Tee Time</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={homeStyles.quickActionButton}
            onPress={() => navigation.navigate('Courses')}
          >
            <Text style={homeStyles.quickActionIcon}>📍</Text>
            <Text style={homeStyles.quickActionText}>Nearby Courses</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={homeStyles.quickActionButton}
            onPress={() => navigation.navigate('TeeTimes')}
          >
            <Text style={homeStyles.quickActionIcon}>📅</Text>
            <Text style={homeStyles.quickActionText}>My Tee Times</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={homeStyles.quickActionButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={homeStyles.quickActionIcon}>🔔</Text>
            <Text style={homeStyles.quickActionText}>Inbox</Text>
            {unreadCount > 0 && (
              <View style={homeStyles.badge}>
                <Text style={homeStyles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Weather at Home Course */}
      {weather && (
        <View style={homeStyles.section}>
          <Text style={homeStyles.sectionTitle}>Weather</Text>
          <View style={homeStyles.weatherCard}>
            <View style={homeStyles.weatherHeader}>
              <Text style={homeStyles.weatherLocation}>{weather.location?.name}</Text>
              <Text style={homeStyles.weatherCondition}>
                {weather.current?.condition?.text}
              </Text>
            </View>
            <View style={homeStyles.weatherDetails}>
              <View style={homeStyles.weatherItem}>
                <Text style={homeStyles.weatherLabel}>Temperature</Text>
                <Text style={homeStyles.weatherValue}>
                  {Math.round(weather.current?.temp_f)}°F
                </Text>
              </View>
              <View style={homeStyles.weatherItem}>
                <Text style={homeStyles.weatherLabel}>Wind</Text>
                <Text style={homeStyles.weatherValue}>
                  {Math.round(weather.current?.wind_mph)} mph {weather.current?.wind_dir}
                </Text>
              </View>
              <View style={homeStyles.weatherItem}>
                <Text style={homeStyles.weatherLabel}>Humidity</Text>
                <Text style={homeStyles.weatherValue}>{weather.current?.humidity}%</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Upcoming Course Events */}
      {upcomingEvents.length > 0 && (
        <View style={homeStyles.section}>
          <Text style={homeStyles.sectionTitle}>Upcoming Events</Text>
          {upcomingEvents.map((event) => {
            const startDate = new Date(event.start_at);
            const formattedDate = startDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const formattedTime = startDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            });

            return (
              <View key={event.id} style={homeStyles.eventCard}>
                {event.image_url && (
                  <Image
                    source={{ uri: event.image_url }}
                    style={homeStyles.eventImage}
                    resizeMode="cover"
                  />
                )}
                <View style={homeStyles.eventInfo}>
                  <Text style={homeStyles.eventTitle} numberOfLines={2}>
                    {event.title}
                  </Text>
                  <Text style={homeStyles.eventDate}>
                    📅 {formattedDate} at {formattedTime}
                  </Text>
                  {event.location && (
                    <Text style={homeStyles.eventLocation} numberOfLines={1}>
                      📍 {event.location}
                    </Text>
                  )}
                  {event.price !== null && event.price > 0 && (
                    <Text style={homeStyles.eventPrice}>💰 ${event.price.toFixed(2)}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Notifications Preview */}
      {recentNotifications.length > 0 && (
        <View style={homeStyles.section}>
          <View style={homeStyles.sectionHeader}>
            <Text style={homeStyles.sectionTitle}>Recent Notifications</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
              <Text style={homeStyles.viewAllLink}>View All →</Text>
            </TouchableOpacity>
          </View>
          {recentNotifications.map((notification) => (
            <View
              key={notification.id}
              style={[
                homeStyles.notificationCard,
                !notification.read && homeStyles.notificationUnread,
              ]}
            >
              <Text style={homeStyles.notificationTitle}>{notification.title}</Text>
              <Text style={homeStyles.notificationMessage} numberOfLines={2}>
                {notification.body}
              </Text>
              <Text style={homeStyles.notificationTime}>
                {dayjs(notification.created_at).fromNow()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  viewAllLink: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },

  // Profile Snapshot
  profileSection: {
    backgroundColor: '#22c55e',
    padding: 20,
    marginBottom: 12,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  homeCourse: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 2,
  },
  handicap: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  viewProfileLink: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'right',
  },

  // Next Tee Time
  nextTeeTimeCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  teeTimeDetails: {
    marginBottom: 16,
  },
  teeTimeDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  teeTimeTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  teeTimeCourse: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 6,
  },
  teeTimeHoles: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Book CTA
  bookCTACard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
  },
  ctaSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },

  // Common Button
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickActionButton: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    position: 'relative',
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 11,
    color: '#4b5563',
    textAlign: 'center',
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Weather
  weatherCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  weatherHeader: {
    marginBottom: 12,
  },
  weatherLocation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  weatherCondition: {
    fontSize: 14,
    color: '#6b7280',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherItem: {
    alignItems: 'center',
  },
  weatherLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },

  // Events
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  eventImage: {
    width: 100,
    height: 100,
    backgroundColor: '#e5e7eb',
  },
  eventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  eventPrice: {
    fontSize: 13,
    color: '#22c55e',
    fontWeight: '600',
    marginTop: 4,
  },

  // Notifications
  notificationCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#d1d5db',
  },
  notificationUnread: {
    backgroundColor: '#f0fdf4',
    borderLeftColor: '#22c55e',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
