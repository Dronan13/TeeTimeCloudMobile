import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Medal } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface LeaderboardCardProps {
  place: number;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  groupName: string;
  score: number;
  vsPar: number;
  holesComplete: number;
  isCurrentUser?: boolean;
  onPress?: () => void;
}

export default function LeaderboardCard({
  place,
  firstName,
  lastName,
  avatarUrl,
  groupName,
  score,
  vsPar,
  holesComplete,
  isCurrentUser = false,
  onPress,
}: LeaderboardCardProps) {
  const { isDark } = useTheme();

  const getMedalColor = (place: number) => {
    switch (place) {
      case 1:
        return '#fbbf24'; // Gold
      case 2:
        return '#d1d5db'; // Silver
      case 3:
        return '#d97706'; // Bronze
      default:
        return '#6b7280'; // Gray
    }
  };

  const getScoreColor = (vsPar: number) => {
    if (vsPar < 0) return '#10b981'; // Under par (green)
    if (vsPar > 0) return '#ef4444'; // Over par (red)
    return '#6b7280'; // Even (gray)
  };

  const scoreDisplay = vsPar > 0 ? `+${vsPar}` : `${vsPar}`;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isDark && styles.cardDark,
        isCurrentUser && styles.cardHighlight,
        isDark && isCurrentUser && styles.cardHighlightDark,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Placement */}
      <View style={styles.placementContainer}>
        {place <= 3 ? (
          <Medal size={24} color={getMedalColor(place)} />
        ) : (
          <Text style={[styles.placementText, isDark && styles.placementTextDark]}>
            {place}
          </Text>
        )}
      </View>

      {/* Player Info */}
      <View style={styles.playerInfo}>
        <View style={styles.playerHeader}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, isDark && styles.avatarPlaceholderDark]}>
              <Text style={[styles.avatarText, isDark && styles.avatarTextDark]}>
                {firstName?.charAt(0)}{lastName?.charAt(0)}
              </Text>
            </View>
          )}

          <View style={styles.playerDetails}>
            <Text
              style={[
                styles.playerName,
                isDark && styles.playerNameDark,
                isCurrentUser && styles.playerNameCurrent,
              ]}
              numberOfLines={1}
            >
              {firstName} {lastName}
              {isCurrentUser && ' (You)'}
            </Text>
            <Text style={[styles.groupName, isDark && styles.groupNameDark]}>
              {groupName}
            </Text>
          </View>
        </View>

        {/* Holes progress */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              isDark && styles.progressBarDark,
            ]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${(holesComplete / 18) * 100}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressText, isDark && styles.progressTextDark]}>
            {holesComplete}/18
          </Text>
        </View>
      </View>

      {/* Score */}
      <View style={styles.scoreContainer}>
        <Text style={[styles.scoreLabel, isDark && styles.scoreLabelDark]}>
          Score
        </Text>
        <Text
          style={[
            styles.scoreValue,
            { color: getScoreColor(vsPar) },
          ]}
        >
          {score}
        </Text>
        <Text
          style={[
            styles.scoreVsPar,
            { color: getScoreColor(vsPar) },
          ]}
        >
          {scoreDisplay}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  cardDark: {
    backgroundColor: '#2b3137',
    borderColor: '#495057',
  },
  cardHighlight: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
    borderWidth: 2,
  },
  cardHighlightDark: {
    backgroundColor: '#1a3a1a',
    borderColor: '#22c55e',
    borderWidth: 2,
  },
  placementContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  placementText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1d21',
  },
  placementTextDark: {
    color: '#ffffff',
  },
  playerInfo: {
    flex: 1,
    gap: 8,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderDark: {
    backgroundColor: '#495057',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  avatarTextDark: {
    color: '#d1d5db',
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1d21',
    marginBottom: 2,
  },
  playerNameDark: {
    color: '#ffffff',
  },
  playerNameCurrent: {
    color: '#2d7a4e',
  },
  groupName: {
    fontSize: 12,
    color: '#6b7280',
  },
  groupNameDark: {
    color: '#d1d5db',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
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
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    minWidth: 35,
    textAlign: 'right',
  },
  progressTextDark: {
    color: '#d1d5db',
  },
  scoreContainer: {
    alignItems: 'flex-end',
    minWidth: 50,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 2,
  },
  scoreLabelDark: {
    color: '#d1d5db',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  scoreVsPar: {
    fontSize: 12,
    fontWeight: '600',
  },
});
