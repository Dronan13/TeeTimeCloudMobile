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

export default function ProfileEditScreen() {
  const { profile, user, refreshProfile } = useAuth();
  const navigation = useNavigation();
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
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.date_of_birth}
              onChangeText={(value) => handleInputChange('date_of_birth', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your gender"
              value={formData.gender}
              onChangeText={(value) => handleInputChange('gender', value)}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your city"
              value={formData.city}
              onChangeText={(value) => handleInputChange('city', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your state"
              value={formData.state}
              onChangeText={(value) => handleInputChange('state', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your country"
              value={formData.country}
              onChangeText={(value) => handleInputChange('country', value)}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Zip Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your zip code"
              value={formData.zip_code}
              onChangeText={(value) => handleInputChange('zip_code', value)}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Golf Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Handicap Index</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your handicap index"
              value={formData.handicap_index}
              onChangeText={(value) => handleInputChange('handicap_index', value)}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>GHIN ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your GHIN ID"
              value={formData.ghin_id}
              onChangeText={(value) => handleInputChange('ghin_id', value)}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Average Score</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your average score"
              value={formData.average_score}
              onChangeText={(value) => handleInputChange('average_score', value)}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Average Drive (yards)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter average drive distance"
              value={formData.average_drive_yards}
              onChangeText={(value) => handleInputChange('average_drive_yards', value)}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Playing Frequency</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Weekly, Monthly"
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
  scrollView: {
    flex: 1,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
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
