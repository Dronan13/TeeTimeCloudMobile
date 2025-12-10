import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Database } from '@/types/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExternalLink, Calendar, User } from 'lucide-react-native';

type RSSArticle = Database['public']['Tables']['rss_articles']['Row'];

interface RSSArticleCardProps {
  article: RSSArticle;
}

export default function RSSArticleCard({ article }: RSSArticleCardProps) {
  const { isDark } = useTheme();
  const { locale } = useLanguage();

  const handleOpenLink = async () => {
    try {
      const canOpen = await Linking.canOpenURL(article.link);
      if (canOpen) {
        await Linking.openURL(article.link);
      }
    } catch (error) {
      console.error('Error opening article link:', error);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <TouchableOpacity
      style={[styles.card, isDark && styles.cardDark]}
      onPress={handleOpenLink}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        {article.title && (
          <Text style={[styles.title, isDark && styles.titleDark]} numberOfLines={2}>
            {article.title}
          </Text>
        )}
        {article.source && (
          <View style={[styles.sourceBadge, isDark && styles.sourceBadgeDark]}>
            <Text style={[styles.sourceText, isDark && styles.sourceTextDark]}>
              {article.source}
            </Text>
          </View>
        )}
      </View>

      {article.description && (
        <Text style={[styles.description, isDark && styles.descriptionDark]} numberOfLines={3}>
          {article.description}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.metaContainer}>
          {article.pub_date && (
            <View style={styles.metaItem}>
              <Calendar size={14} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={2} />
              <Text style={[styles.metaText, isDark && styles.metaTextDark]}>
                {formatDate(article.pub_date)}
              </Text>
            </View>
          )}
          {article.author && (
            <View style={styles.metaItem}>
              <User size={14} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={2} />
              <Text style={[styles.metaText, isDark && styles.metaTextDark]} numberOfLines={1}>
                {article.author}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.linkIconContainer}>
          <ExternalLink size={20} color="#2d7a4e" strokeWidth={2} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardDark: {
    backgroundColor: '#2b3137',
    borderColor: '#343a40',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    lineHeight: 24,
  },
  titleDark: {
    color: '#f8f9fa',
  },
  sourceBadge: {
    backgroundColor: '#e7f5ee',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sourceBadgeDark: {
    backgroundColor: '#1f3d2f',
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d7a4e',
  },
  sourceTextDark: {
    color: '#4ade80',
  },
  description: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 12,
  },
  descriptionDark: {
    color: '#ced4da',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  metaContainer: {
    flex: 1,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#868e96',
    flex: 1,
  },
  metaTextDark: {
    color: '#adb5bd',
  },
  linkIconContainer: {
    padding: 4,
  },
});
