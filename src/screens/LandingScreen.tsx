import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Clock, Trophy, CreditCard } from 'lucide-react-native';
import { RootStackParamList } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

type LandingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Landing'>;
};

export default function LandingScreen({ navigation }: LandingScreenProps) {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  // Theme colors
  const gradientColors: [string, string, string] = isDark
    ? ['#0a0a0a', '#0B3D2E', '#1FAA59']
    : ['#E8FFF5', '#A8C3B0', '#1FAA59'];

  const textPrimary = isDark ? '#F7F7F7' : '#0B3D2E';
  const textSecondary = isDark ? '#A8C3B0' : '#0B3D2E';
  const iconColor = isDark ? '#1FAA59' : '#0B3D2E';
  const buttonBorder = isDark ? '#A8C3B0' : '#0B3D2E';
  const ctaBackground = '#1FAA59';
  const footerLinkColor = isDark ? '#E8FFF5' : '#0B3D2E';

  return (
    <View style={[styles.outerContainer, { backgroundColor: gradientColors[2] }]}>
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoIcon}>⛳</Text>
              </View>
              <Text style={[styles.logoText, { color: textPrimary }]}>TeeTimeCloud</Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.contentContainer}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Text style={[styles.heroTitle, { color: textPrimary }]}>
                {t('landing.heroTitle')}
              </Text>
              <Text style={[styles.heroSubtext, { color: textSecondary }]}>
                {t('landing.heroSubtext')}
              </Text>
            </View>

            {/* Feature Highlights */}
            <View style={styles.featuresSection}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconWrapper}>
                  <Clock color={iconColor} width={22} height={22} strokeWidth={1.5} />
                </View>
                <Text style={[styles.featureText, { color: textPrimary }]}>
                  {t('landing.features.teeTimeAccess')}
                </Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconWrapper}>
                  <Trophy color={iconColor} width={22} height={22} strokeWidth={1.5} />
                </View>
                <Text style={[styles.featureText, { color: textPrimary }]}>
                  {t('landing.features.tournaments')}
                </Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconWrapper}>
                  <CreditCard color={iconColor} width={22} height={22} strokeWidth={1.5} />
                </View>
                <Text style={[styles.featureText, { color: textPrimary }]}>
                  {t('landing.features.nfcCards')}
                </Text>
              </View>
            </View>

            {/* CTA Button */}
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: ctaBackground }]}
              onPress={() => navigation.navigate('SignIn')}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaButtonText}>{t('landing.signIn')}</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: textSecondary }]}>
                {t('landing.new')}{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={[styles.footerLink, { color: footerLinkColor }]}>
                  {t('landing.createAccount')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Decorative Bottom Wave */}
          <View style={styles.decorativeWave} />
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(31, 170, 89, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 18,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  signInButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  signInButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  heroSection: {
    marginTop: 60,
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 48,
    marginBottom: 16,
    letterSpacing: -0.8,
  },
  heroSubtext: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    maxWidth: '90%',
  },
  featuresSection: {
    gap: 20,
    marginTop: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIconWrapper: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  ctaButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1FAA59',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 40,
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  decorativeWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(31, 170, 89, 0.08)',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
});
