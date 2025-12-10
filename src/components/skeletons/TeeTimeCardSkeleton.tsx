import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export const TeeTimeCardSkeleton = () => {
  const { isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const bgColor = isDark ? 'bg-gray-700' : 'bg-gray-200';

  return (
    <Animated.View
      style={{ opacity }}
      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 mb-3 border ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <View className="flex-row justify-between items-center mb-3">
        <View className={`h-5 ${bgColor} rounded w-1/2`} />
        <View className={`h-6 ${bgColor} rounded-full w-16`} />
      </View>
      <View className={`h-4 ${bgColor} rounded w-3/4 mb-2`} />
      <View className="flex-row justify-between mt-3">
        <View className={`h-4 ${bgColor} rounded w-1/4`} />
        <View className={`h-4 ${bgColor} rounded w-1/3`} />
      </View>
    </Animated.View>
  );
};
