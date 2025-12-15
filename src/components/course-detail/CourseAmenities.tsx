import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { courseDetailStyles } from './styles';

interface CourseAmenitiesProps {
  amenities: string[];
}

export const CourseAmenities: React.FC<CourseAmenitiesProps> = ({ amenities }) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  if (!amenities || amenities.length === 0) {
    return null;
  }

  return (
    <View style={[courseDetailStyles.section, isDark && courseDetailStyles.sectionDark]}>
      <Text style={[courseDetailStyles.sectionTitle, isDark && courseDetailStyles.sectionTitleDark]}>
        {t('courses.amenities')}
      </Text>
      <View style={courseDetailStyles.amenitiesContainer}>
        {amenities.map((amenity, index) => (
          <View
            key={index}
            style={[courseDetailStyles.amenityChip, isDark && courseDetailStyles.amenityChipDark]}
          >
            <Text style={[courseDetailStyles.amenityText, isDark && courseDetailStyles.amenityTextDark]}>
              {amenity}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
