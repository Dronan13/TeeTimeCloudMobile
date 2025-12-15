import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Facebook, Instagram } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { courseDetailStyles } from './styles';

interface CourseSocialProps {
  facebook?: string | null;
  instagram?: string | null;
}

export const CourseSocial: React.FC<CourseSocialProps> = ({ facebook, instagram }) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const handleSocialPress = (url: string) => {
    Linking.openURL(url);
  };

  if (!facebook && !instagram) {
    return null;
  }

  return (
    <View style={[courseDetailStyles.section, isDark && courseDetailStyles.sectionDark]}>
      <Text style={[courseDetailStyles.sectionTitle, isDark && courseDetailStyles.sectionTitleDark]}>
        {t('courses.followUs')}
      </Text>
      <View style={courseDetailStyles.socialContainer}>
        {facebook && (
          <TouchableOpacity
            style={[
              courseDetailStyles.socialButton,
              isDark && courseDetailStyles.socialButtonDark,
            ]}
            onPress={() => handleSocialPress(facebook)}
          >
            <Facebook size={18} color={isDark ? '#f8f9fa' : '#212529'} strokeWidth={2} />
            <Text
              style={[
                courseDetailStyles.socialButtonText,
                isDark && courseDetailStyles.socialButtonTextDark,
              ]}
            >
              {t('courses.facebook')}
            </Text>
          </TouchableOpacity>
        )}
        {instagram && (
          <TouchableOpacity
            style={[
              courseDetailStyles.socialButton,
              isDark && courseDetailStyles.socialButtonDark,
            ]}
            onPress={() => handleSocialPress(instagram)}
          >
            <Instagram size={18} color={isDark ? '#f8f9fa' : '#212529'} strokeWidth={2} />
            <Text
              style={[
                courseDetailStyles.socialButtonText,
                isDark && courseDetailStyles.socialButtonTextDark,
              ]}
            >
              {t('courses.instagram')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
