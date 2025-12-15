import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Flag, Play } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { courseDetailStyles } from './styles';

interface CourseActionButtonsProps {
  onReserveTeeTime: () => void;
  onStartRound: () => void;
}

export const CourseActionButtons: React.FC<CourseActionButtonsProps> = ({
  onReserveTeeTime,
  onStartRound,
}) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[courseDetailStyles.reserveSection, isDark && courseDetailStyles.reserveSectionDark]}>
      <TouchableOpacity
        style={courseDetailStyles.reserveButton}
        onPress={onReserveTeeTime}
        activeOpacity={0.8}
      >
        <Flag size={20} color="#fff" strokeWidth={2} />
        <Text style={courseDetailStyles.reserveButtonText}>{t('courses.reserveTeeTime')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          courseDetailStyles.startRoundButton,
          isDark && courseDetailStyles.startRoundButtonDark,
        ]}
        onPress={onStartRound}
        activeOpacity={0.8}
      >
        <Play size={20} color="#2d7a4e" strokeWidth={2} fill="#2d7a4e" />
        <Text
          style={[
            courseDetailStyles.startRoundButtonText,
            isDark && courseDetailStyles.startRoundButtonTextDark,
          ]}
        >
          {t('rounds.startRound')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
