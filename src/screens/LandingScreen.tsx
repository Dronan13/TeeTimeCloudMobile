import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

type LandingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Landing'>;
};

export default function LandingScreen({ navigation }: LandingScreenProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.content, isDark && styles.contentDark]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>{t('landing.logo')}</Text>
          <Text style={[styles.tagline, isDark && styles.taglineDark]}>{t('landing.tagline')}</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🏌️</Text>
            <Text style={[styles.featureTitle, isDark && styles.featureTitleDark]}>{t('landing.features.bookTeeTimes.title')}</Text>
            <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
              {t('landing.features.bookTeeTimes.description')}
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={[styles.featureTitle, isDark && styles.featureTitleDark]}>{t('landing.features.findCourses.title')}</Text>
            <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
              {t('landing.features.findCourses.description')}
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text style={[styles.featureTitle, isDark && styles.featureTitleDark]}>{t('landing.features.manageBookings.title')}</Text>
            <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
              {t('landing.features.manageBookings.description')}
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.buttonText}>{t('landing.getStarted')}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
            {t('landing.alreadyHaveAccount')}{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('SignIn')}>
              {t('landing.signIn')}
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#6b7280',
  },
  features: {
    marginBottom: 48,
  },
  feature: {
    alignItems: 'center',
    marginBottom: 32,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  link: {
    color: '#22c55e',
    fontWeight: '600',
  },
  // Dark mode styles
  containerDark: {
    backgroundColor: '#111827',
  },
  contentDark: {
    backgroundColor: '#111827',
  },
  taglineDark: {
    color: '#9ca3af',
  },
  featureTitleDark: {
    color: '#f9fafb',
  },
  featureTextDark: {
    color: '#9ca3af',
  },
  footerTextDark: {
    color: '#9ca3af',
  },
});
