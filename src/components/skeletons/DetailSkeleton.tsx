import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

/**
 * Generic detail screen skeleton with hero image and content sections
 * Use for: CourseDetailScreen, TournamentDetailScreen, etc.
 */
export const DetailSkeleton = () => {
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
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';

  return (
    <Animated.View style={{ opacity, flex: 1 }}>
      {/* Hero Image */}
      <View className={`${bgColor} w-full h-48`} />

      <View className="px-4 py-4">
        {/* Title */}
        <View className={`h-8 ${bgColor} rounded w-3/4 mb-2`} />
        {/* Subtitle */}
        <View className={`h-5 ${bgColor} rounded w-1/2 mb-4`} />

        {/* Info Row */}
        <View className="flex-row mb-6">
          <View className={`h-4 ${bgColor} rounded w-24 mr-4`} />
          <View className={`h-4 ${bgColor} rounded w-20 mr-4`} />
          <View className={`h-4 ${bgColor} rounded w-16`} />
        </View>

        {/* Section Card 1 */}
        <View className={`${cardBg} rounded-xl p-4 mb-4`}>
          <View className={`h-5 ${bgColor} rounded w-32 mb-3`} />
          <View className={`h-4 ${bgColor} rounded w-full mb-2`} />
          <View className={`h-4 ${bgColor} rounded w-5/6 mb-2`} />
          <View className={`h-4 ${bgColor} rounded w-3/4`} />
        </View>

        {/* Section Card 2 */}
        <View className={`${cardBg} rounded-xl p-4 mb-4`}>
          <View className={`h-5 ${bgColor} rounded w-28 mb-3`} />
          <View className="flex-row justify-between mb-2">
            <View className={`h-10 ${bgColor} rounded w-24`} />
            <View className={`h-10 ${bgColor} rounded w-24`} />
            <View className={`h-10 ${bgColor} rounded w-24`} />
          </View>
        </View>

        {/* Action Button */}
        <View className={`h-12 ${bgColor} rounded-lg w-full mt-2`} />
      </View>
    </Animated.View>
  );
};

/**
 * Leaderboard/Player list item skeleton
 */
export const LeaderboardItemSkeleton = () => {
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
      className={`flex-row items-center p-3 mb-2 rounded-lg ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      {/* Position */}
      <View className={`h-6 w-8 ${bgColor} rounded mr-3`} />
      {/* Avatar */}
      <View className={`h-10 w-10 ${bgColor} rounded-full mr-3`} />
      {/* Name and info */}
      <View className="flex-1">
        <View className={`h-4 ${bgColor} rounded w-32 mb-1`} />
        <View className={`h-3 ${bgColor} rounded w-20`} />
      </View>
      {/* Score */}
      <View className={`h-6 w-12 ${bgColor} rounded`} />
    </Animated.View>
  );
};

/**
 * Scorecard grid skeleton for hole-by-hole display
 */
export const ScorecardSkeleton = () => {
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
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';

  return (
    <Animated.View style={{ opacity }} className="px-4">
      {/* Stats Summary */}
      <View className={`${cardBg} rounded-xl p-4 mb-4`}>
        <View className="flex-row justify-around">
          <View className="items-center">
            <View className={`h-8 w-16 ${bgColor} rounded mb-1`} />
            <View className={`h-3 w-12 ${bgColor} rounded`} />
          </View>
          <View className="items-center">
            <View className={`h-8 w-16 ${bgColor} rounded mb-1`} />
            <View className={`h-3 w-12 ${bgColor} rounded`} />
          </View>
          <View className="items-center">
            <View className={`h-8 w-16 ${bgColor} rounded mb-1`} />
            <View className={`h-3 w-12 ${bgColor} rounded`} />
          </View>
        </View>
      </View>

      {/* Scorecard Grid Header */}
      <View className={`${cardBg} rounded-t-xl p-3`}>
        <View className="flex-row">
          <View className={`h-4 w-12 ${bgColor} rounded mr-2`} />
          {[...Array(9)].map((_, i) => (
            <View key={i} className={`h-4 w-8 ${bgColor} rounded mx-1`} />
          ))}
        </View>
      </View>

      {/* Scorecard Grid Rows */}
      {[...Array(4)].map((_, rowIdx) => (
        <View
          key={rowIdx}
          className={`${cardBg} p-3 ${rowIdx === 3 ? 'rounded-b-xl' : ''}`}
        >
          <View className="flex-row">
            <View className={`h-4 w-12 ${bgColor} rounded mr-2`} />
            {[...Array(9)].map((_, i) => (
              <View key={i} className={`h-4 w-8 ${bgColor} rounded mx-1`} />
            ))}
          </View>
        </View>
      ))}
    </Animated.View>
  );
};

/**
 * Article/News card skeleton
 */
export const ArticleCardSkeleton = () => {
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
      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl mb-4 overflow-hidden`}
    >
      {/* Image */}
      <View className={`${bgColor} w-full h-40`} />
      <View className="p-4">
        {/* Title */}
        <View className={`h-5 ${bgColor} rounded w-full mb-2`} />
        <View className={`h-5 ${bgColor} rounded w-3/4 mb-3`} />
        {/* Description */}
        <View className={`h-4 ${bgColor} rounded w-full mb-1`} />
        <View className={`h-4 ${bgColor} rounded w-5/6 mb-3`} />
        {/* Meta row */}
        <View className="flex-row justify-between">
          <View className={`h-3 ${bgColor} rounded w-20`} />
          <View className={`h-3 ${bgColor} rounded w-24`} />
        </View>
      </View>
    </Animated.View>
  );
};

/**
 * Form/Input skeleton for forms with multiple fields
 */
export const FormSkeleton = ({ fieldCount = 4 }: { fieldCount?: number }) => {
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
    <Animated.View style={{ opacity }} className="px-4 py-4">
      {[...Array(fieldCount)].map((_, i) => (
        <View key={i} className="mb-4">
          {/* Label */}
          <View className={`h-4 ${bgColor} rounded w-24 mb-2`} />
          {/* Input */}
          <View className={`h-12 ${bgColor} rounded-lg w-full`} />
        </View>
      ))}
      {/* Submit button */}
      <View className={`h-12 ${bgColor} rounded-lg w-full mt-4`} />
    </Animated.View>
  );
};

/**
 * Player/Group card skeleton for tournament groups
 */
export const PlayerCardSkeleton = () => {
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
      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 mb-3 border ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className={`h-12 w-12 ${bgColor} rounded-full mr-3`} />
        {/* Info */}
        <View className="flex-1">
          <View className={`h-5 ${bgColor} rounded w-36 mb-2`} />
          <View className={`h-4 ${bgColor} rounded w-24`} />
        </View>
        {/* Score/Status */}
        <View className={`h-8 w-16 ${bgColor} rounded`} />
      </View>
    </Animated.View>
  );
};
