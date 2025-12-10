import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText } from 'lucide-react-native';

export default function TermsOfUseScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.content, isDark && styles.contentDark]}>
        <View style={[styles.header, isDark && styles.headerDark]}>
          <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
            <FileText size={28} color="#2d7a4e" strokeWidth={2} />
          </View>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            {t('profile.termsOfUse.title')}
          </Text>
          <Text style={[styles.lastUpdated, isDark && styles.lastUpdatedDark]}>
            {t('profile.termsOfUse.lastUpdated')}: January 2025
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.intro, isDark && styles.introDark]}>
            {t('profile.termsOfUse.content')}
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            {t('profile.termsOfUse.section1Title')}
          </Text>
          <Text style={[styles.sectionContent, isDark && styles.sectionContentDark]}>
            {t('profile.termsOfUse.section1Content')}
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            {t('profile.termsOfUse.section2Title')}
          </Text>
          <Text style={[styles.sectionContent, isDark && styles.sectionContentDark]}>
            {t('profile.termsOfUse.section2Content')}
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            {t('profile.termsOfUse.section3Title')}
          </Text>
          <Text style={[styles.sectionContent, isDark && styles.sectionContentDark]}>
            {t('profile.termsOfUse.section3Content')}
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            {t('profile.termsOfUse.section4Title')}
          </Text>
          <Text style={[styles.sectionContent, isDark && styles.sectionContentDark]}>
            {t('profile.termsOfUse.section4Content')}
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            {t('profile.termsOfUse.section5Title')}
          </Text>
          <Text style={[styles.sectionContent, isDark && styles.sectionContentDark]}>
            {t('profile.termsOfUse.section5Content')}
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  contentDark: {
    backgroundColor: '#1a1d21',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerDark: {
    backgroundColor: '#1a1d21',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f9f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainerDark: {
    backgroundColor: '#133224',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleDark: {
    color: '#f8f9fa',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#868e96',
    textAlign: 'center',
  },
  lastUpdatedDark: {
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
  intro: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
  },
  introDark: {
    color: '#adb5bd',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  sectionTitleDark: {
    color: '#f8f9fa',
  },
  sectionContent: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
  },
  sectionContentDark: {
    color: '#adb5bd',
  },
  bottomSpacing: {
    height: 32,
  },
});
