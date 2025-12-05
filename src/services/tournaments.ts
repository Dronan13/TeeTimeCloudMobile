import { supabase } from '@/lib/supabaseClient';
import { ApiResponse } from '@/types';
import { Tables } from '@/types/supabase';

// Export types from database
export type Tournament = Tables<'tournaments'>;
export type TournamentGroup = Tables<'tournament_groups'>;
export type TournamentRound = Tables<'tournament_rounds'>;
export type TournamentLeaderboard = Tables<'tournament_leaderboard_dense_rank'>;

export const tournamentsService = {
  /**
   * Fetch all tournaments (upcoming/past) excluding admin-hidden ones
   */
  async fetchTournaments(
    includeHidden = false,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<Tournament[]>> {
    try {
      let query = supabase
        .from('tournaments')
        .select('*');

      if (!includeHidden) {
        query = query.eq('is_hidden', false);
      }

      const { data, error } = await query
        .order('start_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch complete tournament details with groups and user's round
   */
  async fetchTournamentDetail(tournamentId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          courses(id, name, location),
          tournament_groups(
            id,
            name,
            game_type,
            max_players,
            starting_hole,
            total_holes,
            is_closed,
            tournament_rounds(count)
          )
        `)
        .eq('id', tournamentId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching tournament detail:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch groups/flights for a tournament
   */
  async fetchTournamentGroups(tournamentId: string): Promise<ApiResponse<TournamentGroup[]>> {
    try {
      const { data, error } = await supabase
        .from('tournament_groups')
        .select(`
          *,
          tournament_rounds(count)
        `)
        .eq('tournament_id', tournamentId)
        .order('name', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching tournament groups:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch players in a tournament group/flight
   */
  async fetchTournamentGroupPlayers(groupId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('tournament_rounds')
        .select(`
          id,
          user_id,
          is_complete,
          gross_score,
          net_score,
          handicap_index,
          golfer_profiles(first_name, last_name, avatar_url)
        `)
        .eq('golf_round_group_id', groupId)
        .order('net_score', { ascending: true, nullsFirst: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching tournament group players:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch live tournament leaderboard
   */
  async fetchLeaderboard(tournamentId: string): Promise<ApiResponse<TournamentLeaderboard[]>> {
    try {
      const { data, error } = await supabase
        .from('tournament_leaderboard_dense_rank')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('place', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch user's active (incomplete) tournaments
   */
  async fetchUserActiveTournaments(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('tournament_rounds')
        .select(`
          id,
          tournament_id,
          golf_round_group_id,
          is_complete,
          start_datetime,
          hole_1,
          hole_2,
          hole_3,
          hole_4,
          hole_5,
          hole_6,
          hole_7,
          hole_8,
          hole_9,
          hole_10,
          hole_11,
          hole_12,
          hole_13,
          hole_14,
          hole_15,
          hole_16,
          hole_17,
          hole_18,
          tournament_groups(
            id,
            name,
            tournament_id,
            tournaments(
              id,
              name,
              start_at,
              status
            )
          )
        `)
        .eq('user_id', userId)
        .eq('is_complete', false)
        .order('start_datetime', { ascending: true })
        .limit(1);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching user active tournaments:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch a specific tournament round/scorecard
   */
  async fetchRound(roundId: string): Promise<ApiResponse<TournamentRound>> {
    try {
      const { data, error } = await supabase
        .from('tournament_rounds')
        .select('*')
        .eq('id', roundId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching round:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch user's round in a specific tournament
   */
  async fetchUserRound(
    tournamentId: string,
    userId: string
  ): Promise<ApiResponse<TournamentRound | null>> {
    try {
      const { data, error } = await supabase
        .from('tournament_rounds')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId)
        .single();

      if (error?.code === 'PGRST116') {
        // No row found, return null data (not an error)
        return { data: null, error: null };
      }

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user round:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Create a new tournament round (registration)
   */
  async createRound(roundData: Partial<TournamentRound>): Promise<ApiResponse<TournamentRound>> {
    try {
      const { data, error } = await supabase
        .from('tournament_rounds')
        .insert(roundData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating round:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Update tournament round (scores, completion, etc.)
   */
  async updateRound(
    roundId: string,
    updates: Partial<TournamentRound>
  ): Promise<ApiResponse<TournamentRound>> {
    try {
      const { data, error } = await supabase
        .from('tournament_rounds')
        .update(updates)
        .eq('id', roundId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating round:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Check if group is at capacity
   */
  async isGroupAtCapacity(groupId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: group, error: groupError } = await supabase
        .from('tournament_groups')
        .select('max_players')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      const { count, error: countError } = await supabase
        .from('tournament_rounds')
        .select('*', { count: 'exact', head: true })
        .eq('golf_round_group_id', groupId);

      if (countError) throw countError;

      const isAtCapacity = count !== null && count >= (group?.max_players || 0);
      return { data: isAtCapacity, error: null };
    } catch (error) {
      console.error('Error checking group capacity:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Check if user is already registered for tournament
   */
  async isUserRegistered(
    tournamentId: string,
    userId: string
  ): Promise<ApiResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('tournament_rounds')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', userId)
        .single();

      if (error?.code === 'PGRST116') {
        // No row found, not registered
        return { data: false, error: null };
      }

      if (error) throw error;
      return { data: !!data, error: null };
    } catch (error) {
      console.error('Error checking user registration:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Submit a dispute request for a tournament round
   */
  async submitDisputeRequest(
    roundId: string,
    reason: string
  ): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('tournament_disputes')
        .insert({
          round_id: roundId,
          reason,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error submitting dispute request:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Check if a round has a dispute flag
   */
  async checkDisputeFlag(roundId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data, error } = await supabase
        .from('tournament_disputes')
        .select('id')
        .eq('round_id', roundId)
        .neq('status', 'dismissed')
        .single();

      if (error?.code === 'PGRST116') {
        // No dispute found
        return { data: false, error: null };
      }

      if (error) throw error;
      return { data: !!data, error: null };
    } catch (error) {
      console.error('Error checking dispute flag:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get dispute details for a round
   */
  async getDisputeDetails(roundId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('tournament_disputes')
        .select('*')
        .eq('round_id', roundId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching dispute details:', error);
      return { data: null, error: error as Error };
    }
  },
};
