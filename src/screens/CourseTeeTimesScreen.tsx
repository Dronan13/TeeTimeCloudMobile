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

export default function CourseTeeTimesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Tee Times</Text>
    </View>
  );
}
