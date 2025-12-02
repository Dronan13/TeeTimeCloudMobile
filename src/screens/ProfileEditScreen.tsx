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
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProfileEditScreen() {
  const { profile, user, refreshProfile } = useAuth();
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    phone: profile?.phone || '',
    date_of_birth: profile?.date_of_birth || '',
    gender: profile?.gender || '',
    city: profile?.city || '',
    state: profile?.state || '',
    country: profile?.country || '',
    zip_code: profile?.zip_code || '',
    handicap_index: profile?.handicap_index?.toString() || '',
    ghin_id: profile?.ghin_id?.toString() || '',
    average_score: profile?.average_score?.toString() || '',
    average_drive_yards: profile?.average_drive_yards?.toString() || '',
    playing_frequency: profile?.playing_frequency || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user || !profile) {
      Alert.alert(t('common.error'), t('profile.edit.errorAuth'));
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        phone: formData.phone || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || null,
        zip_code: formData.zip_code || null,
        handicap_index: formData.handicap_index ? parseFloat(formData.handicap_index) : null,
        ghin_id: formData.ghin_id ? parseInt(formData.ghin_id) : null,
        average_score: formData.average_score ? parseFloat(formData.average_score) : null,
        average_drive_yards: formData.average_drive_yards
          ? parseFloat(formData.average_drive_yards)
          : null,
        playing_frequency: formData.playing_frequency || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('golfer_profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      Alert.alert(t('profile.edit.successTitle'), t('profile.edit.successMessage'), [
        {
          text: t('common.ok'),
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(t('profile.edit.errorTitle'), error.message || t('profile.edit.errorMessage'));
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
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            {t('profile.edit.personalInfo')}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>{t('profile.edit.phone')}</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('profile.edit.phonePlaceholder')}
              placeholderTextColor={isDark ? '#adb5bd' : '#868e96'}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>{t('profile.edit.dateOfBirth')}</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('profile.edit.dateOfBirthPlaceholder')}
              placeholderTextColor={isDark ? '#adb5bd' : '#868e96'}
              value={formData.date_of_birth}
              onChangeText={(value) => handleInputChange('date_of_birth', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>{t('profile.edit.gender')}</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('profile.edit.genderPlaceholder')}
              placeholderTextColor={isDark ? '#adb5bd' : '#868e96'}
              value={formData.gender}
              onChangeText={(value) => handleInputChange('gender', value)}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            {t('profile.edit.location')}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>{t('profile.edit.city')}</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('profile.edit.cityPlaceholder')}
              placeholderTextColor={isDark ? '#adb5bd' : '#868e96'}
              value={formData.city}
              onChangeText={(value) => handleInputChange('city', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>{t('profile.edit.state')}</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('profile.edit.statePlaceholder')}
              placeholderTextColor={isDark ? '#adb5bd' : '#868e96'}
              value={formData.state}
              onChangeText={(value) => handleInputChange('state', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>{t('profile.edit.country')}</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('profile.edit.countryPlaceholder')}
              placeholderTextColor={isDark ? '#adb5bd' : '#868e96'}
              value={formData.country}
              onChangeText={(value) => handleInputChange('country', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>{t('profile.edit.zipCode')}</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('profile.edit.zipCodePlaceholder')}
              placeholderTextColor={isDark ? '#adb5bd' : '#868e96'}
              value={formData.zip_code}
              onChangeText={(value) => handleInputChange('zip_code', value)}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            {t('profile.edit.golfInfo')}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>{t('profile.edit.handicap')}</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('profile.edit.handicapPlaceholder')}
              placeholderTextColor={isDark ? '#adb5bd' : '#868e96'}
              value={formData.handicap_index}
              onChangeText={(value) => handleInputChange('handicap_index', value)}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>{t('profile.edit.ghinId')}</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('profile.edit.ghinIdPlaceholder')}
              placeholderTextColor={isDark ? '#adb5bd' : '#868e96'}
              value={formData.ghin_id}
              onChangeText={(value) => handleInputChange('ghin_id', value)}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>{t('profile.edit.averageScore')}</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('profile.edit.averageScorePlaceholder')}
              placeholderTextColor={isDark ? '#adb5bd' : '#868e96'}
              value={formData.average_score}
              onChangeText={(value) => handleInputChange('average_score', value)}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>{t('profile.edit.averageDrive')}</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('profile.edit.averageDrivePlaceholder')}
              placeholderTextColor={isDark ? '#adb5bd' : '#868e96'}
              value={formData.average_drive_yards}
              onChangeText={(value) => handleInputChange('average_drive_yards', value)}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>{t('profile.edit.playingFrequency')}</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder={t('profile.edit.playingFrequencyPlaceholder')}
              placeholderTextColor={isDark ? '#adb5bd' : '#868e96'}
              value={formData.playing_frequency}
              onChangeText={(value) => handleInputChange('playing_frequency', value)}
              autoCapitalize="words"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{t('profile.edit.saveChanges')}</Text>
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
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#1a1d21',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewDark: {
    backgroundColor: '#1a1d21',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
    borderWidth: 1,
    borderColor: '#d1d6db',
  },
  sectionDark: {
    backgroundColor: '#2b3137',
    borderColor: '#343a40',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#f8f9fa',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  labelDark: {
    color: '#f8f9fa',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d6db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#212529',
  },
  inputDark: {
    backgroundColor: '#343a40',
    borderColor: '#495057',
    color: '#f8f9fa',
  },
  saveButton: {
    backgroundColor: '#2d7a4e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
});
