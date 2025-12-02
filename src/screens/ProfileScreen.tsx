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
import ThemeToggle from '@/components/ThemeToggle';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const { isDark } = useTheme();
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
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
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

      {/* Theme Toggle */}
      <View style={[styles.themeSection, isDark && styles.themeSectionDark]}>
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
            <Text style={styles.menuIcon}>✏️</Text>
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, isDark && styles.menuTitleDark]}>Edit Profile</Text>
            <Text style={[styles.menuSubtitle, isDark && styles.menuSubtitleDark]}>Update your personal information</Text>
          </View>
          <Text style={[styles.menuArrow, isDark && styles.menuArrowDark]}>›</Text>
        </TouchableOpacity>

        {/* Update Password */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleUpdatePassword}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconContainer, isDark && styles.menuIconContainerDark]}>
            <Text style={styles.menuIcon}>🔒</Text>
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, isDark && styles.menuTitleDark]}>Update Password</Text>
            <Text style={[styles.menuSubtitle, isDark && styles.menuSubtitleDark]}>Change your account password</Text>
          </View>
          <Text style={[styles.menuArrow, isDark && styles.menuArrowDark]}>›</Text>
        </TouchableOpacity>

        {/* Support */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleSupport}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconContainer, isDark && styles.menuIconContainerDark]}>
            <Text style={styles.menuIcon}>💬</Text>
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, isDark && styles.menuTitleDark]}>Support</Text>
            <Text style={[styles.menuSubtitle, isDark && styles.menuSubtitleDark]}>Get help and contact us</Text>
          </View>
          <Text style={[styles.menuArrow, isDark && styles.menuArrowDark]}>›</Text>
        </TouchableOpacity>

        {/* Terms of Use */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleTermsOfUse}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIconContainer, isDark && styles.menuIconContainerDark]}>
            <Text style={styles.menuIcon}>📄</Text>
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, isDark && styles.menuTitleDark]}>Terms of Use</Text>
            <Text style={[styles.menuSubtitle, isDark && styles.menuSubtitleDark]}>Read our terms and conditions</Text>
          </View>
          <Text style={[styles.menuArrow, isDark && styles.menuArrowDark]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <View style={styles.signOutSection}>
        <TouchableOpacity
          style={[styles.signOutButton, isDark && styles.signOutButtonDark]}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutIcon}>🚪</Text>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, isDark && styles.versionTextDark]}>TeeTime Cloud v1.0.0</Text>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
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
  profileHeader: {
    backgroundColor: '#fff',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  profileHeaderDark: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
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
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  profileNameDark: {
    color: '#f9fafb',
  },
  profileEmail: {
    fontSize: 15,
    color: '#6b7280',
  },
  profileEmailDark: {
    color: '#9ca3af',
  },
  themeSection: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  themeSectionDark: {
    backgroundColor: '#111827',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  menuSectionDark: {
    backgroundColor: '#1f2937',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIconContainerDark: {
    backgroundColor: '#374151',
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuTitleDark: {
    color: '#f9fafb',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  menuSubtitleDark: {
    color: '#9ca3af',
  },
  menuArrow: {
    fontSize: 24,
    color: '#9ca3af',
    fontWeight: '300',
  },
  menuArrowDark: {
    color: '#6b7280',
  },
  signOutSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  signOutButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
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
  },
  signOutButtonDark: {
    backgroundColor: '#1f2937',
  },
  signOutIcon: {
    fontSize: 20,
    marginRight: 8,
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
    color: '#9ca3af',
  },
  versionTextDark: {
    color: '#6b7280',
  },
  bottomSpacing: {
    height: 24,
  },
});
