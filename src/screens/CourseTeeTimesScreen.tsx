import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CoursesStackParamList, Database } from '@/types';
import { supabase } from '@/lib/supabaseClient';
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

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('all');
  const [selectedHole, setSelectedHole] = useState<number>(1);
  const [teeTimes, setTeeTimes] = useState<TeeTimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [bookingWindowDays, setBookingWindowDays] = useState<number>(14); // Default to 14

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  useEffect(() => {
    fetchTeeTimes();
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

  const handleSlotPress = (slot: TeeTimeSlot) => {
    if (!slot.id) return;
    navigation.navigate('ReservationScreen', {
      slotId: slot.id,
      courseId: courseId,
    });
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
    <TouchableOpacity style={styles.teeTimeItem} onPress={() => handleSlotPress(item)}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {item.tee_time ? item.tee_time.slice(0, 5) : ''}
        </Text>
        <Text style={styles.holeText}>Hole {item.hole}</Text>
      </View>
      <View style={styles.availabilityContainer}>
        <Text
          style={[
            styles.spotsText,
            { color: getSpotsColor(item.available_players || 0) },
          ]}
        >
          {item.available_players} spots left
        </Text>
        <View style={styles.bookButton}>
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
});
