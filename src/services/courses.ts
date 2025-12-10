import { supabase } from '@/lib/supabaseClient';
import {
  Course,
  CourseWithDetails,
  CourseEvent,
  ApiResponse,
  CourseWithDistance,
  Coordinates,
} from '@/types';

export const coursesService = {
  /**
   * Fetch all courses with optional search query
   */
  async fetchCourses(query?: string, page = 1, limit = 10): Promise<ApiResponse<Course[]>> {
    try {
      let queryBuilder = supabase
        .from('courses')
        .select('*')
        .eq('active', true);

      if (query) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`);
      }

      const { data, error } = await queryBuilder
        .order('name', { ascending: true })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching courses:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch a single course by ID with full details
   */
  async fetchCourseById(id: string): Promise<ApiResponse<CourseWithDetails>> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          gallery:course_gallery(*),
          tee_boxes(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: data as CourseWithDetails, error: null };
    } catch (error) {
      console.error('Error fetching course:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch events for a specific course
   */
  async fetchCourseEvents(courseId: string): Promise<ApiResponse<CourseEvent[]>> {
    try {
      const { data, error } = await supabase
        .from('course_events')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_published', true)
        .gte('end_at', new Date().toISOString())
        .order('start_at', { ascending: true });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching course events:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch gallery images for a course
   */
  async fetchCourseGallery(courseId: string) {
    try {
      const { data, error } = await supabase
        .from('course_gallery')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching course gallery:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch tee boxes for a specific course
   */
  async fetchCourseTeeBoxes(courseId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('tee_boxes')
        .select('*')
        .eq('course_id', courseId)
        .order('total_yards', { ascending: true });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching tee boxes:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Search courses by name
   */
  async searchCourses(searchTerm: string): Promise<ApiResponse<Course[]>> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('active', true)
        .ilike('name', `%${searchTerm}%`)
        .order('name', { ascending: true })
        .limit(20);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error searching courses:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch courses near a location with distance calculation
   */
  async fetchCoursesNearLocation(params: {
    latitude: number;
    longitude: number;
    maxDistanceMiles?: number;
    searchTerm?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<CourseWithDistance[]>> {
    const {
      latitude,
      longitude,
      maxDistanceMiles = 100,
      searchTerm,
      page = 1,
      limit = 20,
    } = params;

    try {
      const { data, error } = await supabase.rpc('get_courses_near_location', {
        user_lat: latitude,
        user_lon: longitude,
        max_distance_miles: maxDistanceMiles,
        search_term: searchTerm || null,
        page_number: page,
        page_limit: limit,
      });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching nearby courses:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Geocode a city name to coordinates using WeatherAPI
   */
  async geocodeCity(cityName: string): Promise<ApiResponse<Coordinates>> {
    try {
      const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
      const response = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
          cityName
        )}`
      );

      if (!response.ok) throw new Error('Geocoding failed');

      const data = await response.json();

      if (data.length === 0) {
        return { data: null, error: new Error('City not found') };
      }

      return {
        data: {
          latitude: data[0].lat,
          longitude: data[0].lon,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error geocoding city:', error);
      return { data: null, error: error as Error };
    }
  },
};