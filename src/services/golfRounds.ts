import { supabase } from '@/lib/supabaseClient';
import { ApiResponse, PaginatedResponse } from '@/types';
import { Tables } from '@/types/supabase';

// Export types from database
export type GolfRound = Tables<'golf_rounds'>;
export type GolfRoundHole = Tables<'golf_round_holes'>;
export type GolfRoundDetails = any; // From golf_round_details view
export type GolfRoundHolesDetails = any; // From golf_round_holes_details view

/**
 * Personal golf round statistics calculated from hole data
 */
export interface RoundStatistics {
  grossScore: number;
  front9Score: number;
  back9Score: number;
  totalPar: number;
  scoreToPar: number;
  holesPlayed: number;
  girCount: number;
  girPercentage: number;
  totalPutts: number;
  fairwaysHit: number;
  fairwaysOpportunity: number;
  fairwayPercentage: number;
  sandSaves: number;
  sandSaveOpportunity: number;
  sandSavePercentage: number;
  differential: number;
}

export const golfRoundsService = {
  /**
   * Create a new personal golf round (empty, no holes)
   */
  async createGolfRound(
    userId: string,
    courseId: string,
    teeBoxId: string,
    roundDate: string
  ): Promise<ApiResponse<GolfRound>> {
    try {
      const { data, error } = await supabase
        .from('golf_rounds')
        .insert({
          user_id: userId,
          course_id: courseId,
          tee_box_id: teeBoxId,
          round_date: roundDate,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating golf round:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch paginated personal golf rounds for a user
   */
  async fetchGolfRounds(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<PaginatedResponse<GolfRoundDetails>>> {
    try {
      // First get count
      const { count, error: countError } = await supabase
        .from('golf_round_details')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) throw countError;

      // Then get paginated data
      const { data, error } = await supabase
        .from('golf_round_details')
        .select('*')
        .eq('user_id', userId)
        .order('round_date', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      const total = count || 0;
      return {
        data: {
          data: data || [],
          total,
          page,
          limit,
          hasMore: page * limit < total,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error fetching golf rounds:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch a single golf round with all its holes (only played holes)
   */
  async fetchGolfRound(roundId: string): Promise<ApiResponse<GolfRoundDetails>> {
    try {
      const { data, error } = await supabase
        .from('golf_round_details')
        .select('*')
        .eq('id', roundId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching golf round:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch all holes for a specific round
   */
  async fetchGolfRoundHoles(roundId: string): Promise<ApiResponse<GolfRoundHolesDetails[]>> {
    try {
      const { data, error } = await supabase
        .from('golf_round_holes_details')
        .select('*')
        .eq('round_id', roundId)
        .order('hole_number', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching golf round holes:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch recent rounds for a user (last 3-5 for home screen)
   */
  async fetchRecentGolfRounds(userId: string, limit = 5): Promise<ApiResponse<GolfRoundDetails[]>> {
    try {
      const { data, error } = await supabase
        .from('golf_round_details')
        .select('*')
        .eq('user_id', userId)
        .not('total_score', 'is', null) // Only rounds with scores (completed)
        .order('round_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching recent golf rounds:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Update round-level stats and completion status
   */
  async updateGolfRound(
    roundId: string,
    updates: Partial<GolfRound>
  ): Promise<ApiResponse<GolfRound>> {
    try {
      const { data, error } = await supabase
        .from('golf_rounds')
        .update(updates)
        .eq('id', roundId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating golf round:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Insert or update a single hole in a round
   */
  async upsertGolfRoundHole(
    roundId: string,
    holeNumber: number,
    holeData: Partial<GolfRoundHole>
  ): Promise<ApiResponse<GolfRoundHole>> {
    try {
      const { data, error } = await supabase
        .from('golf_round_holes')
        .upsert(
          {
            round_id: roundId,
            hole_number: holeNumber,
            ...holeData,
          },
          { onConflict: 'round_id,hole_number' }
        )
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error upserting golf round hole:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Delete a single hole from a round
   */
  async deleteGolfRoundHole(roundId: string, holeNumber: number): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('golf_round_holes')
        .delete()
        .eq('round_id', roundId)
        .eq('hole_number', holeNumber);

      if (error) throw error;
      return { data: null, error: null };
    } catch (error) {
      console.error('Error deleting golf round hole:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Delete unplayed holes (score is null) from a round before completion
   */
  async cleanupUnplayedHoles(roundId: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('golf_round_holes')
        .delete()
        .eq('round_id', roundId)
        .is('strokes', null);

      if (error) throw error;
      return { data: null, error: null };
    } catch (error) {
      console.error('Error cleaning up unplayed holes:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Complete a golf round - calculate stats and cleanup unplayed holes
   */
  async completeGolfRound(
    roundId: string,
    statistics: RoundStatistics
  ): Promise<ApiResponse<GolfRound>> {
    try {
      // First cleanup unplayed holes
      await this.cleanupUnplayedHoles(roundId);

      // Then update round with stats
      const { data, error } = await supabase
        .from('golf_rounds')
        .update({
          total_score: statistics.grossScore,
          front_score: statistics.front9Score,
          back_score: statistics.back9Score,
          score_to_par: statistics.scoreToPar,
          total_putts: statistics.totalPutts,
          fairways_hit: statistics.fairwaysHit,
          greens_in_regulation: statistics.girCount,
          differential: statistics.differential,
        })
        .eq('id', roundId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error completing golf round:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Delete an entire golf round and all its holes
   */
  async deleteGolfRound(roundId: string): Promise<ApiResponse<null>> {
    try {
      // Delete holes first (cascade may handle this, but explicit is safer)
      await supabase.from('golf_round_holes').delete().eq('round_id', roundId);

      // Then delete the round
      const { error } = await supabase.from('golf_rounds').delete().eq('id', roundId);

      if (error) throw error;
      return { data: null, error: null };
    } catch (error) {
      console.error('Error deleting golf round:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Calculate round statistics from hole array
   */
  calculateRoundStatistics(holes: any[]): RoundStatistics {
    // Filter only played holes (with strokes)
    const playedHoles = holes.filter((h) => h.strokes !== null && h.strokes !== undefined);

    if (playedHoles.length === 0) {
      return {
        grossScore: 0,
        front9Score: 0,
        back9Score: 0,
        totalPar: 0,
        scoreToPar: 0,
        holesPlayed: 0,
        girCount: 0,
        girPercentage: 0,
        totalPutts: 0,
        fairwaysHit: 0,
        fairwaysOpportunity: 0,
        fairwayPercentage: 0,
        sandSaves: 0,
        sandSaveOpportunity: 0,
        sandSavePercentage: 0,
        differential: 0,
      };
    }

    // Calculate basic scores
    const grossScore = playedHoles.reduce((sum, h) => sum + (h.strokes || 0), 0);
    const totalPar = playedHoles.reduce((sum, h) => sum + (h.par || 0), 0);
    const scoreToPar = grossScore - totalPar;

    // Split front and back 9
    const front9Holes = playedHoles.filter((h) => h.hole_number <= 9);
    const back9Holes = playedHoles.filter((h) => h.hole_number > 9);

    const front9Score = front9Holes.reduce((sum, h) => sum + (h.strokes || 0), 0);
    const back9Score = back9Holes.reduce((sum, h) => sum + (h.strokes || 0), 0);

    // Count GIRs
    const girCount = playedHoles.filter((h) => {
      const strokes = h.strokes || 0;
      const par = h.par || 0;
      return strokes <= par + 2;
    }).length;

    const girPercentage = playedHoles.length > 0 ? (girCount / playedHoles.length) * 100 : 0;

    // Count putts
    const totalPutts = playedHoles.reduce((sum, h) => sum + (h.putts || 0), 0);

    // Count fairways (par 4s and 5s only)
    const fairwayOpportunities = playedHoles.filter((h) => h.par >= 4);
    const fairwaysHit = fairwayOpportunities.filter((h) => h.fairway_hit === true).length;
    const fairwayPercentage =
      fairwayOpportunities.length > 0 ? (fairwaysHit / fairwayOpportunities.length) * 100 : 0;

    // Count sand saves (holes where player was in sand and scored par or less)
    const sandOpportunities = playedHoles.filter((h) => h.sand_save !== null);
    const sandSaves = sandOpportunities.filter((h) => h.sand_save === true).length;
    const sandSavePercentage =
      sandOpportunities.length > 0 ? (sandSaves / sandOpportunities.length) * 100 : 0;

    // Calculate differential (simplified version - in production would use course rating/slope)
    // Formula: (score - course_rating) * 113 / slope_rating
    // For now, we'll calculate a basic version
    const differential = scoreToPar;

    return {
      grossScore,
      front9Score,
      back9Score,
      totalPar,
      scoreToPar,
      holesPlayed: playedHoles.length,
      girCount,
      girPercentage: Math.round(girPercentage * 100) / 100,
      totalPutts,
      fairwaysHit,
      fairwaysOpportunity: fairwayOpportunities.length,
      fairwayPercentage: Math.round(fairwayPercentage * 100) / 100,
      sandSaves,
      sandSaveOpportunity: sandOpportunities.length,
      sandSavePercentage: Math.round(sandSavePercentage * 100) / 100,
      differential,
    };
  },
};
