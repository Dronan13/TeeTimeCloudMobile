import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { RootStackParamList } from '@/types';

type UpdatePasswordScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'UpdatePassword'>;
};

export default function UpdatePasswordScreen({ navigation }: UpdatePasswordScreenProps) {
  const { updatePassword } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

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
  const requirementsBg = isDark ? 'rgba(31, 170, 89, 0.1)' : 'rgba(31, 170, 89, 0.08)';
  const requirementsBorder = isDark ? 'rgba(31, 170, 89, 0.3)' : 'rgba(31, 170, 89, 0.2)';

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return t('auth.updatePassword.errorPasswordLength');
    }
    return null;
  };

  const handleUpdatePassword = async () => {
    const { newPassword, confirmPassword } = formData;

    if (!newPassword || !confirmPassword) {
      Alert.alert(t('common.error'), t('auth.updatePassword.errorAllFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.updatePassword.errorPasswordMismatch'));
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      Alert.alert(t('common.error'), validationError);
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      Alert.alert(
        t('auth.updatePassword.successTitle'),
        t('auth.updatePassword.successMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
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
                <View style={styles.logoContainer}>
                  <Text style={styles.logoIcon}>⛳</Text>
                </View>
                <Text style={[styles.title, { color: textColorPrimary }]}>
                  {t('auth.updatePassword.title')}
                </Text>
                <Text style={[styles.subtitle, { color: textColorSecondary }]}>
                  {t('auth.updatePassword.subtitle')}
                </Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* New Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: textColorPrimary }]}>
                    {t('auth.updatePassword.newPasswordLabel')}
                  </Text>
                  <View style={[styles.inputWrapper, { backgroundColor: inputBackground, borderColor: inputBorder }]}>
                    <TextInput
                      style={[styles.input, { color: textColorPrimary, flex: 1 }]}
                      placeholder={t('auth.updatePassword.newPasswordPlaceholder')}
                      placeholderTextColor={placeholderColor}
                      value={formData.newPassword}
                      onChangeText={(value) => handleInputChange('newPassword', value)}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      autoComplete="password-new"
                      editable={!loading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={styles.passwordToggle}
                      disabled={loading}
                    >
                      {showNewPassword ? (
                        <EyeOff color={textColorSecondary} width={20} height={20} strokeWidth={1.5} />
                      ) : (
                        <Eye color={textColorSecondary} width={20} height={20} strokeWidth={1.5} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: textColorPrimary }]}>
                    {t('auth.updatePassword.confirmPasswordLabel')}
                  </Text>
                  <View style={[styles.inputWrapper, { backgroundColor: inputBackground, borderColor: inputBorder }]}>
                    <TextInput
                      style={[styles.input, { color: textColorPrimary, flex: 1 }]}
                      placeholder={t('auth.updatePassword.confirmPasswordPlaceholder')}
                      placeholderTextColor={placeholderColor}
                      value={formData.confirmPassword}
                      onChangeText={(value) => handleInputChange('confirmPassword', value)}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoComplete="password-new"
                      editable={!loading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.passwordToggle}
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff color={textColorSecondary} width={20} height={20} strokeWidth={1.5} />
                      ) : (
                        <Eye color={textColorSecondary} width={20} height={20} strokeWidth={1.5} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Password Requirements */}
                <View style={[styles.requirementsSection, { backgroundColor: requirementsBg, borderColor: requirementsBorder }]}>
                  <Text style={[styles.requirementsTitle, { color: iconColor }]}>
                    Password must be at least 6 characters
                  </Text>
                </View>

                {/* Update Button */}
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: ctaBackground }, loading && styles.buttonDisabled]}
                  onPress={handleUpdatePassword}
                  disabled={loading}
                  activeOpacity={0.9}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>{t('auth.updatePassword.updateButton')}</Text>
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
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  passwordToggle: {
    padding: 8,
  },
  requirementsSection: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
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
