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

  const getLocationAddress = (location: any): string | null => {
    if (!location) return null;
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      // Try common address field names
      return location.address || location.formatted_address || location.city || null;
    }
    return null;
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
        <Image source={{ uri: imageUrl }} style={styles.courseImage} resizeMode="cover" />
        <View style={[styles.courseInfo, isDark && styles.courseInfoDark]}>
          <Text style={[styles.courseName, isDark && styles.courseNameDark]} numberOfLines={1}>
            {item.name}
          </Text>
          {locationAddress && (
            <Text style={[styles.courseLocation, isDark && styles.courseLocationDark]} numberOfLines={3}>
              📍 {locationAddress}
            </Text>
          )}
          {item.phone && (
            <Text style={[styles.coursePhone, isDark && styles.coursePhoneDark]} numberOfLines={1}>
              📞 {item.phone}
            </Text>
          )}
          {item.email && (
            <Text style={[styles.courseEmail, isDark && styles.courseEmailDark]} numberOfLines={1}>
              📧 {item.email}
            </Text>
          )}
        </View>
        <View style={[styles.courseArrowContainer, isDark && styles.courseArrowContainerDark]}>
          <Text style={styles.courseArrow}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
      <Text style={styles.emptyStateIcon}>⛳</Text>
      <Text style={[styles.emptyStateTitle, isDark && styles.emptyStateTitleDark]}>
        {searchQuery ? 'No courses found' : 'No courses available'}
      </Text>
      <Text style={[styles.emptyStateText, isDark && styles.emptyStateTextDark]}>
        {searchQuery
          ? 'Try adjusting your search query'
          : 'Check back later for available courses'}
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.centerContainer, isDark && styles.centerContainerDark]}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>Loading courses...</Text>
      </View>
    );
  }

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
          placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={[styles.clearButton, isDark && styles.clearButtonDark]} onPress={() => handleSearch('')}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          courses.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#22c55e"
            colors={['#22c55e']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    position: 'absolute',
    right: 24,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d1d5db',
    borderRadius: 14,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  courseImage: {
    width: '25%',
    minHeight: 120,
    backgroundColor: '#e5e7eb',
  },
  courseInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  courseLocation: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 3,
  },
  coursePhone: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 3,
  },
  courseEmail: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 3,
  },
  courseDescription: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    marginTop: 4,
  },
  courseArrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  courseArrow: {
    fontSize: 28,
    color: '#22c55e',
    fontWeight: '300',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  // Dark mode styles
  containerDark: {
    backgroundColor: '#111827',
  },
  centerContainerDark: {
    backgroundColor: '#111827',
  },
  searchContainerDark: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  searchInputDark: {
    backgroundColor: '#374151',
    color: '#f9fafb',
  },
  clearButtonDark: {
    backgroundColor: '#4b5563',
  },
  courseCardDark: {
    backgroundColor: '#1f2937',
  },
  courseInfoDark: {
    backgroundColor: '#1f2937',
  },
  courseNameDark: {
    color: '#f9fafb',
  },
  courseLocationDark: {
    color: '#9ca3af',
  },
  coursePhoneDark: {
    color: '#9ca3af',
  },
  courseEmailDark: {
    color: '#9ca3af',
  },
  courseArrowContainerDark: {
    backgroundColor: '#1f2937',
  },
  emptyStateDark: {
    backgroundColor: '#111827',
  },
  emptyStateTitleDark: {
    color: '#f9fafb',
  },
  emptyStateTextDark: {
    color: '#9ca3af',
  },
  loadingTextDark: {
    color: '#9ca3af',
  },
  errorTextDark: {
    color: '#ef4444',
  },
});
