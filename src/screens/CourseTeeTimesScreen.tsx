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
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CoursesStackParamList, Database } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { format, addDays, parseISO, isSameDay } from 'date-fns';

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
        .select('booking_window_days')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      if (data?.booking_window_days) {
        setBookingWindowDays(data.booking_window_days);
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
      Alert.alert('Error', 'Failed to load tee times. Please try again.');
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
      'Cancel Existing Reservation',
      `Are you sure you want to cancel your ${reservationDetails.status} reservation at ${reservationDetails.teeTime.slice(0, 5)} on Hole ${reservationDetails.hole}?`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('tee_time_reservations')
                .update({ booking_status: 'cancelled' })
                .eq('id', reservationDetails.reservationId);

              if (error) throw error;

              Alert.alert('Success', 'Your reservation has been cancelled. You can now book a new tee time.');

              // Refresh the data
              checkExistingReservation();
              fetchTeeTimes();
            } catch (error) {
              console.error('Error cancelling reservation:', error);
              Alert.alert('Error', 'Failed to cancel reservation. Please try again.');
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
            <Text style={styles.cancelAlertButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Animated.View
            style={[
              styles.alertContent,
              {
                transform: [{ translateX }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>You have a reservation on this date</Text>
              <Text style={styles.alertText}>
                {reservationDetails.teeTime.slice(0, 5)} - Hole {reservationDetails.hole} (
                {reservationDetails.status})
              </Text>
              <Text style={styles.alertSubtext}>
                Swipe left to cancel and re-book
              </Text>
            </View>
          </Animated.View>
        </View>
      </View>
    );
  };

  const renderDateItem = ({ item }: { item: Date }) => {
    const isSelected = isSameDay(item, selectedDate);
    return (
      <TouchableOpacity
        style={[styles.dateItem, isSelected && styles.dateItemActive]}
        onPress={() => setSelectedDate(item)}
      >
        <Text style={[styles.dateDay, isSelected && styles.dateTextActive]}>
          {format(item, 'EEE')}
        </Text>
        <Text style={[styles.dateNumber, isSelected && styles.dateTextActive]}>
          {format(item, 'd')}
        </Text>
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
      style={[styles.teeTimeItem, hasReservationOnDate && styles.teeTimeItemDisabled]}
      onPress={() => handleSlotPress(item)}
      disabled={hasReservationOnDate}
    >
      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, hasReservationOnDate && styles.textDisabled]}>
          {item.tee_time ? item.tee_time.slice(0, 5) : ''}
        </Text>
        <Text style={[styles.holeText, hasReservationOnDate && styles.textDisabled]}>
          Hole {item.hole}
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
          {item.available_players} spots left
        </Text>
        <View
          style={[styles.bookButton, hasReservationOnDate && styles.bookButtonDisabled]}
        >
          <Text style={styles.bookButtonText}>Book</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Course Name */}
      <View style={styles.header}>
        <Text style={styles.courseName}>{courseName}</Text>
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelectorContainer}>
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
      <View style={styles.filtersContainer}>
        {/* Hole Selector */}
        <View style={styles.holeSelector}>
          <TouchableOpacity
            style={[styles.holeTab, selectedHole === 1 && styles.holeTabActive]}
            onPress={() => setSelectedHole(1)}
          >
            <Text
              style={[styles.holeTabText, selectedHole === 1 && styles.holeTabTextActive]}
            >
              Hole 1
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.holeTab, selectedHole === 10 && styles.holeTabActive]}
            onPress={() => setSelectedHole(10)}
          >
            <Text
              style={[
                styles.holeTabText,
                selectedHole === 10 && styles.holeTabTextActive,
              ]}
            >
              Hole 10
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
                selectedTimePeriod === period && styles.periodTabActive,
              ]}
              onPress={() => setSelectedTimePeriod(period)}
            >
              <Text
                style={[
                  styles.periodTabText,
                  selectedTimePeriod === period && styles.periodTabTextActive,
                ]}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
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
              <Text style={styles.emptyText}>
                No tee times available for this selection.
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
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: 'transparent',
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
});
