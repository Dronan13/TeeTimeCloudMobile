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
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Bell, CheckCircle, Circle } from 'lucide-react-native';

type Notification = Database['public']['Tables']['notifications']['Row'];
type FilterType = 'all' | 'unread' | 'read';

const ITEMS_PER_PAGE = 20;

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
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
      : t('notifications.unknownTime');

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          isDark && styles.notificationCardDark,
          !item.read && styles.unreadCard,
          !item.read && isDark && styles.unreadCardDark,
        ]}
        onPress={() => !item.read && markAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationHeader}>
          <View style={styles.titleRow}>
            {item.read ? (
              <CheckCircle size={18} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={2} />
            ) : (
              <Circle size={18} color="#2d7a4e" strokeWidth={2} fill="#2d7a4e" />
            )}
            <Text style={[styles.notificationTitle, isDark && styles.notificationTitleDark]}>
              {item.title}
            </Text>
          </View>
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
      <Bell size={48} color={isDark ? '#868e96' : '#adb5bd'} strokeWidth={1.5} />
      <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
        {filter === 'unread'
          ? t('notifications.noUnreadNotifications')
          : filter === 'read'
            ? t('notifications.noReadNotifications')
            : t('notifications.noNotificationsYet')}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2d7a4e" />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
        <ActivityIndicator size="large" color="#2d7a4e" />
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
            {t('notifications.all')}
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
            {t('notifications.unread')}
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
            {t('notifications.read')}
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
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
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
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  unreadCard: {
    backgroundColor: '#f0f9f4',
    borderLeftWidth: 4,
    borderLeftColor: '#2d7a4e',
  },
  notificationHeader: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  notificationBody: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#adb5bd',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#adb5bd',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d6db',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#2d7a4e',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#868e96',
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
    backgroundColor: '#1a1d21',
  },
  loadingContainerDark: {
    backgroundColor: '#1a1d21',
  },
  notificationCardDark: {
    backgroundColor: '#2b3137',
    borderColor: '#343a40',
  },
  unreadCardDark: {
    backgroundColor: '#133224',
    borderLeftColor: '#2d7a4e',
  },
  notificationTitleDark: {
    color: '#f8f9fa',
  },
  notificationBodyDark: {
    color: '#adb5bd',
  },
  notificationTimeDark: {
    color: '#868e96',
  },
  emptyTextDark: {
    color: '#868e96',
  },
  filterContainerDark: {
    backgroundColor: '#2b3137',
    borderBottomColor: '#343a40',
  },
  filterTabDark: {
    backgroundColor: '#343a40',
  },
  filterTextDark: {
    color: '#adb5bd',
  },
});
