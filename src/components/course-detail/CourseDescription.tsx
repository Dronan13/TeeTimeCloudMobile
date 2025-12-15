import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { courseDetailStyles } from './styles';

interface CourseDescriptionProps {
  description: string;
}

export const CourseDescription: React.FC<CourseDescriptionProps> = ({ description }) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[courseDetailStyles.section, isDark && courseDetailStyles.sectionDark]}>
      <Text style={[courseDetailStyles.sectionTitle, isDark && courseDetailStyles.sectionTitleDark]}>
        {t('courses.about')}
      </Text>
      <Text style={[courseDetailStyles.description, isDark && courseDetailStyles.descriptionDark]}>
        {description}
      </Text>
    </View>
  );
};
