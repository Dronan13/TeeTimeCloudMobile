import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { formatDistanceToNow, parseISO } from 'date-fns';

type Notification = Database['public']['Tables']['notifications']['Row'];
type FilterType = 'all' | 'unread' | 'read';

const ITEMS_PER_PAGE = 20;

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>('unread');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchNotifications(true);
  }, [user, filter]);

  const filteredNotifications = useMemo(() => {
    return notifications;
  }, [notifications]);

  const fetchNotifications = async (reset: boolean = false) => {
    if (!user) return;
    if (!reset && (!hasMore || loadingMore)) return;

    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const from = reset ? 0 : notifications.length;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      // Apply filter at database level
      if (filter === 'unread') {
        query = query.eq('read', false);
      } else if (filter === 'read') {
        query = query.eq('read', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (reset) {
        setNotifications(data || []);
      } else {
        setNotifications((prev) => [...prev, ...(data || [])]);
      }

      setHasMore((data?.length || 0) === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    fetchNotifications(true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchNotifications(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const timeAgo = item.created_at
      ? formatDistanceToNow(parseISO(item.created_at), { addSuffix: true })
      : 'Unknown time';

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          isDark && styles.notificationCardDark,
          !item.read && styles.unreadCard,
          !item.read && isDark && styles.unreadCardDark,
        ]}
        onPress={() => !item.read && markAsRead(item.id)}
      >
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, isDark && styles.notificationTitleDark]}>
            {item.title}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>

        {item.body && (
          <Text style={[styles.notificationBody, isDark && styles.notificationBodyDark]}>
            {item.body}
          </Text>
        )}

        <Text style={[styles.notificationTime, isDark && styles.notificationTimeDark]}>
          {timeAgo}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
        {filter === 'unread'
          ? 'No unread notifications'
          : filter === 'read'
            ? 'No read notifications'
            : 'No notifications yet'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#22c55e" />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.filterContainer, isDark && styles.filterContainerDark]}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            isDark && styles.filterTabDark,
            filter === 'all' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              isDark && styles.filterTextDark,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            isDark && styles.filterTabDark,
            filter === 'unread' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text
            style={[
              styles.filterText,
              isDark && styles.filterTextDark,
              filter === 'unread' && styles.filterTextActive,
            ]}
          >
            Unread
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            isDark && styles.filterTabDark,
            filter === 'read' && styles.filterTabActive,
          ]}
          onPress={() => setFilter('read')}
        >
          <Text
            style={[
              styles.filterText,
              isDark && styles.filterTextDark,
              filter === 'read' && styles.filterTextActive,
            ]}
          >
            Read
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />
    </View>
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
  listContent: {
    padding: 16,
  },
  notificationCard: {
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
  unreadCard: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#22c55e',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  // Dark mode styles
  containerDark: {
    backgroundColor: '#111827',
  },
  loadingContainerDark: {
    backgroundColor: '#111827',
  },
  notificationCardDark: {
    backgroundColor: '#1f2937',
  },
  unreadCardDark: {
    backgroundColor: '#1f2937',
    borderLeftColor: '#22c55e',
  },
  notificationTitleDark: {
    color: '#f9fafb',
  },
  notificationBodyDark: {
    color: '#9ca3af',
  },
  notificationTimeDark: {
    color: '#9ca3af',
  },
  emptyTextDark: {
    color: '#9ca3af',
  },
  filterContainerDark: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  filterTabDark: {
    backgroundColor: '#374151',
  },
  filterTextDark: {
    color: '#9ca3af',
  },
});
