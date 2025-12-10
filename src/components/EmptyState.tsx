import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const { isDark } = useTheme();

  return (
    <View className="flex-1 justify-center items-center p-8">
      <View className="mb-4">
        {icon}
      </View>
      <Text
        className={`text-xl font-semibold mt-4 text-center ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        {title}
      </Text>
      <Text
        className={`mt-2 text-center ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {description}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          className="bg-primary rounded-lg px-6 py-3 mt-6"
          onPress={onAction}
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
        >
          <Text className="text-white font-semibold">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
