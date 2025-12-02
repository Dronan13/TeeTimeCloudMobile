import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSelector() {
  const { isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const options: Array<{ value: 'en' | 'es'; label: string; icon: string }> = [
    { value: 'en', label: t('language.english'), icon: '🇺🇸' },
    { value: 'es', label: t('language.spanish'), icon: '🇪🇸' },
  ];

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>{t('language.title')}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              isDark && styles.optionDark,
              language === option.value && styles.optionActive,
              language === option.value && isDark && styles.optionActiveDark,
            ]}
            onPress={() => setLanguage(option.value)}
          >
            <Text style={styles.icon}>{option.icon}</Text>
            <Text
              style={[
                styles.label,
                isDark && styles.labelDark,
                language === option.value && styles.labelActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  containerDark: {
    backgroundColor: '#1f2937',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  titleDark: {
    color: '#f9fafb',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionDark: {
    backgroundColor: '#111827',
  },
  optionActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  optionActiveDark: {
    backgroundColor: '#14532d',
    borderColor: '#22c55e',
  },
  icon: {
    fontSize: 20,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  labelDark: {
    color: '#9ca3af',
  },
  labelActive: {
    color: '#22c55e',
  },
});
