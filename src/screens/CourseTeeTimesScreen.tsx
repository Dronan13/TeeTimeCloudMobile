import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Alert,
  Animated,
  PanResponder,
  Image,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CoursesStackParamList, Database } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, addDays, parseISO, isSameDay } from 'date-fns';
import { weatherService, WeatherForecast } from '@/services/weather';

type CourseTeeTimesScreenRouteProp = RouteProp<
  CoursesStackParamList,
  'CourseTeeTimesScreen'
>;
type CourseTeeTimesScreenNavigationProp = StackNavigationProp<
  CoursesStackParamList,
  'CourseTeeTimesScreen'
>;

type TeeTimeSlot =
  Database['public']['Views']['tee_time_slots_with_reservation_count']['Row'];

type TimePeriod = 'all' | 'morning' | 'noon' | 'evening';

export default function CourseTeeTimesScreen() {
  const route = useRoute<CourseTeeTimesScreenRouteProp>();
  const navigation = useNavigation<CourseTeeTimesScreenNavigationProp>();
  const { courseId, courseName } = route.params;
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('all');
  const [selectedHole, setSelectedHole] = useState<number>(1);
  const [teeTimes, setTeeTimes] = useState<TeeTimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [bookingWindowDays, setBookingWindowDays] = useState<number>(14); // Default to 14
  const [hasReservationOnDate, setHasReservationOnDate] = useState<boolean>(false);
  const [reservationDetails, setReservationDetails] = useState<{
    reservationId: string;
    teeTime: string;
    hole: number;
    status: string;
  } | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast | null>(null);
  const [courseLocation, setCourseLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  useEffect(() => {
    fetchTeeTimes();
    checkExistingReservation();
  }, [courseId, selectedDate, selectedHole]);

  const fetchCourseDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('booking_window_days, location')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      if (data?.booking_window_days) {
        setBookingWindowDays(data.booking_window_days);
      }

      // Fetch weather forecast if location is available
      if (data?.location) {
        const location = data.location as any;
        if (location?.latitude && location?.longitude) {
          setCourseLocation({ latitude: location.latitude, longitude: location.longitude });

          // Fetch weather forecast for up to 14 days (max supported by API is usually 14-16 days)
          const forecastDays = bookingWindowDays+1;
          const weatherRes = await weatherService.getForecast(
            location.latitude,
            location.longitude,
            forecastDays
          );

          if (weatherRes.data) {
            setWeatherForecast(weatherRes.data);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const fetchTeeTimes = async () => {
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('tee_time_slots_with_reservation_count')
        .select('*')
        .eq('course_id', courseId)
        .eq('tee_date', dateStr)
        .eq('hole', selectedHole)
        .gt('available_players', 0) // Only show slots with available spots
        .order('tee_time', { ascending: true });

      if (error) throw error;
      setTeeTimes(data || []);
    } catch (error) {
      console.error('Error fetching tee times:', error);
      Alert.alert(t('common.error'), t('courses.teeTimes.errorLoadTeeTimes'));
    } finally {
      setLoading(false);
    }
  };

  const checkExistingReservation = async () => {
    if (!user) return;

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('tee_time_reservations_with_slot')
        .select('reservation_id, tee_time, hole, booking_status')
        .eq('user_id', user.id)
        .eq('tee_date', dateStr)
        .in('booking_status', ['confirmed', 'pending']);

      if (error) throw error;

      if (data && data.length > 0) {
        setHasReservationOnDate(true);
        setReservationDetails({
          reservationId: data[0].reservation_id || '',
          teeTime: data[0].tee_time || '',
          hole: data[0].hole || 0,
          status: data[0].booking_status || '',
        });
      } else {
        setHasReservationOnDate(false);
        setReservationDetails(null);
      }
    } catch (error) {
      console.error('Error checking existing reservation:', error);
    }
  };

  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 0; i <= bookingWindowDays; i++) {
      result.push(addDays(today, i));
    }
    return result;
  }, [bookingWindowDays]);

  const filteredTeeTimes = useMemo(() => {
    if (selectedTimePeriod === 'all') return teeTimes;

    return teeTimes.filter((slot) => {
      if (!slot.tee_time) return false;
      const hour = parseInt(slot.tee_time.split(':')[0], 10);

      if (selectedTimePeriod === 'morning') return hour < 12;
      if (selectedTimePeriod === 'noon') return hour >= 12 && hour < 16;
      if (selectedTimePeriod === 'evening') return hour >= 16;
      return true;
    });
  }, [teeTimes, selectedTimePeriod]);

  const handleCancelExistingReservation = () => {
    if (!reservationDetails) return;

    Alert.alert(
      t('courses.teeTimes.cancelExisting'),
      t('courses.teeTimes.cancelExistingMessage', {
        status: reservationDetails.status,
        time: reservationDetails.teeTime.slice(0, 5),
        hole: reservationDetails.hole
      }),
      [
        {
          text: t('courses.teeTimes.no'),
          style: 'cancel',
        },
        {
          text: t('courses.teeTimes.yesCancel'),
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('tee_time_reservations')
                .update({ booking_status: 'cancelled' })
                .eq('id', reservationDetails.reservationId);

              if (error) throw error;

              Alert.alert(t('common.success'), t('courses.teeTimes.cancelSuccess'));

              // Refresh the data
              checkExistingReservation();
              fetchTeeTimes();
            } catch (error) {
              console.error('Error cancelling reservation:', error);
              Alert.alert(t('common.error'), t('courses.teeTimes.cancelError'));
            }
          },
        },
      ]
    );
  };

  const handleSlotPress = async (slot: TeeTimeSlot) => {
    if (!slot.id || !user) return;

    // If already has reservation on this date, prevent booking
    if (hasReservationOnDate) {
      return;
    }

    // Proceed to booking
    navigation.navigate('ReservationScreen', {
      slotId: slot.id,
      courseId: courseId,
    });
  };

  const SwipeableAlert = () => {
    const translateX = useRef(new Animated.Value(0)).current;
    const SWIPE_THRESHOLD = -80;

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 5;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx < 0) {
            translateX.setValue(Math.max(gestureState.dx, SWIPE_THRESHOLD));
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -40) {
            Animated.spring(translateX, {
              toValue: SWIPE_THRESHOLD,
              useNativeDriver: true,
            }).start();
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      })
    ).current;

    if (!reservationDetails) return null;

    return (
      <View style={styles.alertBanner}>
        <View style={styles.swipeableContainer}>
          <TouchableOpacity
            style={styles.cancelAlertButtonBehind}
            onPress={handleCancelExistingReservation}
          >
            <Text style={styles.cancelAlertButtonText}>{t('courses.teeTimes.cancel')}</Text>
          </TouchableOpacity>
          <Animated.View
            style={[
              styles.alertContent,
              isDark && styles.alertContentDark,
              {
                transform: [{ translateX }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.alertTextContainer}>
              <Text style={[styles.alertTitle, isDark && styles.alertTitleDark]}>
                {t('courses.teeTimes.youHaveReservation')}
              </Text>
              <Text style={[styles.alertText, isDark && styles.alertTextDark]}>
                {t('courses.teeTimes.reservationInfo', {
                  time: reservationDetails.teeTime.slice(0, 5),
                  hole: reservationDetails.hole,
                  status: reservationDetails.status
                })}
              </Text>
              <Text style={[styles.alertSubtext, isDark && styles.alertSubtextDark]}>
                {t('courses.teeTimes.swipeLeftToCancel')}
              </Text>
            </View>
          </Animated.View>
        </View>
      </View>
    );
  };

  const renderDateItem = ({ item }: { item: Date }) => {
    const isSelected = isSameDay(item, selectedDate);
    const dateStr = format(item, 'yyyy-MM-dd');

    // Find weather forecast for this date
    const dayForecast = weatherForecast?.forecast?.forecastday?.find(
      (day) => day.date === dateStr
    );

    return (
      <TouchableOpacity
        style={[styles.dateItem, isDark && styles.dateItemDark, isSelected && styles.dateItemActive]}
        onPress={() => setSelectedDate(item)}
      >
        <Text style={[styles.dateDay, isDark && styles.dateDayDark, isSelected && styles.dateTextActive]}>
          {format(item, 'EEE')}
        </Text>
        <Text style={[styles.dateNumber, isDark && styles.dateNumberDark, isSelected && styles.dateTextActive]}>
          {format(item, 'd')}
        </Text>
        {dayForecast && (
          <View style={styles.weatherContainer}>
            <Image
              source={{ uri: `https:${dayForecast.day.condition.icon}` }}
              style={styles.weatherIcon}
            />
            <Text style={[styles.weatherTemp, isDark && styles.weatherTempDark, isSelected && styles.dateTextActive]}>
              {Math.round(dayForecast.day.avgtemp_f)}°
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getSpotsColor = (spots: number) => {
    if (spots === 1) return '#ef4444'; // Danger (Red)
    if (spots === 2) return '#f59e0b'; // Warning (Orange/Amber)
    return '#22c55e'; // Success (Green)
  };

  const renderTeeTimeItem = ({ item }: { item: TeeTimeSlot }) => (
    <TouchableOpacity
      style={[styles.teeTimeItem, isDark && styles.teeTimeItemDark, hasReservationOnDate && styles.teeTimeItemDisabled]}
      onPress={() => handleSlotPress(item)}
      disabled={hasReservationOnDate}
    >
      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, isDark && styles.timeTextDark, hasReservationOnDate && styles.textDisabled]}>
          {item.tee_time ? item.tee_time.slice(0, 5) : ''}
        </Text>
        <Text style={[styles.holeText, isDark && styles.holeTextDark, hasReservationOnDate && styles.textDisabled]}>
          {t('reservation.hole')} {item.hole}
        </Text>
      </View>
      <View style={styles.availabilityContainer}>
        <Text
          style={[
            styles.spotsText,
            hasReservationOnDate
              ? styles.textDisabled
              : { color: getSpotsColor(item.available_players || 0) },
          ]}
        >
          {t('courses.teeTimes.spotsLeft', { count: item.available_players })}
        </Text>
        <View
          style={[styles.bookButton, hasReservationOnDate && styles.bookButtonDisabled]}
        >
          <Text style={styles.bookButtonText}>{t('courses.teeTimes.book')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header with Course Name */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <Text style={[styles.courseName, isDark && styles.courseNameDark]}>{courseName}</Text>
      </View>

      {/* Date Selector */}
      <View style={[styles.dateSelectorContainer, isDark && styles.dateSelectorContainerDark]}>
        <FlatList
          data={dates}
          renderItem={renderDateItem}
          keyExtractor={(item) => item.toISOString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateList}
        />
      </View>

      {/* Existing Reservation Alert */}
      {hasReservationOnDate && <SwipeableAlert />}

      {/* Filters Section */}
      <View style={[styles.filtersContainer, isDark && styles.filtersContainerDark]}>
        {/* Hole Selector */}
        <View style={[styles.holeSelector, isDark && styles.holeSelectorDark]}>
          <TouchableOpacity
            style={[styles.holeTab, isDark && styles.holeTabDark, selectedHole === 1 && styles.holeTabActive, selectedHole === 1 && isDark && styles.holeTabActiveDark]}
            onPress={() => setSelectedHole(1)}
          >
            <Text
              style={[styles.holeTabText, isDark && styles.holeTabTextDark, selectedHole === 1 && styles.holeTabTextActive]}
            >
              {t('courses.teeTimes.hole1')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.holeTab, isDark && styles.holeTabDark, selectedHole === 10 && styles.holeTabActive, selectedHole === 10 && isDark && styles.holeTabActiveDark]}
            onPress={() => setSelectedHole(10)}
          >
            <Text
              style={[
                styles.holeTabText,
                isDark && styles.holeTabTextDark,
                selectedHole === 10 && styles.holeTabTextActive,
              ]}
            >
              {t('courses.teeTimes.hole10')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Time Period Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.periodSelector}
        >
          {(['all', 'morning', 'noon', 'evening'] as TimePeriod[]).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodTab,
                isDark && styles.periodTabDark,
                selectedTimePeriod === period && styles.periodTabActive,
              ]}
              onPress={() => setSelectedTimePeriod(period)}
            >
              <Text
                style={[
                  styles.periodTabText,
                  isDark && styles.periodTabTextDark,
                  selectedTimePeriod === period && styles.periodTabTextActive,
                ]}
              >
                {t(`courses.teeTimes.${period}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tee Times List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : (
        <FlatList
          data={filteredTeeTimes}
          renderItem={renderTeeTimeItem}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={styles.teeTimeList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                {t('courses.teeTimes.noTeeTimesAvailable')}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  courseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  dateSelectorContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateList: {
    paddingHorizontal: 12,
  },
  dateItem: {
    width: 60,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: 'transparent',
    paddingVertical: 8,
  },
  dateItemActive: {
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
  },
  dateDay: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  dateTextActive: {
    color: '#fff',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  holeSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  holeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  holeTabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  holeTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  holeTabTextActive: {
    color: '#22c55e',
  },
  periodSelector: {
    flexDirection: 'row',
  },
  periodTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  periodTabActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  periodTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  periodTabTextActive: {
    color: '#15803d',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teeTimeList: {
    padding: 16,
    paddingBottom: 32,
  },
  teeTimeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  holeText: {
    fontSize: 13,
    color: '#6b7280',
  },
  availabilityContainer: {
    alignItems: 'flex-end',
  },
  spotsText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  bookButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 15,
    textAlign: 'center',
  },
  alertBanner: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  swipeableContainer: {
    position: 'relative',
    height: 100,
  },
  cancelAlertButtonBehind: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  alertContent: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    padding: 16,
    borderRadius: 8,
    height: '100%',
    justifyContent: 'center',
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 4,
    fontWeight: '500',
  },
  alertSubtext: {
    fontSize: 12,
    color: '#92400e',
    fontStyle: 'italic',
  },
  cancelAlertButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  teeTimeItemDisabled: {
    opacity: 0.5,
    backgroundColor: '#f3f4f6',
  },
  textDisabled: {
    color: '#9ca3af',
  },
  bookButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  weatherContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  weatherIcon: {
    width: 24,
    height: 24,
    marginBottom: 2,
  },
  weatherTemp: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
  },
  // Dark mode styles
  containerDark: {
    backgroundColor: '#111827',
  },
  headerDark: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  courseNameDark: {
    color: '#f9fafb',
  },
  dateSelectorContainerDark: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  dateItemDark: {
    backgroundColor: '#374151',
  },
  dateDayDark: {
    color: '#9ca3af',
  },
  dateNumberDark: {
    color: '#f9fafb',
  },
  weatherTempDark: {
    color: '#f9fafb',
  },
  filtersContainerDark: {
    backgroundColor: '#1f2937',
  },
  holeSelectorDark: {
    backgroundColor: '#374151',
  },
  holeTabDark: {
    backgroundColor: 'transparent',
  },
  holeTabActiveDark: {
    backgroundColor: '#1f2937',
  },
  holeTabTextDark: {
    color: '#9ca3af',
  },
  periodTabDark: {
    backgroundColor: '#374151',
  },
  periodTabTextDark: {
    color: '#9ca3af',
  },
  teeTimeItemDark: {
    backgroundColor: '#1f2937',
  },
  timeTextDark: {
    color: '#f9fafb',
  },
  holeTextDark: {
    color: '#9ca3af',
  },
  emptyTextDark: {
    color: '#9ca3af',
  },
  alertContentDark: {
    backgroundColor: '#78350f',
    borderLeftColor: '#f59e0b',
  },
  alertTitleDark: {
    color: '#fef3c7',
  },
  alertTextDark: {
    color: '#fde68a',
  },
  alertSubtextDark: {
    color: '#fef3c7',
  },
});
