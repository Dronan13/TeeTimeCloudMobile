import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { styles } from '@/utils/styles';

export default function HomeScreen() {
  const { profile } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {profile?.first_name || 'Golfer'}!</Text>
      <Text style={styles.subtitle}>Your next round awaits</Text>
    </View>
  );
}
