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
import { Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { RootStackParamList } from '@/types';

type SignInScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'SignIn'>;
};

export default function SignInScreen({ navigation }: SignInScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
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

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.signIn.errorAllFields'));
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert(t('auth.signIn.errorSignInFailed'), error.message || t('auth.signIn.errorInvalidCredentials'));
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
                {t('auth.signIn.title')}
              </Text>
              <Text style={[styles.subtitle, { color: textColorSecondary }]}>
                {t('auth.signIn.subtitle')}
              </Text>
            </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: textColorPrimary }]}>
                {t('auth.signIn.emailLabel')}
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBackground, borderColor: inputBorder }]}>
                <Mail color={iconColor} width={20} height={20} strokeWidth={1.5} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textColorPrimary }]}
                  placeholder={t('auth.signIn.emailPlaceholder')}
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

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: textColorPrimary }]}>
                {t('auth.signIn.passwordLabel')}
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: inputBackground, borderColor: inputBorder }]}>
                <TextInput
                  style={[styles.input, { color: textColorPrimary, flex: 1 }]}
                  placeholder={t('auth.signIn.passwordPlaceholder')}
                  placeholderTextColor={placeholderColor}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff color={textColorSecondary} width={20} height={20} strokeWidth={1.5} />
                  ) : (
                    <Eye color={textColorSecondary} width={20} height={20} strokeWidth={1.5} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              disabled={loading}
            >
              <Text style={[styles.forgotPassword, { color: iconColor }]}>
                {t('auth.signIn.forgotPassword')}
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: ctaBackground }, loading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>{t('auth.signIn.signInButton')}</Text>
              )}
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
  passwordToggle: {
    padding: 8,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    paddingVertical: 8,
    paddingHorizontal: 4,
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
});
