import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { format, parseISO, isPast, startOfDay } from 'date-fns';
import { Calendar, Clock, Flag, DollarSign, X } from 'lucide-react-native';
import { TeeTimeCardSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/EmptyState';

type TeeTimeReservation =
  Database['public']['Views']['tee_time_reservations_with_slot']['Row'];

export default function TeeTimesScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingReservations, setUpcomingReservations] = useState<TeeTimeReservation[]>([]);
  const [pastReservations, setPastReservations] = useState<TeeTimeReservation[]>([]);

  useEffect(() => {
    fetchReservations();
  }, [user]);

  const fetchReservations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tee_time_reservations_with_slot')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const upcoming: TeeTimeReservation[] = [];
      const past: TeeTimeReservation[] = [];

      data?.forEach((reservation) => {
        if (reservation.tee_date) {
          const teeDate = parseISO(reservation.tee_date);
          if (isPast(startOfDay(teeDate))) {
            past.push(reservation);
          } else {
            upcoming.push(reservation);
          }
        }
      });

      upcoming.sort((a, b) => {
        const dateCompare = (a.tee_date || '').localeCompare(b.tee_date || '');
        if (dateCompare !== 0) return dateCompare;
        return (a.tee_time || '').localeCompare(b.tee_time || '');
      });

      past.sort((a, b) => {
        const dateCompare = (b.tee_date || '').localeCompare(a.tee_date || '');
        if (dateCompare !== 0) return dateCompare;
        return (b.tee_time || '').localeCompare(a.tee_time || '');
      });

      setUpcomingReservations(upcoming);
      setPastReservations(past);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  const handleCancelReservation = (reservation: TeeTimeReservation) => {
    if (!reservation.reservation_id) return;

    const reservationDate = reservation.tee_date
      ? format(parseISO(reservation.tee_date), 'EEEE, MMM d, yyyy')
      : 'Unknown date';
    const reservationTime = reservation.tee_time
      ? reservation.tee_time.slice(0, 5)
      : 'Unknown time';

    Alert.alert(
      'Cancel Reservation',
      `Are you sure you want to cancel your reservation at ${reservation.course_name} on ${reservationDate} at ${reservationTime}?`,
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
              if (!reservation.reservation_id) return;

              const { error } = await supabase
                .from('tee_time_reservations')
                .update({ booking_status: 'cancelled' })
                .eq('id', reservation.reservation_id);

              if (error) throw error;

              Alert.alert('Success', 'Your reservation has been cancelled.');
              fetchReservations();
            } catch (error) {
              console.error('Error cancelling reservation:', error);
              Alert.alert('Error', 'Failed to cancel reservation. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'confirmed':
        return '#2d7a4e';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#868e96';
    }
  };

  const renderReservation = (reservation: TeeTimeReservation) => {
    const statusColor = getStatusColor(reservation.booking_status);

    const requestedItems = [];
    if (reservation.golf_cart_required) requestedItems.push('Golf Cart');
    if (reservation.push_cart_required) requestedItems.push('Push Cart');
    if (reservation.caddy_required) requestedItems.push('Caddy');
    if (reservation.clubs_required) requestedItems.push('Clubs');
    if (reservation.assistance_required) requestedItems.push('Assistance');

    return (
      <View key={reservation.reservation_id} style={[styles.reservationCard, isDark && styles.reservationCardDark]}>
        <View style={[styles.cardHeader, isDark && styles.cardHeaderDark]}>
          <Text style={[styles.courseName, isDark && styles.courseNameDark]}>{reservation.course_name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {reservation.booking_status?.toUpperCase() || 'UNKNOWN'}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Calendar size={16} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={2} />
            <Text style={[styles.infoLabel, isDark && styles.infoLabelDark]}>Date:</Text>
            <Text style={[styles.infoValue, isDark && styles.infoValueDark]}>
              {reservation.tee_date
                ? format(parseISO(reservation.tee_date), 'EEEE, MMM d, yyyy')
                : 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Clock size={16} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={2} />
            <Text style={[styles.infoLabel, isDark && styles.infoLabelDark]}>Time:</Text>
            <Text style={[styles.infoValue, isDark && styles.infoValueDark]}>
              {reservation.tee_time ? reservation.tee_time.slice(0, 5) : 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Flag size={16} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={2} />
            <Text style={[styles.infoLabel, isDark && styles.infoLabelDark]}>Hole:</Text>
            <Text style={[styles.infoValue, isDark && styles.infoValueDark]}>{reservation.hole || 'N/A'}</Text>
          </View>

          {reservation.total_price && (
            <View style={styles.infoRow}>
              <DollarSign size={16} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={2} />
              <Text style={[styles.infoLabel, isDark && styles.infoLabelDark]}>Price:</Text>
              <Text style={[styles.infoValue, isDark && styles.infoValueDark]}>${reservation.total_price.toFixed(2)}</Text>
            </View>
          )}

          {requestedItems.length > 0 && (
            <View style={[styles.requestedItemsContainer, isDark && styles.requestedItemsContainerDark]}>
              <Text style={[styles.requestedItemsLabel, isDark && styles.requestedItemsLabelDark]}>Requested:</Text>
              <View style={styles.tagsContainer}>
                {requestedItems.map((item) => (
                  <View key={item} style={[styles.tag, isDark && styles.tagDark]}>
                    <Text style={[styles.tagText, isDark && styles.tagTextDark]}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {reservation.notes && (
            <View style={[styles.notesContainer, isDark && styles.notesContainerDark]}>
              <Text style={[styles.notesLabel, isDark && styles.notesLabelDark]}>Notes:</Text>
              <Text style={[styles.notesText, isDark && styles.notesTextDark]}>{reservation.notes}</Text>
            </View>
          )}

          {reservation.booking_status !== 'cancelled' && (
            <TouchableOpacity
              style={[styles.cancelButton, isDark && styles.cancelButtonDark]}
              onPress={() => handleCancelReservation(reservation)}
            >
              <X size={16} color="#dc2626" strokeWidth={2} />
              <Text style={styles.cancelButtonText}>Cancel Reservation</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Upcoming Reservations</Text>
        {loading ? (
          <>
            <TeeTimeCardSkeleton />
            <TeeTimeCardSkeleton />
            <TeeTimeCardSkeleton />
          </>
        ) : upcomingReservations.length === 0 ? (
          <EmptyState
            icon={<Calendar size={64} color={isDark ? '#6b7280' : '#9ca3af'} />}
            title="No upcoming reservations"
            description="You don't have any tee times booked. Browse courses and reserve your next round!"
          />
        ) : (
          upcomingReservations.map(renderReservation)
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Past Reservations</Text>
        {loading ? (
          <>
            <TeeTimeCardSkeleton />
            <TeeTimeCardSkeleton />
          </>
        ) : pastReservations.length === 0 ? (
          <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>No past reservations</Text>
          </View>
        ) : (
          pastReservations.map(renderReservation)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  courseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#868e96',
    fontWeight: '500',
    minWidth: 50,
  },
  infoValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '600',
    flex: 1,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  emptyText: {
    fontSize: 15,
    color: '#adb5bd',
  },
  requestedItemsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  requestedItemsLabel: {
    fontSize: 14,
    color: '#868e96',
    fontWeight: '500',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f0f9f4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#daf1e4',
  },
  tagText: {
    fontSize: 13,
    color: '#2d7a4e',
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  notesLabel: {
    fontSize: 14,
    color: '#868e96',
    fontWeight: '500',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  cancelButton: {
    marginTop: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  // Dark mode styles
  containerDark: {
    backgroundColor: '#1a1d21',
  },
  loadingContainerDark: {
    backgroundColor: '#1a1d21',
  },
  sectionTitleDark: {
    color: '#f8f9fa',
  },
  reservationCardDark: {
    backgroundColor: '#2b3137',
    borderColor: '#343a40',
  },
  cardHeaderDark: {
    borderBottomColor: '#343a40',
  },
  courseNameDark: {
    color: '#f8f9fa',
  },
  infoLabelDark: {
    color: '#adb5bd',
  },
  infoValueDark: {
    color: '#f8f9fa',
  },
  emptyStateDark: {
    backgroundColor: '#2b3137',
    borderColor: '#343a40',
  },
  emptyTextDark: {
    color: '#adb5bd',
  },
  requestedItemsContainerDark: {
    borderTopColor: '#343a40',
  },
  requestedItemsLabelDark: {
    color: '#adb5bd',
  },
  tagDark: {
    backgroundColor: '#1a1d21',
    borderColor: '#343a40',
  },
  tagTextDark: {
    color: '#2d7a4e',
  },
  notesContainerDark: {
    borderTopColor: '#343a40',
  },
  notesLabelDark: {
    color: '#adb5bd',
  },
  notesTextDark: {
    color: '#adb5bd',
  },
  cancelButtonDark: {
    backgroundColor: '#7f1d1d',
    borderColor: '#991b1b',
  },
});
