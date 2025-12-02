import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function TermsOfUseScreen() {
  const { isDark } = useTheme();

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.content, isDark && styles.contentDark]}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Terms of Use</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>Terms and conditions will be displayed here.</Text>
      </View>
    </ScrollView>
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
  content: {
    padding: 20,
  },
  contentDark: {
    backgroundColor: '#111827',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  titleDark: {
    color: '#f9fafb',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  subtitleDark: {
    color: '#9ca3af',
  },
});
