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
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Eye, EyeOff, Mail } from 'lucide-react-native';
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

  const textColorPrimary = isDark ? '#f9fafb' : '#111827';
  const textColorSecondary = isDark ? '#9ca3af' : '#6b7280';
  const backgroundColor = isDark ? '#111827' : '#fff';
  const inputBackground = isDark ? '#1f2937' : '#f9fafb';
  const inputBorder = isDark ? '#374151' : '#e5e7eb';
  const placeholderColor = isDark ? '#6b7280' : '#9ca3af';
  const iconColor = '#22c55e';

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={[styles.content, { backgroundColor }]}>
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
              style={[styles.button, { backgroundColor: '#22c55e' }, loading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>{t('auth.signIn.signInButton')}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: textColorSecondary }]}>
              {t('landing.alreadyHaveAccount')}{' '}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
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
    minHeight: 48,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
