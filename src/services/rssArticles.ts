import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { ApiResponse } from '@/types';

type RSSArticle = Database['public']['Tables']['rss_articles']['Row'];

export const rssArticlesService = {
  /**
   * Fetch RSS articles with pagination, ordered by publication date descending
   */
  async fetchArticles(
    page = 1,
    limit = 20
  ): Promise<ApiResponse<RSSArticle[]>> {
    try {
      const { data, error } = await supabase
        .from('rss_articles')
        .select('*')
        .order('pub_date', { ascending: false, nullsFirst: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching RSS articles:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Get total count of RSS articles
   */
  async getArticlesCount(): Promise<ApiResponse<number>> {
    try {
      const { count, error } = await supabase
        .from('rss_articles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      return { data: count || 0, error: null };
    } catch (error) {
      console.error('Error getting articles count:', error);
      return { data: null, error: error as Error };
    }
  },
};
