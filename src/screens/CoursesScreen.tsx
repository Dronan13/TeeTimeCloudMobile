import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CoursesStackParamList, Course } from '@/types';
import { coursesService } from '@/services/courses';
import { useTheme } from '@/contexts/ThemeContext';
import { styles as globalStyles } from '@/utils/styles';
import { MapPin, Phone, Mail, ChevronRight, Flag, X } from 'lucide-react-native';
import { CourseCardSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/EmptyState';
import FloatingActionButton from '@/components/FloatingActionButton';

type CoursesScreenNavigationProp = StackNavigationProp<
  CoursesStackParamList,
  'CoursesList'
>;

interface CoursesScreenProps {
  navigation: CoursesScreenNavigationProp;
}

export default function CoursesScreen({ navigation }: CoursesScreenProps) {
  const { isDark } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (query?: string) => {
    try {
      setError(null);
      const { data, error: fetchError } = await coursesService.fetchCourses(query);

      if (fetchError) {
        setError('Failed to load courses. Please try again.');
        console.error('Error fetching courses:', fetchError);
      } else if (data) {
        setCourses(data);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      setLoading(true);
      fetchCourses(text);
    },
    [fetchCourses]
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourses(searchQuery);
  }, [fetchCourses, searchQuery]);

  const handleCoursePress = useCallback(
    (courseId: string) => {
      navigation.navigate('CourseDetail', { courseId });
    },
    [navigation]
  );

  const getLocationAddress = (location: unknown): string | null => {
    if (!location || typeof location !== 'object') return null;
    const loc = location as { city?: string; state?: string };
    if (!loc.city && !loc.state) return null;
    return `${loc.city || ''}${loc.city && loc.state ? ', ' : ''}${loc.state || ''}`;
  };

  const renderCourseItem = ({ item }: { item: Course }) => {
    const locationAddress = getLocationAddress(item.location);
    const imageUrl =
      item.image_url || 'https://via.placeholder.com/150x150?text=Golf+Course';

    return (
      <TouchableOpacity
        style={[styles.courseCard, isDark && styles.courseCardDark]}
        onPress={() => handleCoursePress(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.courseInfo, isDark && styles.courseInfoDark]}>
          <Text style={[styles.courseName, isDark && styles.courseNameDark]} numberOfLines={1}>
            {item.name}
          </Text>
          {locationAddress && (
            <View style={styles.courseRow}>
              <MapPin size={14} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={2} />
              <Text style={[styles.courseLocation, isDark && styles.courseLocationDark]} numberOfLines={2}>
                {locationAddress}
              </Text>
            </View>
          )}
        </View>
        <View style={[styles.courseArrowContainer, isDark && styles.courseArrowContainerDark]}>
          <ChevronRight size={24} color="#2d7a4e" strokeWidth={2} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      icon={<Flag size={64} color={isDark ? '#6b7280' : '#9ca3af'} />}
      title={searchQuery ? 'No courses found' : 'No courses available'}
      description={
        searchQuery
          ? 'Try adjusting your search query'
          : 'Check back later for available courses'
      }
    />
  );

  const renderLoadingState = () => (
    <View style={styles.listContainer}>
      <CourseCardSkeleton />
      <CourseCardSkeleton />
      <CourseCardSkeleton />
      <CourseCardSkeleton />
      <CourseCardSkeleton />
    </View>
  );

  if (error && !refreshing) {
    return (
      <View style={[styles.centerContainer, isDark && styles.centerContainerDark]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>{error}</Text>
        <TouchableOpacity
          style={globalStyles.button}
          onPress={() => fetchCourses(searchQuery)}
        >
          <Text style={globalStyles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
        <TextInput
          style={[styles.searchInput, isDark && styles.searchInputDark]}
          placeholder="Search courses by name..."
          placeholderTextColor={isDark ? '#adb5bd' : '#868e96'}
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => handleSearch('')}>
            <X size={16} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {loading && !refreshing ? (
        renderLoadingState()
      ) : (
        <FlatList
          data={courses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            courses.length === 0 ? styles.emptyListContainer : styles.listContainer,
            { paddingBottom: 80 },
          ]}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#2d7a4e"
              colors={['#2d7a4e']}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <FloatingActionButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d6db',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#212529',
  },
  clearButton: {
    position: 'absolute',
    right: 24,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#868e96',
    borderRadius: 14,
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  courseImage: {
    width: '25%',
    minHeight: 120,
    backgroundColor: '#d1d6db',
  },
  courseInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 6,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseLocation: {
    fontSize: 13,
    color: '#868e96',
    flex: 1,
  },
  coursePhone: {
    fontSize: 13,
    color: '#868e96',
  },
  courseEmail: {
    fontSize: 13,
    color: '#868e96',
  },
  courseDescription: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18,
    marginTop: 4,
  },
  courseArrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#868e96',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#868e96',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 15,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  // Dark mode styles
  containerDark: {
    backgroundColor: '#1a1d21',
  },
  centerContainerDark: {
    backgroundColor: '#1a1d21',
  },
  searchContainerDark: {
    backgroundColor: '#2b3137',
    borderBottomColor: '#343a40',
  },
  searchInputDark: {
    backgroundColor: '#343a40',
    color: '#f8f9fa',
  },
  courseCardDark: {
    backgroundColor: '#2b3137',
    borderColor: '#343a40',
  },
  courseInfoDark: {
    backgroundColor: '#2b3137',
  },
  courseNameDark: {
    color: '#f8f9fa',
  },
  courseLocationDark: {
    color: '#adb5bd',
  },
  coursePhoneDark: {
    color: '#adb5bd',
  },
  courseEmailDark: {
    color: '#adb5bd',
  },
  courseArrowContainerDark: {
    backgroundColor: '#2b3137',
  },
  emptyStateDark: {
    backgroundColor: '#1a1d21',
  },
  emptyStateTitleDark: {
    color: '#f8f9fa',
  },
  emptyStateTextDark: {
    color: '#adb5bd',
  },
  loadingTextDark: {
    color: '#adb5bd',
  },
  errorTextDark: {
    color: '#ef4444',
  },
});
