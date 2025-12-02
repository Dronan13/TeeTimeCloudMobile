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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabaseClient';
import { pickAndUploadImage } from '@/utils/imageUpload';

export default function SupportScreen() {
  const { user, profile } = useAuth();
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : '',
    email: profile?.email || user?.email || '',
    description: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickImage = async () => {
    try {
      setUploadingImage(true);
      const result = await pickAndUploadImage('support-images', 'support-requests');

      if (result) {
        setImageUrl(result.publicUrl);
        setLocalImageUri(result.publicUrl);
        Alert.alert('Success', 'Image uploaded successfully');
      }
    } catch (error: any) {
      if (error.message === 'Permission to access gallery is required') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library in Settings.'
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to upload image');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setImageUrl(null);
          setLocalImageUri(null);
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    const { full_name, email, description } = formData;

    if (!description.trim()) {
      Alert.alert('Error', 'Please describe your issue or question');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please provide your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('support_requests').insert({
        user_id: user?.id || null,
        full_name: full_name || null,
        email: email,
        description: description.trim(),
        image_url: imageUrl || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert(
        'Request Submitted',
        'Thank you for contacting us. We will respond to your request as soon as possible.',
        [
          {
            text: 'OK',
            onPress: () => {
              setFormData((prev) => ({
                ...prev,
                description: '',
              }));
              setImageUrl(null);
              setLocalImageUri(null);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit support request');
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
          <Text style={[styles.title, isDark && styles.titleDark]}>Contact Support</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            Have a question or need help? Send us a message and we'll get back to you
            as soon as possible.
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Message <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, isDark && styles.inputDark]}
              placeholder="Describe your issue or question..."
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Attachment (Optional)</Text>
            {localImageUri ? (
              <View style={[styles.imagePreviewContainer, isDark && styles.imagePreviewContainerDark]}>
                <Image source={{ uri: localImageUri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={handleRemoveImage}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.uploadButton, isDark && styles.uploadButtonDark]}
                onPress={handlePickImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator color="#22c55e" />
                ) : (
                  <>
                    <Text style={styles.uploadIcon}>📷</Text>
                    <Text style={[styles.uploadText, isDark && styles.uploadTextDark]}>Upload Image from Gallery</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled, isDark && styles.submitButtonDark]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Request</Text>
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
    backgroundColor: '#111827',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
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
  required: {
    color: '#ef4444',
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
    backgroundColor: '#111827',
    borderColor: '#374151',
    color: '#f9fafb',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  infoSection: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#166534',
    flex: 1,
  },
  submitButton: {
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
  submitButtonDark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#22c55e',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
  },
  uploadButtonDark: {
    backgroundColor: '#111827',
    borderColor: '#22c55e',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  uploadTextDark: {
    color: '#22c55e',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  imagePreviewContainerDark: {
    backgroundColor: '#111827',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
