import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface DisputeFlagBadgeProps {
  status?: 'pending' | 'approved' | 'dismissed';
  reason?: string;
  onPress?: () => void;
}

export default function DisputeFlagBadge({
  status = 'pending',
  reason,
  onPress,
}: DisputeFlagBadgeProps) {
  const { isDark } = useTheme();

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'approved':
        return '#ef4444'; // Red - approved dispute
      case 'dismissed':
        return '#6b7280'; // Gray - dismissed
      case 'pending':
      default:
        return '#f59e0b'; // Amber - pending review
    }
  };

  const getStatusLabel = (st: string) => {
    switch (st) {
      case 'approved':
        return 'Score Disputed';
      case 'dismissed':
        return 'Dispute Dismissed';
      case 'pending':
      default:
        return 'Under Review';
    }
  };

  const handlePress = () => {
    if (reason) {
      Alert.alert(
        getStatusLabel(status),
        reason,
        [{ text: 'OK', style: 'cancel' }]
      );
    }
    onPress?.();
  };

  return (
    <TouchableOpacity
      style={[
        styles.badge,
        { backgroundColor: getStatusColor(status) + '20' },
        { borderColor: getStatusColor(status) },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessible
      accessibilityLabel={`Dispute flag: ${getStatusLabel(status)}`}
      accessibilityRole="button"
    >
      <AlertTriangle
        size={14}
        color={getStatusColor(status)}
        strokeWidth={2}
      />
      <Text
        style={[
          styles.badgeText,
          { color: getStatusColor(status) },
        ]}
      >
        {getStatusLabel(status)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
