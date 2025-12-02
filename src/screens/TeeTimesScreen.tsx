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
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { format, parseISO, isPast, startOfDay } from 'date-fns';

type TeeTimeReservation =
  Database['public']['Views']['tee_time_reservations_with_slot']['Row'];

export default function TeeTimesScreen() {
  const { user } = useAuth();
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

      // Sort upcoming: tee_date -> tee_time ascending
      upcoming.sort((a, b) => {
        const dateCompare = (a.tee_date || '').localeCompare(b.tee_date || '');
        if (dateCompare !== 0) return dateCompare;
        return (a.tee_time || '').localeCompare(b.tee_time || '');
      });

      // Sort past: tee_date -> tee_time descending
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
        return '#22c55e';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
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
      <View key={reservation.reservation_id} style={styles.reservationCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.courseName}>{reservation.course_name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {reservation.booking_status?.toUpperCase() || 'UNKNOWN'}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>
              {reservation.tee_date
                ? format(parseISO(reservation.tee_date), 'EEEE, MMM d, yyyy')
                : 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>
              {reservation.tee_time ? reservation.tee_time.slice(0, 5) : 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hole:</Text>
            <Text style={styles.infoValue}>{reservation.hole || 'N/A'}</Text>
          </View>

          {reservation.total_price && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Price:</Text>
              <Text style={styles.infoValue}>${reservation.total_price.toFixed(2)}</Text>
            </View>
          )}

          {requestedItems.length > 0 && (
            <View style={styles.requestedItemsContainer}>
              <Text style={styles.requestedItemsLabel}>Requested:</Text>
              <View style={styles.tagsContainer}>
                {requestedItems.map((item) => (
                  <View key={item} style={styles.tag}>
                    <Text style={styles.tagText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {reservation.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{reservation.notes}</Text>
            </View>
          )}

          {reservation.booking_status !== 'cancelled' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelReservation(reservation)}
            >
              <Text style={styles.cancelButtonText}>Cancel Reservation</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Reservations</Text>
        {upcomingReservations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No upcoming reservations</Text>
          </View>
        ) : (
          upcomingReservations.map(renderReservation)
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Past Reservations</Text>
        {pastReservations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No past reservations</Text>
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
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  courseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
    fontWeight: 'bold',
  },
  cardBody: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  requestedItemsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  requestedItemsLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#7dd3fc',
  },
  tagText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  notesLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#4b5563',
    fontStyle: 'italic',
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
  },
  cancelButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
});
