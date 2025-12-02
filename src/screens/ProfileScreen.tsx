import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProfileStackParamList } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';
import { Edit3, Lock, MessageCircle, FileText, LogOut, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();

  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit');
  };

  const handleUpdatePassword = () => {
    navigation.navigate('UpdatePassword');
  };

  const handleSupport = () => {
    navigation.navigate('Support');
  };

  const handleTermsOfUse = () => {
    navigation.navigate('TermsOfUse');
  };

  const handleSignOut = async () => {
    Alert.alert(t('auth.signOut.title'), t('auth.signOut.message'), [
      {
        text: t('auth.signOut.cancel'),
        style: 'cancel',
      },
      {
        text: t('auth.signOut.signOut'),
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert(t('common.error'), t('auth.signOut.errorFailed'));
          }
        },
      },
    ]);
  };

  const getInitials = (firstName?: string | null, lastName?: string | null): string => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getDisplayName = (): string => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    return user?.email || 'User';
  };

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={[styles.profileHeader, isDark && styles.profileHeaderDark]}>
        <View style={styles.avatarContainer}>
          {profile?.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {getInitials(profile?.first_name, profile?.last_name)}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.profileName, isDark && styles.profileNameDark]}>{getDisplayName()}</Text>
        <Text style={[styles.profileEmail, isDark && styles.profileEmailDark]}>{user?.email}</Text>
      </View>

      {/* Language & Theme Settings */}
      <View style={[styles.themeSection, isDark && styles.themeSectionDark]}>
        <LanguageSelector />
        <ThemeToggle />
      </View>

      {/* Menu Section */}
      <View style={[styles.menuSection, isDark && styles.menuSectionDark]}>
        {/* Edit Profile */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleEditProfile}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconContainer, isDark && styles.menuIconContainerDark]}>
            <Edit3 size={20} color="#2d7a4e" strokeWidth={2} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, isDark && styles.menuTitleDark]}>{t('profile.editProfile')}</Text>
            <Text style={[styles.menuSubtitle, isDark && styles.menuSubtitleDark]}>{t('profile.updateProfileInfo')}</Text>
          </View>
          <ChevronRight size={20} color={isDark ? '#868e96' : '#adb5bd'} strokeWidth={2} />
        </TouchableOpacity>

        {/* Update Password */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleUpdatePassword}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconContainer, isDark && styles.menuIconContainerDark]}>
            <Lock size={20} color="#2d7a4e" strokeWidth={2} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, isDark && styles.menuTitleDark]}>{t('profile.updatePassword')}</Text>
            <Text style={[styles.menuSubtitle, isDark && styles.menuSubtitleDark]}>{t('profile.changePassword')}</Text>
          </View>
          <ChevronRight size={20} color={isDark ? '#868e96' : '#adb5bd'} strokeWidth={2} />
        </TouchableOpacity>

        {/* Support */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleSupport}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconContainer, isDark && styles.menuIconContainerDark]}>
            <MessageCircle size={20} color="#2d7a4e" strokeWidth={2} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, isDark && styles.menuTitleDark]}>{t('profile.supportTitle')}</Text>
            <Text style={[styles.menuSubtitle, isDark && styles.menuSubtitleDark]}>{t('profile.getHelp')}</Text>
          </View>
          <ChevronRight size={20} color={isDark ? '#868e96' : '#adb5bd'} strokeWidth={2} />
        </TouchableOpacity>

        {/* Terms of Use */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleTermsOfUse}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconContainer, isDark && styles.menuIconContainerDark]}>
            <FileText size={20} color="#2d7a4e" strokeWidth={2} />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, isDark && styles.menuTitleDark]}>{t('profile.termsOfUseTitle')}</Text>
            <Text style={[styles.menuSubtitle, isDark && styles.menuSubtitleDark]}>{t('profile.readTerms')}</Text>
          </View>
          <ChevronRight size={20} color={isDark ? '#868e96' : '#adb5bd'} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <View style={styles.signOutSection}>
        <TouchableOpacity
          style={[styles.signOutButton, isDark && styles.signOutButtonDark]}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <LogOut size={20} color="#ef4444" strokeWidth={2} />
          <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, isDark && styles.versionTextDark]}>{t('app.version')}</Text>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
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
  profileHeader: {
    backgroundColor: '#fff',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d6db',
  },
  profileHeaderDark: {
    backgroundColor: '#2b3137',
    borderBottomColor: '#343a40',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2d7a4e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: '600',
    color: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  profileNameDark: {
    color: '#f8f9fa',
  },
  profileEmail: {
    fontSize: 15,
    color: '#868e96',
  },
  profileEmailDark: {
    color: '#adb5bd',
  },
  themeSection: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  themeSectionDark: {
    backgroundColor: '#1a1d21',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d1d6db',
  },
  menuSectionDark: {
    backgroundColor: '#2b3137',
    borderColor: '#343a40',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIconContainerDark: {
    backgroundColor: '#343a40',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  menuTitleDark: {
    color: '#f8f9fa',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#868e96',
  },
  menuSubtitleDark: {
    color: '#adb5bd',
  },
  signOutSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  signOutButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    gap: 8,
  },
  signOutButtonDark: {
    backgroundColor: '#2b3137',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 13,
    color: '#adb5bd',
  },
  versionTextDark: {
    color: '#868e96',
  },
  bottomSpacing: {
    height: 24,
  },
});
