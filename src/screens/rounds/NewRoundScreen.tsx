import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { RoundsStackParamList } from '@/types/personalRound';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { golfRoundsService } from '@/services/golfRounds';
import { coursesService } from '@/services/courses';
import { Calendar, ChevronDown } from 'lucide-react-native';
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
  color?: string;
  course_rating?: number;
  slope_rating?: number;
  total_yards?: number;
}

export default function NewRoundScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [teeBoxes, setTeeBoxes] = useState<TeeBoxData[]>([]);
  const [selectedTeeBox, setSelectedTeeBox] = useState<TeeBoxData | null>(null);
  const [roundDate, setRoundDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [showCourseModal, setShowCourseModal] = useState(false);

  const bgColor = isDark ? '#1e2226' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1e2226';
  const secondaryColor = isDark ? '#adb5bd' : '#6c757d';
  const inputBg = isDark ? '#2b3137' : '#f8f9fa';
  const borderColor = isDark ? '#343a40' : '#dee2e6';

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await coursesService.fetchCourses(undefined, 1, 100);
      if (response.data) {
        const coursesList = (response.data as any[]).map((course) => ({
          id: course.id,
          name: course.name,
          location: course.location,
        }));
        setCourses(coursesList);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCourseSelect = useCallback(async (course: CourseData) => {
    setSelectedCourse(course);
    setShowCourseModal(false);

    try {
      const response = await coursesService.fetchCourseTeeBoxes(course.id);
      if (response.data) {
        console.log(response.data);
        const boxes = (response.data as any[]).map((box) => ({
          id: box.id,
          name: box.name,
          color: box.color,
          course_rating: box.course_rating,
          slope_rating: box.slope_rating,
          total_yards: box.total_yards,
        }));
        setTeeBoxes(boxes);
        setSelectedTeeBox(boxes[0] || null);
      }
    } catch (error) {
      console.error('Error fetching tee boxes:', error);
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

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(courseSearch.toLowerCase())
  );

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

        {/* Course Selection */}
        <View className="mb-6">
          <Text
            className="text-sm font-semibold mb-2"
            style={{ color: textColor }}
          >
            Course
          </Text>
          <TouchableOpacity
            onPress={() => setShowCourseModal(true)}
            className="rounded-lg border px-4 py-3 flex-row justify-between items-center"
            style={{
              backgroundColor: inputBg,
              borderColor: selectedCourse ? '#2d7a4e' : borderColor,
              borderWidth: 1.5,
            }}
          >
            <Text
              className={selectedCourse ? 'font-semibold' : ''}
              style={{
                color: selectedCourse ? textColor : secondaryColor,
              }}
            >
              {selectedCourse?.name || 'Select a course'}
            </Text>
            <ChevronDown size={20} color={secondaryColor} />
          </TouchableOpacity>
        </View>

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
                      {box.name}
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
              {selectedCourse.name} • {selectedTeeBox.name}
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

      {/* Course Selection Modal */}
      <Modal
        visible={showCourseModal}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View
            className="flex-1 mt-12 rounded-t-2xl"
            style={{ backgroundColor: bgColor }}
          >
            <View className="px-4 py-4 border-b" style={{ borderColor: borderColor }}>
              <Text
                className="text-lg font-semibold mb-3"
                style={{ color: textColor }}
              >
                Select a Course
              </Text>
              <TextInput
                value={courseSearch}
                onChangeText={setCourseSearch}
                placeholder="Search courses..."
                placeholderTextColor={secondaryColor}
                className="rounded-lg px-4 py-2"
                style={{
                  backgroundColor: inputBg,
                  color: textColor,
                }}
              />
            </View>

            <FlatList
              data={filteredCourses}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleCourseSelect(item)}
                  className="border-b px-4 py-3"
                  style={{ borderColor: borderColor }}
                >
                  <Text
                    className="font-semibold mb-1"
                    style={{ color: textColor }}
                  >
                    {item.name}
                  </Text>
                  {item.location && (
                    <Text
                      className="text-sm"
                      style={{ color: secondaryColor }}
                    >
                      {item.location?.address}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Text
                    className="text-sm"
                    style={{ color: secondaryColor }}
                  >
                    No courses found
                  </Text>
                </View>
              }
            />

            <TouchableOpacity
              onPress={() => setShowCourseModal(false)}
              className="border-t px-4 py-4"
              style={{ borderColor: borderColor }}
            >
              <Text
                className="text-center font-semibold text-base"
                style={{ color: '#2d7a4e' }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
