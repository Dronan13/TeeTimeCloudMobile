import React from 'react';
import { View, Text } from 'react-native';
import { Star, Flag } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { courseDetailStyles } from './styles';

interface CourseHeaderProps {
  name: string;
  rating: number | null;
  holes: number | null;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ name, rating, holes }) => {
  const { isDark } = useTheme();

  return (
    <View style={[courseDetailStyles.headerSection, isDark && courseDetailStyles.headerSectionDark]}>
      <Text style={[courseDetailStyles.courseName, isDark && courseDetailStyles.courseNameDark]}>
        {name}
      </Text>

      {/* Rating */}
      {rating !== null && rating > 0 && (
        <View style={courseDetailStyles.ratingContainer}>
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              size={16}
              color={index < Math.round(rating) ? '#f59e0b' : '#d1d6db'}
              fill={index < Math.round(rating) ? '#f59e0b' : 'transparent'}
              strokeWidth={2}
            />
          ))}
          <Text style={[courseDetailStyles.ratingText, isDark && courseDetailStyles.ratingTextDark]}>
            {rating.toFixed(1)}
          </Text>
        </View>
      )}

      {/* Holes Info */}
      {holes && (
        <View style={courseDetailStyles.holesRow}>
          <Flag size={16} color={isDark ? '#adb5bd' : '#495057'} strokeWidth={2} />
          <Text style={[courseDetailStyles.holesInfo, isDark && courseDetailStyles.holesInfoDark]}>
            {holes} Holes
          </Text>
        </View>
      )}
    </View>
  );
};
