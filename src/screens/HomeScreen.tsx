import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  StatusBar,
  Dimensions,
  Button,
} from 'react-native';
import * as Sentry from '@sentry/react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { reservationsService } from '@/services/reservations';
import { notificationsService } from '@/services/notifications';
import { coursesService } from '@/services/courses';
import { weatherService } from '@/services/weather';
import { tournamentsService } from '@/services/tournaments';
import { golfRoundsService } from '@/services/golfRounds';
import { ReservationWithDetails, CourseEvent, AppTabParamList, CoursesStackParamList, Database } from '@/types';
import MyTournamentCard from '@/components/MyTournamentCard';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Flag, MapPin, Calendar, Bell, Thermometer, Wind, Droplets, CloudSun, Clock, X, Newspaper, RotateCcw, ChevronRight } from 'lucide-react-native';

dayjs.extend(relativeTime);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, 'Home'>,
  StackNavigationProp<CoursesStackParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, profile } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextTeeTime, setNextTeeTime] = useState<Database['public']['Views']['tee_time_reservations_with_slot']['Row'] | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState<CourseEvent[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [homeCourseName, setHomeCourseName] = useState<string>('');
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [activeTournaments, setActiveTournaments] = useState<any[]>([]);
  const [recentRounds, setRecentRounds] = useState<any[]>([]);

  useEffect(() => {
    loadHomeData();
  }, [user?.id]);

  // Refresh data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadHomeData();
      }
    }, [user?.id])
  );

  const loadHomeData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      if (profile?.home_course_id) {
        const courseRes = await coursesService.fetchCourseById(profile.home_course_id);
        if (courseRes.data?.name) {
          setHomeCourseName(courseRes.data.name);
        }
      }

      if (profile?.home_course_id) {
        const courseRes = await coursesService.fetchCourseById(profile.home_course_id);
        const homeCourseLocation = courseRes.data?.location as any;

        if (homeCourseLocation?.latitude && homeCourseLocation?.longitude) {
          const weatherRes = await weatherService.getCurrentWeather(
            homeCourseLocation.latitude,
            homeCourseLocation.longitude
          );
          if (weatherRes.data) {
            setWeather(weatherRes.data);
          }
        }

        const eventsRes = await coursesService.fetchCourseEvents(profile.home_course_id);
        if (eventsRes.data) {
          setUpcomingEvents(eventsRes.data.slice(0, 3));
        }
      }

      const nextRes = await reservationsService.fetchNextReservation(user.id);

      if (nextRes.data) {
        setNextTeeTime(nextRes.data);
      }

      const unreadRes = await notificationsService.fetchUnreadCount(user.id);
      if (unreadRes.data !== null) {
        setUnreadCount(unreadRes.data);
      }

      // Fetch active tournaments for current user
      const tournamentsRes = await tournamentsService.fetchUserActiveTournaments(user.id);
      if (tournamentsRes.data) {
        setActiveTournaments(tournamentsRes.data);
      }

      // Fetch recent personal rounds (last 3)
      const roundsRes = await golfRoundsService.fetchRecentGolfRounds(user.id, 3);
      if (roundsRes.data) {
        setRecentRounds(roundsRes.data);
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

  const handleImagePress = (imageUrl: string) => {
    setFullscreenImageUrl(imageUrl);
    setIsImageModalVisible(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalVisible(false);
    setTimeout(() => setFullscreenImageUrl(null), 300);
  };

  // Quick Action Navigation Handlers
  // These handlers provide a centralized navigation logic for quick actions
  // - Book Tee Time: Navigates to home course tee times if set, otherwise to courses list
  // - My Tee Times: Navigates to user's tee time reservations
  // - Rounds: Navigates to user's golf rounds list
  // - Inbox: Navigates to notifications within the Profile stack

  const handleBookTeeTime = () => {
    if (profile?.home_course_id && homeCourseName) {
      navigation.navigate('Courses', {
        screen: 'CourseTeeTimesScreen',
        params: {
          courseId: profile.home_course_id,
          courseName: homeCourseName,
        },
      });
    } else {
      navigation.navigate('Courses');
    }
  };

  const handleMyTeeTimes = () => {
    navigation.navigate('TeeTimes');
  };

  const handleRounds = () => {
    navigation.navigate('Rounds');
  };

  const handleInbox = () => {
    navigation.navigate('Profile', { screen: 'Notifications' });
  };

  if (loading) {
    return (
      <View style={[homeStyles.loadingContainer, isDark && homeStyles.loadingContainerDark]}>
        <ActivityIndicator size="large" color="#2d7a4e" />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={[homeStyles.container, isDark && homeStyles.containerDark]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
      {/* Profile Snapshot */}
      <View style={[homeStyles.profileSection, isDark && homeStyles.profileSectionDark]}>
        <View style={homeStyles.profileInfo}>
          <View style={homeStyles.avatar}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={homeStyles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={homeStyles.avatarText}>
                  {profile?.first_name?.[0] || 'G'}
                  {profile?.last_name?.[0] || ''}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={homeStyles.profileDetails}>
            <Text style={homeStyles.profileName}>
              {profile?.first_name || 'Golfer'} {profile?.last_name || ''}
            </Text>
            {homeCourseName && (
              <View style={homeStyles.homeCourseRow}>
                <Flag size={14} color="#fff" strokeWidth={2} />
                <Text style={homeStyles.homeCourse}>{homeCourseName}</Text>
              </View>
            )}
            {profile?.handicap_index !== null && profile?.handicap_index !== undefined && (
              <Text style={homeStyles.handicap}>{t('home.profile.handicap')}: {profile.handicap_index}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Weather at Home Course */}
      {weather && (
        <View style={[homeStyles.section, isDark && homeStyles.sectionDark]}>
          <View style={homeStyles.weatherDetails}>
              <View style={homeStyles.weatherItem}>
                <Thermometer size={20} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={1.5} />
                <Text style={[homeStyles.weatherLabel, isDark && homeStyles.weatherLabelDark]}>{t('home.weather.temperature')}</Text>
                <Text style={[homeStyles.weatherValue, isDark && homeStyles.weatherValueDark]}>
                  {Math.round(weather.current?.temp_f)}°F
                </Text>
              </View>
              <View style={homeStyles.weatherItem}>
                <Wind size={20} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={1.5} />
                <Text style={[homeStyles.weatherLabel, isDark && homeStyles.weatherLabelDark]}>{t('home.weather.wind')}</Text>
                <Text style={[homeStyles.weatherValue, isDark && homeStyles.weatherValueDark]}>
                  {Math.round(weather.current?.wind_mph)} mph
                </Text>
              </View>
              <View style={homeStyles.weatherItem}>
                <Droplets size={20} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={1.5} />
                <Text style={[homeStyles.weatherLabel, isDark && homeStyles.weatherLabelDark]}>{t('home.weather.humidity')}</Text>
                <Text style={[homeStyles.weatherValue, isDark && homeStyles.weatherValueDark]}>{weather.current?.humidity}%</Text>
              </View>
              <View style={homeStyles.weatherItem}>
                <CloudSun size={20} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={1.5} />
                <Text style={[homeStyles.weatherLabel, isDark && homeStyles.weatherLabelDark]}>{t('home.weather.condition')}</Text>
                <Text style={[homeStyles.weatherValue, isDark && homeStyles.weatherValueDark]}>{weather.current?.condition?.text}</Text>
              </View>
            </View>
        </View>
      )}

      {/* Next Tee Time / Book CTA */}
      
        {nextTeeTime && (
          <View style={[homeStyles.section, isDark && homeStyles.sectionDark]}>
          <View style={[homeStyles.nextTeeTimeCard, isDark && homeStyles.nextTeeTimeCardDark]}>
            <Text style={[homeStyles.sectionTitle, isDark && homeStyles.sectionTitleDark]}>{t('home.nextTeeTime')}</Text>
            <View style={homeStyles.teeTimeDetails}>
              <View style={homeStyles.teeTimeRow}>
                <Calendar size={16} color={isDark ? '#f8f9fa' : '#212529'} strokeWidth={2} />
                <Text style={[homeStyles.teeTimeDate, isDark && homeStyles.teeTimeDateDark]}>
                  {dayjs(nextTeeTime.tee_date).format('dddd, MMMM D, YYYY')}
                </Text>
              </View>
              <View style={homeStyles.teeTimeRow}>
                <Clock size={16} color={isDark ? '#f8f9fa' : '#212529'} strokeWidth={2} />
                <Text style={[homeStyles.teeTimeTime, isDark && homeStyles.teeTimeTimeDark]}>
                  {dayjs(nextTeeTime.tee_time).format('h:mm A')}
                </Text>
              </View>
              <View style={homeStyles.teeTimeRow}>
                <Flag size={16} color={isDark ? '#adb5bd' : '#495057'} strokeWidth={2} />
                <Text style={[homeStyles.teeTimeCourse, isDark && homeStyles.teeTimeCourseDark]}>
                  {nextTeeTime.course_name || 'Golf Course'}
                </Text>
              </View>
              <View style={homeStyles.teeTimeRow}>
                <Text style={[homeStyles.teeTimeHoles, isDark && homeStyles.teeTimeHolesDark]}>
                  N/A {t('home.teeTimeCard.holes')}
                </Text>
              </View>
              <View style={homeStyles.teeTimeRow}>
                <Text style={[homeStyles.teeTimeHoles, isDark && homeStyles.teeTimeHolesDark]}>
                  {nextTeeTime.hole} {t('home.teeTimeCard.hole')}
                </Text>
              </View>
            </View>
          </View>
         </View>
        )}

      {/* My Active Tournaments */}
      {activeTournaments.length > 0 && (
        <View style={[homeStyles.section, isDark && homeStyles.sectionDark]}>
          <Text style={[homeStyles.sectionTitle, isDark && homeStyles.sectionTitleDark]}>
            {t('home.myTournaments') || 'My Tournaments'}
          </Text>
          {activeTournaments.map((tournament) => {
            const holesCompleted = [
              tournament.hole_1,
              tournament.hole_2,
              tournament.hole_3,
              tournament.hole_4,
              tournament.hole_5,
              tournament.hole_6,
              tournament.hole_7,
              tournament.hole_8,
              tournament.hole_9,
              tournament.hole_10,
              tournament.hole_11,
              tournament.hole_12,
              tournament.hole_13,
              tournament.hole_14,
              tournament.hole_15,
              tournament.hole_16,
              tournament.hole_17,
              tournament.hole_18,
            ].filter((score) => score !== null).length;

            const tournamentData = tournament.tournament_groups?.[0]?.tournaments?.[0];

            return (
              <MyTournamentCard
                key={tournament.id}
                tournamentName={tournamentData?.name || 'Tournament'}
                groupName={tournament.tournament_groups?.[0]?.name || 'Group'}
                courseName={undefined}
                startDateTime={tournament.start_datetime}
                holesComplete={holesCompleted}
                status={tournament.is_complete ? 'active' : 'active'}
                onPress={() => {
                  // Navigate to tournament detail
                  navigation.navigate('Tournaments', {
                    screen: 'TournamentDetail',
                    params: {
                      tournamentId: tournament.tournament_id,
                    },
                  });
                }}
                onScorePress={() => {
                  // Navigate to scorecard
                  navigation.navigate('Tournaments', {
                    screen: 'Scorecard',
                    params: {
                      roundId: tournament.id,
                    },
                  });
                }}
              />
            );
          })}
        </View>
      )}

      {/* Quick Actions Row */}
      <View style={[homeStyles.section, isDark && homeStyles.sectionDark]}>
        <Text style={[homeStyles.sectionTitle, isDark && homeStyles.sectionTitleDark]}>{t('home.quickActions')}</Text>
        <View style={homeStyles.quickActionsRow}>
          <TouchableOpacity
            style={[homeStyles.quickActionButton, isDark && homeStyles.quickActionButtonDark]}
            onPress={handleBookTeeTime}
          >
            <Flag size={24} color="#2d7a4e" strokeWidth={2} />
            <Text style={[homeStyles.quickActionText, isDark && homeStyles.quickActionTextDark]}>{t('home.bookTeeTime')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[homeStyles.quickActionButton, isDark && homeStyles.quickActionButtonDark]}
            onPress={handleMyTeeTimes}
          >
            <Calendar size={24} color="#2d7a4e" strokeWidth={2} />
            <Text style={[homeStyles.quickActionText, isDark && homeStyles.quickActionTextDark]}>{t('home.myTeeTimes')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[homeStyles.quickActionButton, isDark && homeStyles.quickActionButtonDark]}
            onPress={handleRounds}
          >
            <RotateCcw size={24} color="#2d7a4e" strokeWidth={2} />
            <Text style={[homeStyles.quickActionText, isDark && homeStyles.quickActionTextDark]}>{t('navigation.rounds') || 'Rounds'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[homeStyles.quickActionButton, isDark && homeStyles.quickActionButtonDark]}
            onPress={handleInbox}
          >
            <Bell size={24} color="#2d7a4e" strokeWidth={2} />
            <Text style={[homeStyles.quickActionText, isDark && homeStyles.quickActionTextDark]}>{t('home.inbox')}</Text>
            {unreadCount > 0 && (
              <View style={homeStyles.badge}>
                <Text style={homeStyles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Rounds */}
      {recentRounds.length > 0 && (
        <View style={[homeStyles.section, isDark && homeStyles.sectionDark]}>
          <View style={homeStyles.sectionHeader}>
            <Text style={[homeStyles.sectionTitle, isDark && homeStyles.sectionTitleDark]}>
              {t('home.recentRounds') || 'Recent Rounds'}
            </Text>
            <TouchableOpacity onPress={handleRounds}>
              <Text style={homeStyles.viewAllLink}>{t('common.viewAll') || 'View All'}</Text>
            </TouchableOpacity>
          </View>
          {recentRounds.map((round) => {
            const isGood = round.score_to_par <= 0;
            const scoreBgColor = isGood
              ? isDark
                ? '#1e4620'
                : '#d4edda'
              : isDark
              ? '#4a2626'
              : '#f8d7da';
            const scoreTextColor = isGood
              ? isDark
                ? '#90ee90'
                : '#155724'
              : isDark
              ? '#f8a5a5'
              : '#721c24';

            return (
              <TouchableOpacity
                key={round.id}
                onPress={() => navigation.navigate('Rounds', { screen: 'RoundDetail', params: { roundId: round.id } })}
                style={[homeStyles.recentRoundCard, isDark && homeStyles.recentRoundCardDark]}
              >
                <View style={homeStyles.recentRoundHeader}>
                  <View>
                    <Text style={[homeStyles.recentRoundCourse, isDark && homeStyles.recentRoundCourseDark]}>
                      {round.course_name}
                    </Text>
                    <Text style={[homeStyles.recentRoundDate, isDark && homeStyles.recentRoundDateDark]}>
                      {new Date(round.round_date).toLocaleDateString()}
                    </Text>
                  </View>
                  {round.tee_box_color && (
                    <View
                      style={[homeStyles.teeBoxIndicator, { backgroundColor: round.tee_box_color }]}
                    />
                  )}
                </View>
                <View style={homeStyles.recentRoundStats}>
                  <View style={homeStyles.statItem}>
                    <Text style={[homeStyles.statLabel, isDark && homeStyles.statLabelDark]}>Score</Text>
                    <Text style={[homeStyles.statValue, isDark && homeStyles.statValueDark]}>
                      {round.total_score}
                    </Text>
                  </View>
                  <View
                    style={[homeStyles.statItem, { backgroundColor: scoreBgColor, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }]}
                  >
                    <Text style={[homeStyles.statLabel, { color: scoreTextColor, fontSize: 11 }]}>vs Par</Text>
                    <Text style={[homeStyles.statValue, { color: scoreTextColor }]}>
                      {round.score_to_par > 0 ? '+' : ''}{round.score_to_par}
                    </Text>
                  </View>
                  <View style={homeStyles.statItem}>
                    <Text style={[homeStyles.statLabel, isDark && homeStyles.statLabelDark]}>GIR</Text>
                    <Text style={[homeStyles.statValue, isDark && homeStyles.statValueDark]}>
                      {round.greens_in_regulation || '0'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Upcoming Course Events */}
      {upcomingEvents.length > 0 && (
        <View style={[homeStyles.section, isDark && homeStyles.sectionDark]}>
          <Text style={[homeStyles.sectionTitle, isDark && homeStyles.sectionTitleDark]}>{t('home.upcomingEvents')}</Text>
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
              <View key={event.id} style={[homeStyles.eventCard, isDark && homeStyles.eventCardDark]}>
                {event.image_url && (
                  <TouchableOpacity
                    onPress={() => handleImagePress(event.image_url!)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: event.image_url }}
                      style={homeStyles.eventImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
                <View style={[homeStyles.eventInfo, isDark && homeStyles.eventInfoDark]}>
                  <Text style={[homeStyles.eventTitle, isDark && homeStyles.eventTitleDark]} numberOfLines={2}>
                    {event.title}
                  </Text>
                  <View style={homeStyles.eventRow}>
                    <Calendar size={12} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={2} />
                    <Text style={[homeStyles.eventDate, isDark && homeStyles.eventDateDark]}>
                      {formattedDate} at {formattedTime}
                    </Text>
                  </View>
                  {event.location && (
                    <View style={homeStyles.eventRow}>
                      <MapPin size={12} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={2} />
                      <Text style={[homeStyles.eventLocation, isDark && homeStyles.eventLocationDark]} numberOfLines={1}>
                        {event.location}
                      </Text>
                    </View>
                  )}
                  {event.price !== null && event.price > 0 && (
                    <Text style={homeStyles.eventPrice}>${event.price.toFixed(2)}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
      </ScrollView>

      {/* Fullscreen Image Modal */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseImageModal}
      >
        <View style={homeStyles.modalContainer}>
          <StatusBar barStyle="light-content" />
          <TouchableOpacity
            style={homeStyles.modalCloseButton}
            onPress={handleCloseImageModal}
            activeOpacity={0.8}
          >
            <X size={24} color="#fff" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={homeStyles.modalImageContainer}
            activeOpacity={1}
            onPress={handleCloseImageModal}
          >
            {fullscreenImageUrl && (
              <Image
                source={{ uri: fullscreenImageUrl }}
                style={homeStyles.modalImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
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
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  viewAllLink: {
    fontSize: 14,
    color: '#2d7a4e',
    fontWeight: '600',
  },

  // Profile Snapshot
  profileSection: {
    backgroundColor: '#2d7a4e',
    padding: 20,
    marginBottom: 0,
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 60,
    height: 60,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2d7a4e',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  homeCourseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  homeCourse: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
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
    backgroundColor: '#f0f9f4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2d7a4e',
  },
  teeTimeDetails: {
    marginBottom: 16,
    gap: 8,
  },
  teeTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teeTimeDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
  },
  teeTimeTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
  },
  teeTimeCourse: {
    fontSize: 15,
    color: '#495057',
  },
  teeTimeHoles: {
    fontSize: 14,
    color: '#868e96',
  },
  statusBadge: {
    backgroundColor: '#2d7a4e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Common Button
  button: {
    backgroundColor: '#2d7a4e',
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
    gap: 8,
  },
  quickActionButton: {
    width: '18.5%',
    aspectRatio: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickActionText: {
    fontSize: 10,
    color: '#495057',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 6,
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
    fontWeight: '600',
  },

  // Weather
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherItem: {
    alignItems: 'center',
    gap: 4,
  },
  weatherLabel: {
    fontSize: 11,
    color: '#868e96',
    textAlign: 'center',
  },
  weatherValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
  },

  // Events
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  eventImage: {
    width: 100,
    height: 100,
    backgroundColor: '#d1d6db',
  },
  eventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventDate: {
    fontSize: 13,
    color: '#868e96',
  },
  eventLocation: {
    fontSize: 13,
    color: '#868e96',
  },
  eventPrice: {
    fontSize: 14,
    color: '#2d7a4e',
    fontWeight: '600',
    marginTop: 4,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },

  // Dark Mode Styles
  containerDark: {
    backgroundColor: '#1a1d21',
  },
  loadingContainerDark: {
    backgroundColor: '#1a1d21',
  },
  sectionDark: {
    backgroundColor: '#2b3137',
  },
  sectionTitleDark: {
    color: '#f8f9fa',
  },
  viewAllLinkDark: {
    color: '#2d7a4e',
  },
  profileSectionDark: {
    backgroundColor: '#2b3137',
  },
  weatherLabelDark: {
    color: '#adb5bd',
  },
  weatherValueDark: {
    color: '#f8f9fa',
  },

  // Next Tee Time Dark
  nextTeeTimeCardDark: {
    backgroundColor: '#2b3137',
    borderColor: '#2d7a4e',
  },
  teeTimeDateDark: {
    color: '#f8f9fa',
  },
  teeTimeTimeDark: {
    color: '#f8f9fa',
  },
  teeTimeCourseDark: {
    color: '#adb5bd',
  },
  teeTimeHolesDark: {
    color: '#adb5bd',
  },

  // Quick Actions Dark
  quickActionButtonDark: {
    backgroundColor: '#1a1d21',
    borderColor: '#343a40',
  },
  quickActionTextDark: {
    color: '#adb5bd',
  },

  // Events Dark
  eventCardDark: {
    backgroundColor: '#1a1d21',
    borderColor: '#343a40',
  },
  eventInfoDark: {
    backgroundColor: '#1a1d21',
  },
  eventTitleDark: {
    color: '#f8f9fa',
  },
  eventDateDark: {
    color: '#adb5bd',
  },
  eventLocationDark: {
    color: '#adb5bd',
  },

  // Recent Rounds
  recentRoundCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  recentRoundCardDark: {
    backgroundColor: '#1a1d21',
    borderColor: '#343a40',
  },
  recentRoundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentRoundCourse: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
  },
  recentRoundCourseDark: {
    color: '#f8f9fa',
  },
  recentRoundDate: {
    fontSize: 13,
    color: '#868e96',
    marginTop: 2,
  },
  recentRoundDateDark: {
    color: '#adb5bd',
  },
  teeBoxIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  recentRoundStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statItem: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#868e96',
    marginBottom: 2,
  },
  statLabelDark: {
    color: '#adb5bd',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  statValueDark: {
    color: '#f8f9fa',
  },
});
