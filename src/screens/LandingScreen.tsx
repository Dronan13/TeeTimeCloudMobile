import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Flag, MapPin, BarChart3, Moon, Sun, Globe } from 'lucide-react-native';
import { RootStackParamList } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

type LandingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Landing'>;
};

export default function LandingScreen({ navigation }: LandingScreenProps) {
  const { isDark, theme, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();

  const iconColor = '#22c55e';
  const textColorPrimary = isDark ? '#f9fafb' : '#111827';
  const textColorSecondary = isDark ? '#9ca3af' : '#6b7280';
  const backgroundColor = isDark ? '#111827' : '#fff';
  const headerBackground = isDark ? '#0f172a' : '#fff';
  const cardBackgroundColor = isDark ? '#1f2937' : '#f9fafb';
  const borderColor = isDark ? '#374151' : '#e5e7eb';
  const buttonBackground = isDark ? '#1f2937' : '#f3f4f6';

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'dark' : isDark ? 'light' : 'dark';
    await setTheme(newTheme as 'light' | 'dark' | 'system');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBackground, borderBottomColor: borderColor }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerLogo, { color: iconColor }]}>⛳</Text>
        </View>
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: buttonBackground }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            {isDark ? (
              <Sun color={iconColor} width={18} height={18} strokeWidth={2} />
            ) : (
              <Moon color={iconColor} width={18} height={18} strokeWidth={2} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: buttonBackground }]}
            onPress={toggleLanguage}
            activeOpacity={0.7}
          >
            <Globe color={iconColor} width={18} height={18} strokeWidth={2} />
            <Text style={[styles.languageText, { color: textColorPrimary }]}>
              {language === 'en' ? 'EN' : 'ES'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content - All in one view */}
      <View style={[styles.container, { backgroundColor }]}>
        {/* Hero Section - Compact */}
        <View style={styles.heroSection}>
          <Text style={[styles.brandName, { color: textColorPrimary }]}>
            TeeTime Cloud
          </Text>
          <Text style={[styles.heroTagline, { color: textColorSecondary }]}>
            {t('landing.tagline')}
          </Text>
        </View>

        {/* Features Grid - 3 columns, compact */}
        <View style={styles.featuresGrid}>
          {/* Feature 1 */}
          <View style={[styles.featureItem, { backgroundColor: cardBackgroundColor }]}>
            <View style={[styles.featureIconSmall, { backgroundColor: '#dcfce7' }]}>
              <Flag color={iconColor} width={20} height={20} strokeWidth={1.5} />
            </View>
            <Text style={[styles.featureTitle, { color: textColorPrimary }]}>
              {t('landing.features.bookTeeTimes.title')}
            </Text>
          </View>

          {/* Feature 2 */}
          <View style={[styles.featureItem, { backgroundColor: cardBackgroundColor }]}>
            <View style={[styles.featureIconSmall, { backgroundColor: '#dcfce7' }]}>
              <MapPin color={iconColor} width={20} height={20} strokeWidth={1.5} />
            </View>
            <Text style={[styles.featureTitle, { color: textColorPrimary }]}>
              {t('landing.features.findCourses.title')}
            </Text>
          </View>

          {/* Feature 3 */}
          <View style={[styles.featureItem, { backgroundColor: cardBackgroundColor }]}>
            <View style={[styles.featureIconSmall, { backgroundColor: '#dcfce7' }]}>
              <BarChart3 color={iconColor} width={20} height={20} strokeWidth={1.5} />
            </View>
            <Text style={[styles.featureTitle, { color: textColorPrimary }]}>
              {t('landing.features.manageBookings.title')}
            </Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: '#22c55e' }]}
            onPress={() => navigation.navigate('SignIn')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              {t('landing.getStarted')}
            </Text>
          </TouchableOpacity>

          <View style={styles.signInPrompt}>
            <Text style={[styles.signInPromptText, { color: textColorSecondary }]}>
              {t('landing.alreadyHaveAccount')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={[styles.signInLink, { color: '#22c55e' }]}>
                {t('landing.signIn')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    justifyContent: 'center',
  },
  headerLogo: {
    fontSize: 24,
    fontWeight: '600',
  },
  headerControls: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageText: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: -2,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroTagline: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  featureItem: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  featureIconSmall: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  ctaSection: {
    gap: 12,
    paddingBottom: 8,
  },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  signInPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  signInPromptText: {
    fontSize: 13,
  },
  signInLink: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
