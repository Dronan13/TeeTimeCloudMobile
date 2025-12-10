import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Clock, Flag, Trophy } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import dayjs from 'dayjs';

interface MyTournamentCardProps {
  tournamentName: string;
  groupName: string;
  courseName?: string;
  startDateTime?: string;
  holesComplete: number;
  totalHoles?: number;
  status: 'active' | 'upcoming' | 'paused';
  onPress: () => void;
  onScorePress?: () => void;
}

export default function MyTournamentCard({
  tournamentName,
  groupName,
  courseName,
  startDateTime,
  holesComplete,
  totalHoles = 18,
  status,
  onPress,
  onScorePress,
}: MyTournamentCardProps) {
  const { isDark } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10b981'; // Green
      case 'upcoming':
        return '#f59e0b'; // Amber
      case 'paused':
        return '#6b7280'; // Gray
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'In Progress';
      case 'upcoming':
        return 'Upcoming';
      case 'paused':
        return 'Paused';
      default:
        return status;
    }
  };

  const progressPercent = (holesComplete / totalHoles) * 100;

  return (
    <TouchableOpacity
      style={[styles.card, isDark && styles.cardDark]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header with Tournament Name and Status Badge */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Trophy size={18} color="#2d7a4e" strokeWidth={2} />
          <View style={styles.titleContent}>
            <Text style={[styles.tournamentName, isDark && styles.tournamentNameDark]} numberOfLines={1}>
              {tournamentName}
            </Text>
            <Text style={[styles.groupName, isDark && styles.groupNameDark]}>
              {groupName}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
        </View>
      </View>

      {/* Course and Time Info */}
      {(courseName || startDateTime) && (
        <View style={styles.infoRow}>
          {courseName && (
            <View style={styles.infoItem}>
              <Flag size={14} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={2} />
              <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                {courseName}
              </Text>
            </View>
          )}
          {startDateTime && (
            <View style={styles.infoItem}>
              <Clock size={14} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={2} />
              <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                {dayjs(startDateTime).format('MMM D')}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, isDark && styles.progressBarDark]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%` },
            ]}
          />
        </View>
        <Text style={[styles.progressText, isDark && styles.progressTextDark]}>
          {holesComplete}/{totalHoles}
        </Text>
      </View>

      {/* Action Button */}
      {status === 'active' && (
        <TouchableOpacity
          style={styles.scoreButton}
          onPress={onScorePress}
          activeOpacity={0.8}
        >
          <Text style={styles.scoreButtonText}>Continue Scoring</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardDark: {
    backgroundColor: '#2b3137',
    borderColor: '#495057',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
  },
  titleContent: {
    flex: 1,
  },
  tournamentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1d21',
    marginBottom: 2,
  },
  tournamentNameDark: {
    color: '#ffffff',
  },
  groupName: {
    fontSize: 13,
    color: '#6b7280',
  },
  groupNameDark: {
    color: '#adb5bd',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#495057',
  },
  infoTextDark: {
    color: '#adb5bd',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarDark: {
    backgroundColor: '#495057',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2d7a4e',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    minWidth: 35,
    textAlign: 'right',
  },
  progressTextDark: {
    color: '#adb5bd',
  },
  scoreButton: {
    backgroundColor: '#2d7a4e',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  scoreButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
