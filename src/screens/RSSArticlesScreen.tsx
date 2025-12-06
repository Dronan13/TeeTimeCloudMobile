import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Database } from '@/types/supabase';
import { rssArticlesService } from '@/services/rssArticles';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import RSSArticleCard from '@/components/RSSArticleCard';
import FloatingActionButton from '@/components/FloatingActionButton';
import { Newspaper } from 'lucide-react-native';

type RSSArticle = Database['public']['Tables']['rss_articles']['Row'];

const ITEMS_PER_PAGE = 20;

export default function RSSArticlesScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [articles, setArticles] = useState<RSSArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchArticles = useCallback(
    async (page: number, isRefresh = false) => {
      if (page === 1) {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
      } else {
        setLoadingMore(true);
      }

      try {
        setError(null);
        const { data, error: fetchError } = await rssArticlesService.fetchArticles(
          page,
          ITEMS_PER_PAGE
        );

        if (fetchError) {
          setError(
            t('rssArticles.error') || 'Failed to load articles. Please try again.'
          );
          console.error('Error fetching RSS articles:', fetchError);
        } else if (data) {
          if (page === 1) {
            setArticles(data);
          } else {
            setArticles((prev) => [...prev, ...data]);
          }

          // Check if we have more items to load
          setHasMore(data.length === ITEMS_PER_PAGE);
        }
      } catch (err) {
        setError(t('rssArticles.unexpectedError') || 'An unexpected error occurred.');
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [t]
  );

  useEffect(() => {
    fetchArticles(1);
  }, [fetchArticles]);

  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchArticles(1, true);
  }, [fetchArticles]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && !loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchArticles(nextPage);
    }
  }, [loadingMore, loading, hasMore, currentPage, fetchArticles]);

  const renderArticleItem = ({ item }: { item: RSSArticle }) => (
    <RSSArticleCard article={item} />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2d7a4e" />
        <Text style={[styles.footerLoaderText, isDark && styles.footerLoaderTextDark]}>
          {t('rssArticles.loadingMore') || 'Loading more articles...'}
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
      <Newspaper size={48} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={1.5} />
      <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
        {t('rssArticles.noArticles') || 'No articles available'}
      </Text>
      <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
        {t('rssArticles.checkBackLater') || 'Check back later for new golf articles'}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, isDark && styles.centerContainerDark]}>
        <ActivityIndicator size="large" color="#2d7a4e" />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
          {t('rssArticles.loading') || 'Loading articles...'}
        </Text>
      </View>
    );
  }

  if (error && !refreshing && articles.length === 0) {
    return (
      <View style={[styles.centerContainer, isDark && styles.centerContainerDark]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, isDark && styles.retryButtonDark]}
          onPress={() => {
            setCurrentPage(1);
            fetchArticles(1);
          }}
        >
          <Text style={styles.retryButtonText}>
            {t('rssArticles.retry') || 'Retry'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <FlatList
        data={articles}
        renderItem={renderArticleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          articles.length === 0 ? styles.emptyListContainer : styles.listContainer,
          { paddingBottom: 80 },
        ]}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2d7a4e"
            colors={['#2d7a4e']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />

      <FloatingActionButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#1a1d21',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  centerContainerDark: {
    backgroundColor: '#1a1d21',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#868e96',
  },
  loadingTextDark: {
    color: '#adb5bd',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 15,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  errorTextDark: {
    color: '#ef4444',
  },
  retryButton: {
    backgroundColor: '#2d7a4e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonDark: {
    backgroundColor: '#2d7a4e',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 14,
    color: '#868e96',
  },
  footerLoaderTextDark: {
    color: '#adb5bd',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyStateDark: {
    backgroundColor: '#1a1d21',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
  },
  emptyStateTitleDark: {
    color: '#f8f9fa',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#868e96',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyStateTextDark: {
    color: '#adb5bd',
  },
});
