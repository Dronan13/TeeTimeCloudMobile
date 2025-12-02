import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sun, Moon, Smartphone } from 'lucide-react-native';

export default function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme();
  const { t } = useLanguage();

  const options: Array<{ value: 'light' | 'dark' | 'system'; label: string; Icon: any }> = [
    { value: 'light', label: t('theme.light'), Icon: Sun },
    { value: 'dark', label: t('theme.dark'), Icon: Moon },
    { value: 'system', label: t('theme.system'), Icon: Smartphone },
  ];

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>{t('theme.title')}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const Icon = option.Icon;
          const isActive = theme === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                isDark && styles.optionDark,
                isActive && styles.optionActive,
                isActive && isDark && styles.optionActiveDark,
              ]}
              onPress={() => setTheme(option.value)}
            >
              <Icon
                size={18}
                color={isActive ? '#2d7a4e' : (isDark ? '#adb5bd' : '#868e96')}
                strokeWidth={2}
              />
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
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
