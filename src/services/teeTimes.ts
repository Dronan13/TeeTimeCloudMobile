import { supabase } from '@/lib/supabaseClient';
import { TeeTimeSlot, TeeTimeSlotWithAvailability, ApiResponse } from '@/types';
import dayjs from 'dayjs';

export const teeTimesService = {
  /**
   * Fetch available tee time slots for a course on a specific date
   */
  async fetchTeeTimes(
    courseId: string,
    date: string
  ): Promise<ApiResponse<TeeTimeSlotWithAvailability[]>> {
    try {
      const startOfDay = dayjs(date).startOf('day').toISOString();
      const endOfDay = dayjs(date).endOf('day').toISOString();

      const { data, error } = await supabase
        .from('tee_time_slots')
        .select(`
          *,
          tee_time_reservations(count)
        `)
        .eq('course_id', courseId)
        .gte('tee_date', startOfDay)
        .lte('tee_date', endOfDay)
        .eq('status', 'available')
        .order('tee_time', { ascending: true });

      if (error) throw error;

      // Calculate available players for each slot
      const slotsWithAvailability = (data || []).map((slot) => {
        const reservationCount = (slot.tee_time_reservations as unknown as Array<{ count: number }>)?.[0]?.count || 0;
        const maxPlayers = slot.max_players || 4;
        const availablePlayers = Math.max(0, maxPlayers - reservationCount);

        return {
          ...slot,
          reservation_count: reservationCount,
          available_players: availablePlayers,
        } as TeeTimeSlotWithAvailability;
      });

      return { data: slotsWithAvailability, error: null };
    } catch (error) {
      console.error('Error fetching tee times:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch a single tee time slot by ID
   */
  async fetchTeeTimeSlot(slotId: string): Promise<ApiResponse<TeeTimeSlot>> {
    try {
      const { data, error } = await supabase
        .from('tee_time_slots')
        .select('*')
        .eq('id', slotId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching tee time slot:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Reserve a tee time slot
   */
  async reserveSlot(
    slotId: string,
    userId: string | undefined,
    reservationData: {
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
  ): Promise<ApiResponse<any>> {
    try {
      // First, check if slot is still available
      const { data: slot, error: slotError } = await supabase
        .from('tee_time_slots')
        .select('*, tee_time_reservations(count)')
        .eq('id', slotId)
        .single();

      if (slotError) throw slotError;

      const reservationCount = (slot as any).tee_time_reservations?.[0]?.count || 0;
      const maxPlayers = slot.max_players || 4;

      if (reservationCount >= maxPlayers) {
        throw new Error('This tee time slot is no longer available');
      }

      // Create reservation
      const { data, error } = await supabase
        .from('tee_time_reservations')
        .insert({
          slot_id: slotId,
          user_id: userId || null,
          first_name: reservationData.firstName,
          last_name: reservationData.lastName,
          email: reservationData.email,
          phone: reservationData.phone,
          holes: reservationData.holes,
          golf_cart_required: reservationData.golfCartRequired,
          caddy_required: reservationData.caddyRequired,
          clubs_required: reservationData.clubsRequired,
          push_cart_required: reservationData.pushCartRequired,
          assistance_required: reservationData.assistanceRequired,
          notes: reservationData.notes,
          booking_status: 'confirmed',
          payment_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Update slot status if fully booked
      if (reservationCount + 1 >= maxPlayers) {
        await supabase
          .from('tee_time_slots')
          .update({ status: 'booked' })
          .eq('id', slotId);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error reserving slot:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get available dates for tee times (next N days)
   */
  getAvailableDates(daysAhead = 30): string[] {
    const dates: string[] = [];
    const today = dayjs();

    for (let i = 0; i < daysAhead; i++) {
      dates.push(today.add(i, 'day').format('YYYY-MM-DD'));
    }

    return dates;
  },
};