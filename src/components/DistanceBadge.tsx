import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Navigation } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDistance } from '@/utils/location';

interface DistanceBadgeProps {
  distanceMiles: number;
}

export function DistanceBadge({ distanceMiles }: DistanceBadgeProps) {
  const { isDark } = useTheme();

  return (
    <View style={[styles.badge, isDark && styles.badgeDark]}>
      <Navigation size={12} color="#2d7a4e" strokeWidth={2} />
      <Text style={[styles.text, isDark && styles.textDark]}>
        {formatDistance(distanceMiles)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeDark: {
    backgroundColor: '#1e4620',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d7a4e',
  },
  textDark: {
    color: '#90ee90',
  },
});
