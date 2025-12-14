import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Bell } from 'lucide-react-native';
import { useNotification } from '@/contexts/NotificationContext';
import { AppTabParamList } from '@/types';

type NavigationProp = BottomTabNavigationProp<AppTabParamList>;

export default function NotificationHeaderButton() {
  const navigation = useNavigation<NavigationProp>();
  const { unreadCount } = useNotification();

  const handlePress = () => {
    navigation.navigate('Notifications');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <Bell size={24} color="#fff" strokeWidth={2} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
