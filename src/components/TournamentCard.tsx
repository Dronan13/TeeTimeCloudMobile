import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, MapPin, Users, Trophy } from 'lucide-react-native';
import { Tournament } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

interface TournamentCardProps {
  tournament: Tournament & { courses?: { name: string } | null };
  onPress: () => void;
  onRegisterPress?: () => void;
  registered?: boolean;
}

export default function TournamentCard({
  tournament,
  onPress,
  onRegisterPress,
  registered = false,
}: TournamentCardProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: isDark ? '#2b3137' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: registered ? '#10b981' : '#2d7a4e',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#1a1d21',
      flex: 1,
      marginRight: 8,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: registered ? '#d1fae5' : '#f0fdf4',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#065f46',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    infoText: {
      fontSize: 14,
      color: isDark ? '#d1d5db' : '#6b7280',
      flex: 1,
    },
    footer: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#495057' : '#e5e7eb',
    },
    button: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButton: {
      backgroundColor: '#2d7a4e',
    },
    secondaryButton: {
      backgroundColor: isDark ? '#495057' : '#f3f4f6',
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#ffffff',
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#1a1d21',
    },
  });

  const formatDateRange = (startAt: string, endAt: string) => {
    try {
      const start = new Date(startAt);
      const end = new Date(endAt);
      if (start.toDateString() === end.toDateString()) {
        return format(start, 'MMM d, yyyy');
      }
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    } catch {
      return 'TBA';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {tournament.name}
        </Text>
        {registered && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{t('tournament.registered')}</Text>
          </View>
        )}
      </View>

      {tournament.start_at && (
        <View style={styles.infoRow}>
          <Calendar size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
          <Text style={styles.infoText}>
            {formatDateRange(tournament.start_at, tournament.end_at || tournament.start_at)}
          </Text>
        </View>
      )}

      {tournament.courses && (
        <View style={styles.infoRow}>
          <MapPin size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
          <Text style={styles.infoText} numberOfLines={1}>
            {tournament.courses.name}
          </Text>
        </View>
      )}

      {tournament.max_players && (
        <View style={styles.infoRow}>
          <Users size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
          <Text style={styles.infoText}>
            {tournament.max_players} {t('common.players') || 'players'} max
          </Text>
        </View>
      )}

      {tournament.format && (
        <View style={styles.infoRow}>
          <Trophy size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
          <Text style={styles.infoText}>
            {t(`tournament.format.${tournament.format}`) || tournament.format}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onPress}
        >
          <Text style={styles.secondaryButtonText}>
            {t('common.viewDetails')}
          </Text>
        </TouchableOpacity>
        {!registered && onRegisterPress && (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onRegisterPress}
          >
            <Text style={styles.primaryButtonText}>
              {t('tournament.register')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
