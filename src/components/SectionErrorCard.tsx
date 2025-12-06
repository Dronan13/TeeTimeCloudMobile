import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AlertCircle, RotateCcw } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SectionErrorCardProps {
  errorMessage: string;
  onRetry: () => void;
}

export const SectionErrorCard: React.FC<SectionErrorCardProps> = ({
  errorMessage,
  onRetry,
}) => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  return (
    <View
      className={`rounded-lg p-4 mb-4 border ${
        isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
      }`}
    >
      <View className="flex-row items-center mb-2">
        <AlertCircle size={20} color={isDark ? '#fca5a5' : '#dc2626'} />
        <Text
          className={`ml-2 font-semibold ${
            isDark ? 'text-red-300' : 'text-red-700'
          }`}
        >
          {t('errors.title')}
        </Text>
      </View>
      <Text
        className={`mb-3 ${isDark ? 'text-red-200' : 'text-red-600'}`}
      >
        {errorMessage}
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        className={`flex-row items-center justify-center py-2 px-4 rounded-lg ${
          isDark ? 'bg-red-800' : 'bg-red-100'
        }`}
        accessibilityLabel={t('common.retry')}
        accessibilityRole="button"
      >
        <RotateCcw size={16} color={isDark ? '#fca5a5' : '#dc2626'} />
        <Text
          className={`ml-2 font-medium ${
            isDark ? 'text-red-300' : 'text-red-700'
          }`}
        >
          {t('common.retry')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
