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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';

export default function UpdatePasswordScreen() {
  const { updatePassword } = useAuth();
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleUpdatePassword = async () => {
    const { newPassword, confirmPassword } = formData;

    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      Alert.alert('Invalid Password', validationError);
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      Alert.alert(
        'Success',
        'Your password has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isDark && styles.containerDark]}
    >
      <ScrollView
        style={[styles.scrollView, isDark && styles.scrollViewDark]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, isDark && styles.headerDark]}>
          <Text style={[styles.title, isDark && styles.titleDark]}>Update Password</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Choose a strong password to keep your account secure
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>New Password</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter new password"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={formData.newPassword}
              onChangeText={(value) => handleInputChange('newPassword', value)}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Confirm New Password</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Confirm new password"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
            />
          </View>
        </View>

        <View style={[styles.requirementsSection, isDark && styles.requirementsSectionDark]}>
          <Text style={[styles.requirementsTitle, isDark && styles.requirementsTitleDark]}>Password Requirements:</Text>
          <View style={styles.requirementsList}>
            <View style={styles.requirementItem}>
              <Text style={[styles.requirementBullet, isDark && styles.requirementBulletDark]}>•</Text>
              <Text style={[styles.requirementText, isDark && styles.requirementTextDark]}>At least 8 characters long</Text>
            </View>
            <View style={styles.requirementItem}>
              <Text style={[styles.requirementBullet, isDark && styles.requirementBulletDark]}>•</Text>
              <Text style={[styles.requirementText, isDark && styles.requirementTextDark]}>Contains uppercase letter (A-Z)</Text>
            </View>
            <View style={styles.requirementItem}>
              <Text style={[styles.requirementBullet, isDark && styles.requirementBulletDark]}>•</Text>
              <Text style={[styles.requirementText, isDark && styles.requirementTextDark]}>Contains lowercase letter (a-z)</Text>
            </View>
            <View style={styles.requirementItem}>
              <Text style={[styles.requirementBullet, isDark && styles.requirementBulletDark]}>•</Text>
              <Text style={[styles.requirementText, isDark && styles.requirementTextDark]}>Contains number (0-9)</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.updateButton, loading && styles.updateButtonDisabled]}
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>Update Password</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewDark: {
    backgroundColor: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerDark: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  titleDark: {
    color: '#f9fafb',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
  },
  subtitleDark: {
    color: '#9ca3af',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionDark: {
    backgroundColor: '#1f2937',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  labelDark: {
    color: '#9ca3af',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  inputDark: {
    backgroundColor: '#374151',
    color: '#f9fafb',
    borderColor: '#4b5563',
  },
  requirementsSection: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  requirementsSectionDark: {
    backgroundColor: '#1e3a5f',
    borderColor: '#2563eb',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 12,
  },
  requirementsTitleDark: {
    color: '#93c5fd',
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  requirementBullet: {
    fontSize: 14,
    color: '#3b82f6',
    marginRight: 8,
    fontWeight: '700',
  },
  requirementBulletDark: {
    color: '#bfdbfe',
  },
  requirementText: {
    fontSize: 14,
    color: '#1e40af',
    flex: 1,
    lineHeight: 20,
  },
  requirementTextDark: {
    color: '#bfdbfe',
  },
  updateButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  updateButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
});
