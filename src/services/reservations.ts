import { supabase } from '@/lib/supabaseClient';
import { ReservationWithDetails, ApiResponse } from '@/types';
import dayjs from 'dayjs';

export const reservationsService = {
  /**
   * Fetch all reservations for a user
   */
  async fetchUserReservations(
    userId: string,
    filter: 'upcoming' | 'past' | 'all' = 'all'
  ): Promise<ApiResponse<ReservationWithDetails[]>> {
    try {
      let query = supabase
        .from('tee_time_reservations')
        .select(`
          *,
          slot:tee_time_slots(*),
          course:tee_time_slots(course_id, courses(*))
        `)
        .eq('user_id', userId);

      const now = dayjs().toISOString();

      if (filter === 'upcoming') {
        query = query.gte('tee_time_slots.tee_date', now);
      } else if (filter === 'past') {
        query = query.lt('tee_time_slots.tee_date', now);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the nested data structure
      const transformedData = (data || []).map((reservation: any) => ({
        ...reservation,
        slot: reservation.slot,
        course: reservation.course?.courses,
      }));

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch upcoming reservation (next tee time)
   */
  async fetchNextReservation(userId: string): Promise<ApiResponse<ReservationWithDetails>> {
    try {
      const now = dayjs().toISOString();

      const { data, error } = await supabase
        .from('tee_time_reservations')
        .select(`
          *,
          slot:tee_time_slots(*),
          course:tee_time_slots(course_id, courses(*))
        `)
        .eq('user_id', userId)
        .eq('booking_status', 'confirmed')
        .gte('tee_time_slots.tee_date', now)
        .order('tee_time_slots.tee_date', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        slot: (data as any).slot,
        course: (data as any).course?.courses,
      };

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error fetching next reservation:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Cancel a reservation
   */
  async cancelReservation(reservationId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('tee_time_reservations')
        .update({ booking_status: 'cancelled' })
        .eq('id', reservationId);

      if (error) throw error;

      return { data: null, error: null };
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get reservation by ID
   */
  async fetchReservationById(
    reservationId: string
  ): Promise<ApiResponse<ReservationWithDetails>> {
    try {
      const { data, error } = await supabase
        .from('tee_time_reservations')
        .select(`
          *,
          slot:tee_time_slots(*),
          course:tee_time_slots(course_id, courses(*))
        `)
        .eq('id', reservationId)
        .single();

      if (error) throw error;

      const transformedData = {
        ...data,
        slot: (data as any).slot,
        course: (data as any).course?.courses,
      };

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error fetching reservation:', error);
      return { data: null, error: error as Error };
    }
  },
};