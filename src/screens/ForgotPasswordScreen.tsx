import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { RootStackParamList } from '@/types';

type ForgotPasswordScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ForgotPassword'>;
};

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  // Theme colors - matching landing screen
  const gradientColors: [string, string, string] = isDark
    ? ['#0a0a0a', '#0B3D2E', '#1FAA59']
    : ['#E8FFF5', '#A8C3B0', '#1FAA59'];

  const textColorPrimary = isDark ? '#F7F7F7' : '#0B3D2E';
  const textColorSecondary = isDark ? '#A8C3B0' : '#0B3D2E';
  const inputBackground = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(11, 61, 46, 0.05)';
  const inputBorder = isDark ? '#A8C3B0' : '#0B3D2E';
  const placeholderColor = isDark ? '#6b7280' : '#0B3D2E';
  const iconColor = isDark ? '#1FAA59' : '#0B3D2E';
  const ctaBackground = '#1FAA59';

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(t('common.error'), t('auth.forgotPassword.errorAllFields'));
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert(t('auth.forgotPassword.successTitle'), t('auth.forgotPassword.successMessage'));
      navigation.goBack();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('common.error');
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                <ArrowLeft color={textColorPrimary} width={24} height={24} strokeWidth={1.5} />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: textColorPrimary }]}>
                  {t('auth.forgotPassword.title')}
                </Text>
                <Text style={[styles.subtitle, { color: textColorSecondary }]}>
                  {t('auth.forgotPassword.subtitle')}
                </Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: textColorPrimary }]}>
                    {t('auth.forgotPassword.emailLabel')}
                  </Text>
                  <View style={[styles.inputWrapper, { backgroundColor: inputBackground, borderColor: inputBorder }]}>
                    <Mail color={iconColor} width={20} height={20} strokeWidth={1.5} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: textColorPrimary }]}
                      placeholder={t('auth.forgotPassword.emailPlaceholder')}
                      placeholderTextColor={placeholderColor}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Send Reset Link Button */}
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: ctaBackground }, loading && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>{t('auth.forgotPassword.sendResetLink')}</Text>
                  )}
                </TouchableOpacity>

                {/* Back to Sign In Link */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('SignIn')}
                  disabled={loading}
                  style={styles.backToSignInContainer}
                >
                  <Text style={[styles.backToSignIn, { color: iconColor }]}>
                    {t('auth.forgotPassword.backToSignIn')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginLeft: -8,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(31, 170, 89, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 32,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  inputIcon: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1FAA59',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 56,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backToSignInContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backToSignIn: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
