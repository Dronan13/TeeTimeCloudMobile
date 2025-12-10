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
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import { pickAndUploadImage } from '@/utils/imageUpload';
import { Camera, X } from 'lucide-react-native';

export default function SupportScreen() {
  const { user, profile } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
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
        Alert.alert(t('common.success'), 'Image uploaded successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      if (errorMessage === 'Permission to access gallery is required') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library in Settings.'
        );
      } else {
        Alert.alert(t('common.error'), errorMessage);
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    Alert.alert('Remove Image', 'Are you sure you want to remove this image?', [
      { text: t('common.cancel'), style: 'cancel' },
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
      Alert.alert(t('common.error'), 'Please describe your issue or question');
      return;
    }

    if (!email.trim()) {
      Alert.alert(t('common.error'), 'Please provide your email address');
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
        t('profile.support.successTitle'),
        t('profile.support.successMessage'),
        [
          {
            text: t('common.ok'),
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit support request';
      Alert.alert(t('common.error'), errorMessage);
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
          <Text style={[styles.title, isDark && styles.titleDark]}>{t('profile.support.title')}</Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            {t('profile.support.subtitle')}
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              {t('profile.support.message')} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, isDark && styles.inputDark]}
              placeholder={t('profile.support.messagePlaceholder')}
              placeholderTextColor={isDark ? '#adb5bd' : '#868e96'}
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
                  <X size={18} color="#fff" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.uploadButton, isDark && styles.uploadButtonDark]}
                onPress={handlePickImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator color="#2d7a4e" />
                ) : (
                  <>
                    <Camera size={32} color="#2d7a4e" strokeWidth={1.5} />
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
            <Text style={styles.submitButtonText}>{t('profile.support.send')}</Text>
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
  header: {
    marginBottom: 24,
  },
  headerDark: {
    backgroundColor: '#1a1d21',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  titleDark: {
    color: '#f8f9fa',
  },
  subtitle: {
    fontSize: 15,
    color: '#868e96',
    lineHeight: 22,
  },
  subtitleDark: {
    color: '#adb5bd',
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
    color: '#495057',
    marginBottom: 8,
  },
  labelDark: {
    color: '#adb5bd',
  },
  required: {
    color: '#ef4444',
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
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: '#2d7a4e',
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
    backgroundColor: '#adb5bd',
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
    borderColor: '#2d7a4e',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f9f4',
    gap: 8,
  },
  uploadButtonDark: {
    backgroundColor: '#1a1d21',
    borderColor: '#2d7a4e',
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d7a4e',
  },
  uploadTextDark: {
    color: '#2d7a4e',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e9ecef',
  },
  imagePreviewContainerDark: {
    backgroundColor: '#1a1d21',
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
});
