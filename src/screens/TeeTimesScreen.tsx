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

export default function TeeTimesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Tee Times</Text>
    </View>
  );
}
