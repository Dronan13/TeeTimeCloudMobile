import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { MapPin, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface LocationPermissionPromptProps {
  onRequestPermission: () => void;
  onDismiss: () => void;
  permissionStatus: 'undetermined' | 'denied';
}

export function LocationPermissionPrompt({
  onRequestPermission,
  onDismiss,
  permissionStatus,
}: LocationPermissionPromptProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const isDenied = permissionStatus === 'denied';

  const handleAction = () => {
    if (isDenied) {
      Linking.openSettings();
    } else {
      onRequestPermission();
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <MapPin size={24} color="#2d7a4e" strokeWidth={2} />
        <View style={styles.textContainer}>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            {t('location.promptTitle')}
          </Text>
          <Text style={[styles.description, isDark && styles.descriptionDark]}>
            {isDenied
              ? t('location.deniedDescription')
              : t('location.promptDescription')}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.enableButton}
          onPress={handleAction}
          activeOpacity={0.7}
        >
          <Text style={styles.enableButtonText}>
            {isDenied ? t('location.openSettings') : t('location.enable')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
          activeOpacity={0.7}
        >
          <X size={20} color={isDark ? '#adb5bd' : '#868e96'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  containerDark: {
    backgroundColor: '#212529',
    borderColor: '#343a40',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  titleDark: {
    color: '#f8f9fa',
  },
  description: {
    fontSize: 14,
    color: '#868e96',
    lineHeight: 20,
  },
  descriptionDark: {
    color: '#adb5bd',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  enableButton: {
    flex: 1,
    backgroundColor: '#2d7a4e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  enableButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 8,
  },
});
