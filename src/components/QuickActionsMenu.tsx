import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Calendar, Clock, RotateCcw, Plus, Trophy, Flag } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { AppTabParamList } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface QuickActionsMenuProps {
  visible: boolean;
  onClose: () => void;
}

type NavigationProp = BottomTabNavigationProp<AppTabParamList>;

export default function QuickActionsMenu({ visible, onClose }: QuickActionsMenuProps) {
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { profile } = useAuth();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleAction = (action: () => void) => {
    onClose();
    setTimeout(action, 100);
  };

  const handleBookTeeTime = () => {
    if (profile?.home_course_id) {
      navigation.navigate('Courses', {
        screen: 'CourseTeeTimesScreen',
        params: {
          courseId: profile.home_course_id,
          courseName: '',
        },
      });
    } else {
      navigation.navigate('Courses');
    }
  };

  const handleMyTeeTimes = () => {
    navigation.navigate('TeeTimes');
  };

  const handleMyRounds = () => {
    navigation.navigate('Rounds');
  };

  const handleStartNewRound = () => {
    navigation.navigate('Rounds', { screen: 'NewRound' });
  };

  const handleFindTournaments = () => {
    navigation.navigate('Tournaments');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.backdropFill,
            {
              opacity: fadeAnim,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
          ]}
        />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.menuContainer,
          isDark && styles.menuContainerDark,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.handle} />

        <Text style={[styles.title, isDark && styles.titleDark]}>
          {t('quickActions.title') || 'Quick Actions'}
        </Text>

        <View style={styles.actionsContainer}>
          <ActionButton
            icon={<Flag size={24} color="#2d7a4e" strokeWidth={2} />}
            label={t('quickActions.bookTeeTime') || 'Book Tee Time'}
            onPress={() => handleAction(handleBookTeeTime)}
            isDark={isDark}
          />

          <ActionButton
            icon={<Calendar size={24} color="#2d7a4e" strokeWidth={2} />}
            label={t('quickActions.myTeeTimes') || 'My Tee Times'}
            onPress={() => handleAction(handleMyTeeTimes)}
            isDark={isDark}
          />

          <ActionButton
            icon={<RotateCcw size={24} color="#2d7a4e" strokeWidth={2} />}
            label={t('quickActions.myRounds') || 'My Rounds'}
            onPress={() => handleAction(handleMyRounds)}
            isDark={isDark}
          />

          <ActionButton
            icon={<Plus size={24} color="#2d7a4e" strokeWidth={2} />}
            label={t('quickActions.startRound') || 'Start Round'}
            onPress={() => handleAction(handleStartNewRound)}
            isDark={isDark}
          />

          <ActionButton
            icon={<Trophy size={24} color="#2d7a4e" strokeWidth={2} />}
            label={t('quickActions.findTournaments') || 'Find Tournaments'}
            onPress={() => handleAction(handleFindTournaments)}
            isDark={isDark}
          />
        </View>
      </Animated.View>
    </Modal>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isDark: boolean;
}

function ActionButton({ icon, label, onPress, isDark }: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, isDark && styles.actionButtonDark]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={[styles.actionLabel, isDark && styles.actionLabelDark]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  backdropFill: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuContainerDark: {
    backgroundColor: '#2b3137',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d6db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 20,
    textAlign: 'center',
  },
  titleDark: {
    color: '#f8f9fa',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionButtonDark: {
    backgroundColor: '#1a1d21',
    borderColor: '#343a40',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  actionLabelDark: {
    color: '#f8f9fa',
  },
});
