import { supabase } from '@/lib/supabaseClient';
import { Notification, ApiResponse } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

export const notificationsService = {
  /**
   * Fetch all notifications for a user
   */
  async fetchNotifications(userId: string): Promise<ApiResponse<Notification[]>> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Fetch unread notifications count
   */
  async fetchUnreadCount(userId: string): Promise<ApiResponse<number>> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      return { data: count || 0, error: null };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      return { data: null, error: null };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      return { data: null, error: null };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { data: null, error: error as Error };
    }
  },

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(
    userId: string,
    onMessage: (notification: Notification) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onMessage(payload.new as Notification);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Unsubscribe from real-time notifications
   */
  unsubscribeFromNotifications(channel: RealtimeChannel): void {
    supabase.removeChannel(channel);
  },
};