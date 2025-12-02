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

export default function ProfileEditScreen() {
  const { profile, user, refreshProfile } = useAuth();
  const navigation = useNavigation();
  const { isDark } = useTheme();
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
      Alert.alert('Error', 'User not authenticated');
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
      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
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
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Personal Information</Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Phone</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your phone number"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Date of Birth</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={formData.date_of_birth}
              onChangeText={(value) => handleInputChange('date_of_birth', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Gender</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your gender"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={formData.gender}
              onChangeText={(value) => handleInputChange('gender', value)}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Location</Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>City</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your city"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={formData.city}
              onChangeText={(value) => handleInputChange('city', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>State</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your state"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={formData.state}
              onChangeText={(value) => handleInputChange('state', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Country</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your country"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={formData.country}
              onChangeText={(value) => handleInputChange('country', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Zip Code</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your zip code"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={formData.zip_code}
              onChangeText={(value) => handleInputChange('zip_code', value)}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Golf Information</Text>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Handicap Index</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your handicap index"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={formData.handicap_index}
              onChangeText={(value) => handleInputChange('handicap_index', value)}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>GHIN ID</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your GHIN ID"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={formData.ghin_id}
              onChangeText={(value) => handleInputChange('ghin_id', value)}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Average Score</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter your average score"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={formData.average_score}
              onChangeText={(value) => handleInputChange('average_score', value)}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Average Drive (yards)</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Enter average drive distance"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
              value={formData.average_drive_yards}
              onChangeText={(value) => handleInputChange('average_drive_yards', value)}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Playing Frequency</Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="e.g., Weekly, Monthly"
              placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
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
            <Text style={styles.saveButtonText}>Save Changes</Text>
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
    borderColor: '#374151',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#f9fafb',
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
    color: '#f9fafb',
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
    borderColor: '#4b5563',
    color: '#f9fafb',
  },
  saveButton: {
    backgroundColor: '#22c55e',
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
    backgroundColor: '#9ca3af',
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
