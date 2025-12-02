import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react-native';

export default function LanguageSelector() {
  const { isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const options: Array<{ value: 'en' | 'es'; label: string; flag: string }> = [
    { value: 'en', label: t('language.english'), flag: '🇺🇸' },
    { value: 'es', label: t('language.spanish'), flag: '🇪🇸' },
  ];

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.titleRow}>
        <Globe size={18} color={isDark ? '#f8f9fa' : '#212529'} strokeWidth={2} />
        <Text style={[styles.title, isDark && styles.titleDark]}>{t('language.title')}</Text>
      </View>
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isActive = language === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                isDark && styles.optionDark,
                isActive && styles.optionActive,
                isActive && isDark && styles.optionActiveDark,
              ]}
              onPress={() => setLanguage(option.value)}
            >
              <Text style={styles.flag}>{option.flag}</Text>
              <Text
                style={[
                  styles.label,
                  isDark && styles.labelDark,
                  isActive && styles.labelActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    borderWidth: 1,
    borderColor: '#d1d6db',
  },
  containerDark: {
    backgroundColor: '#2b3137',
    borderColor: '#343a40',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  titleDark: {
    color: '#f8f9fa',
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
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  optionDark: {
    backgroundColor: '#1a1d21',
  },
  optionActive: {
    backgroundColor: '#f0f9f4',
    borderColor: '#2d7a4e',
  },
  optionActiveDark: {
    backgroundColor: '#133224',
    borderColor: '#2d7a4e',
  },
  flag: {
    fontSize: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#868e96',
  },
  labelDark: {
    color: '#adb5bd',
  },
  labelActive: {
    color: '#2d7a4e',
  },
});
