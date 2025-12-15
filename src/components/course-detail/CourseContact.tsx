import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Phone, Mail, Globe, Clock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { courseDetailStyles } from './styles';

interface CourseContactProps {
  phone?: string | null;
  email?: string | null;
  siteUrl?: string | null;
  operatingHours?: unknown;
}

const getOperatingHoursText = (operatingHours: unknown, t: (key: string) => string): string => {
  if (!operatingHours) return t('courses.hoursNotAvailable');
  if (typeof operatingHours === 'string') return operatingHours;
  if (typeof operatingHours === 'object') {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const hoursObj = operatingHours as Record<string, string>;
    if (hoursObj[today]) {
      return `Today: ${hoursObj[today]}`;
    }
    return t('courses.seeWebsite');
  }
  return t('courses.hoursNotAvailable');
};

export const CourseContact: React.FC<CourseContactProps> = ({
  phone,
  email,
  siteUrl,
  operatingHours,
}) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const handlePhonePress = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmailPress = (emailAddress: string) => {
    Linking.openURL(`mailto:${emailAddress}`);
  };

  const handleWebsitePress = (url: string) => {
    Linking.openURL(url);
  };

  if (!phone && !email && !siteUrl) {
    return null;
  }

  return (
    <View style={[courseDetailStyles.section, isDark && courseDetailStyles.sectionDark]}>
      <Text style={[courseDetailStyles.sectionTitle, isDark && courseDetailStyles.sectionTitleDark]}>
        {t('courses.contactInformation')}
      </Text>

      {phone && (
        <TouchableOpacity
          style={[courseDetailStyles.contactItem, isDark && courseDetailStyles.contactItemDark]}
          onPress={() => handlePhonePress(phone)}
        >
          <Phone size={20} color="#2d7a4e" strokeWidth={2} />
          <Text style={[courseDetailStyles.contactText, isDark && courseDetailStyles.contactTextDark]}>
            {phone}
          </Text>
        </TouchableOpacity>
      )}

      {email && (
        <TouchableOpacity
          style={[courseDetailStyles.contactItem, isDark && courseDetailStyles.contactItemDark]}
          onPress={() => handleEmailPress(email)}
        >
          <Mail size={20} color="#2d7a4e" strokeWidth={2} />
          <Text style={[courseDetailStyles.contactText, isDark && courseDetailStyles.contactTextDark]}>
            {email}
          </Text>
        </TouchableOpacity>
      )}

      {siteUrl && (
        <TouchableOpacity
          style={[courseDetailStyles.contactItem, isDark && courseDetailStyles.contactItemDark]}
          onPress={() => handleWebsitePress(siteUrl)}
        >
          <Globe size={20} color="#2d7a4e" strokeWidth={2} />
          <Text style={[courseDetailStyles.contactText, isDark && courseDetailStyles.contactTextDark]}>
            {t('courses.visitWebsite')}
          </Text>
        </TouchableOpacity>
      )}

      {Boolean(operatingHours) && (
        <View style={[courseDetailStyles.contactItem, isDark ? courseDetailStyles.contactItemDark : null]}>
          <Clock size={20} color="#2d7a4e" strokeWidth={2} />
          <Text style={[courseDetailStyles.contactText, isDark && courseDetailStyles.contactTextDark]}>
            {getOperatingHoursText(operatingHours, t)}
          </Text>
        </View>
      )}
    </View>
  );
};
