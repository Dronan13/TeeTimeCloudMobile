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

type LandingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Landing'>;
};

export default function LandingScreen({ navigation }: LandingScreenProps) {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#0a0a0a', '#0B3D2E', '#1FAA59']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>⛳</Text>
            </View>
            <Text style={styles.logoText}>TeeTimeCloud</Text>
          </View>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate('SignIn')}
            activeOpacity={0.8}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Play Smarter.{'\n'}Golf Better.</Text>
            <Text style={styles.heroSubtext}>
              Manage tee times, track performance, and connect with your club — all in one app.
            </Text>
          </View>

          {/* Feature Highlights */}
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconWrapper}>
                <Clock color="#1FAA59" width={22} height={22} strokeWidth={1.5} />
              </View>
              <Text style={styles.featureText}>Instant Tee Time Access</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconWrapper}>
                <Trophy color="#1FAA59" width={22} height={22} strokeWidth={1.5} />
              </View>
              <Text style={styles.featureText}>Live Tournaments & Scorecards</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconWrapper}>
                <CreditCard color="#1FAA59" width={22} height={22} strokeWidth={1.5} />
              </View>
              <Text style={styles.featureText}>Digital NFC Business Cards</Text>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('SignIn')}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaButtonText}>Get Started</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>New? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Decorative Bottom Wave */}
        <View style={styles.decorativeWave} />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
    color: '#F7F7F7',
    letterSpacing: -0.3,
  },
  signInButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#A8C3B0',
  },
  signInButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F7F7F7',
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
    color: '#F7F7F7',
    lineHeight: 48,
    marginBottom: 16,
    letterSpacing: -0.8,
  },
  heroSubtext: {
    fontSize: 16,
    fontWeight: '500',
    color: '#A8C3B0',
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
    color: '#F7F7F7',
    letterSpacing: 0.2,
  },
  ctaButton: {
    backgroundColor: '#1FAA59',
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
    color: '#A8C3B0',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8FFF5',
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
