import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { RoundsStackParamList } from '@/types/personalRound';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { golfRoundsService } from '@/services/golfRounds';
import { coursesService } from '@/services/courses';
import { Calendar } from 'lucide-react-native';
import { FormSkeleton } from '@/components/skeletons';

type Props = NativeStackScreenProps<RoundsStackParamList, 'NewRound'>;

interface CourseLocation {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
}

interface CourseData {
  id: string;
  name: string;
  location?: CourseLocation | null;
}

interface TeeBoxData {
  id: string;
  name: string;
  gender?: string;
  color?: string;
  course_rating?: number;
  slope_rating?: number;
  total_yards?: number;
}

export default function NewRoundScreen({ navigation, route }: Props) {
  const { preselectedCourseId } = route.params || {};
  const { user, profile } = useAuth();
  const { isDark } = useTheme();
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [teeBoxes, setTeeBoxes] = useState<TeeBoxData[]>([]);
  const [selectedTeeBox, setSelectedTeeBox] = useState<TeeBoxData | null>(null);
  const [roundDate, setRoundDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const bgColor = isDark ? '#1e2226' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1e2226';
  const secondaryColor = isDark ? '#adb5bd' : '#6c757d';
  const inputBg = isDark ? '#2b3137' : '#f8f9fa';
  const borderColor = isDark ? '#343a40' : '#dee2e6';

  useEffect(() => {
    initializeCourse();
  }, []);

  const capitalizeFirstLetter = (str?: string) => {
    if (!str) return ''; // Handle empty or null strings
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const initializeCourse = useCallback(async () => {
    try {
      setLoading(true);
      let courseId: string | null = null;

      // Priority 1: Use preselected course ID if provided
      if (preselectedCourseId) {
        courseId = preselectedCourseId;
      }
      // Priority 2: Use user's home course if available
      else if (profile?.home_course_id) {
        courseId = profile.home_course_id;
      }

      if (courseId) {
        // Fetch the specific course
        const courseResponse = await coursesService.fetchCourseById(courseId);
        if (courseResponse.data) {
          const course: CourseData = {
            id: courseResponse.data.id,
            name: courseResponse.data.name,
            location: courseResponse.data.location as CourseLocation | null,
          };
          setSelectedCourse(course);

          // Fetch tee boxes for the course
          await loadTeeBoxes(courseId);
        }
      }
    } catch (error) {
      console.error('Error initializing course:', error);
    } finally {
      setLoading(false);
    }
  }, [preselectedCourseId, profile]);

  const loadTeeBoxes = useCallback(async (courseId: string) => {
    try {
      const response = await coursesService.fetchCourseTeeBoxes(courseId);
      if (response.data) {
        const boxes = (response.data as any[]).map((box) => ({
          id: box.id,
          name: box.name,
          color: box.color,
          gender: capitalizeFirstLetter(box.gender),
          course_rating: box.course_rating,
          slope_rating: box.slope_rating,
          total_yards: box.total_yards,
        }));

        setTeeBoxes(boxes);
        setSelectedTeeBox(boxes[0] || null);
      }
    } catch (error) {
      console.error('Error loading tee boxes:', error);
    }
  }, []);

  const handleCreateRound = useCallback(async () => {
    if (!user?.id || !selectedCourse || !selectedTeeBox) {
      console.error('Missing required fields');
      return;
    }

    try {
      setCreating(true);
      const response = await golfRoundsService.createGolfRound(
        user.id,
        selectedCourse.id,
        selectedTeeBox.id,
        roundDate
      );

      if (response.error) {
        console.error('Error creating round:', response.error);
        return;
      }

      if (response.data?.id) {
        navigation.navigate('PersonalScorecard', { roundId: response.data.id });
      }
    } catch (error) {
      console.error('Error in handleCreateRound:', error);
    } finally {
      setCreating(false);
    }
  }, [user?.id, selectedCourse, selectedTeeBox, roundDate, navigation]);

  if (loading) {
    return (
      <View
        className="flex-1"
        style={{ backgroundColor: bgColor }}
      >
        <FormSkeleton fieldCount={3} />
      </View>
    );
  }
  

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          className="text-2xl font-bold mb-6"
          style={{ color: textColor }}
        >
          Start a New Round
        </Text>

        {/* Course Info */}
        {selectedCourse && (
          <View className="mb-6">
            <Text
                className="font-semibold text-base mb-1"
                style={{ color: textColor }}
              >
                {selectedCourse.name}
              </Text>
            {selectedCourse.location && (
                <Text
                  className="text-sm"
                  style={{ color: secondaryColor }}
                >
                  {selectedCourse.location.address}
                </Text>
              )}
          </View>
        )}

        {/* Tee Box Selection */}
        {selectedCourse && teeBoxes.length > 0 && (
          <View className="mb-6">
            <Text
              className="text-sm font-semibold mb-2"
              style={{ color: textColor }}
            >
              Tee Box
            </Text>
            <View>
              {teeBoxes.map((box) => (
                <TouchableOpacity
                  key={box.id}
                  onPress={() => setSelectedTeeBox(box)}
                  className="mb-2 rounded-lg border px-4 py-3 flex-row items-center"
                  style={{
                    backgroundColor: selectedTeeBox?.id === box.id ? '#2d7a4e' : inputBg,
                    borderColor: selectedTeeBox?.id === box.id ? '#2d7a4e' : borderColor,
                  }}
                >
                  {box.color && (
                    <View
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: box.color }}
                    />
                  )}
                  <View className="flex-1">
                    <Text
                      className="font-semibold"
                      style={{
                        color: selectedTeeBox?.id === box.id ? '#ffffff' : textColor,
                      }}
                    >
                      {box.name} {box.gender && `(${box.gender})`} 
                    </Text>
                    {box.course_rating && box.slope_rating &&  (
                      <Text
                        className="text-xs"
                        style={{
                          color:
                            selectedTeeBox?.id === box.id ? 'rgba(255,255,255,0.7)' : secondaryColor,
                        }}
                      >
                       {box.total_yards} / {box.course_rating.toFixed(1)} / {box.slope_rating}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Date Selection */}
        <View className="mb-6">
          <Text
            className="text-sm font-semibold mb-2"
            style={{ color: textColor }}
          >
            Round Date
          </Text>
          <View
            className="rounded-lg border px-4 py-3 flex-row items-center"
            style={{
              backgroundColor: inputBg,
              borderColor: borderColor,
            }}
          >
            <Calendar size={20} color="#2d7a4e" />
            <TextInput
              value={roundDate}
              onChangeText={setRoundDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={secondaryColor}
              className="flex-1 ml-3 text-base"
              style={{ color: textColor }}
            />
          </View>
        </View>

        {/* Summary */}
        {selectedCourse && selectedTeeBox && (
          <View className="rounded-lg p-4 mb-6" style={{ backgroundColor: '#f0f8f4' }}>
            <Text className="text-sm font-semibold text-gray-800 mb-2">
              Round Summary
            </Text>
            <Text className="text-sm text-gray-700">
              {selectedCourse.name} • {selectedTeeBox.name} {selectedTeeBox.gender && `(${selectedTeeBox.gender})`} 
            </Text>
            <Text className="text-sm text-gray-700">
              {new Date(roundDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        <View className="flex-1" />

        {/* Start Button */}
        <TouchableOpacity
          onPress={handleCreateRound}
          disabled={!selectedCourse || !selectedTeeBox || creating}
          className="rounded-lg py-4 px-6 items-center"
          style={{
            backgroundColor: selectedCourse && selectedTeeBox ? '#2d7a4e' : '#cccccc',
          }}
        >
          {creating ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Start Round
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
