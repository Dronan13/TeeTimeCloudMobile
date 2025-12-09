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
import { CoursesStackParamList, Course, CourseWithDistance, LocationSearchMode } from '@/types';
import { coursesService } from '@/services/courses';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { styles as globalStyles } from '@/utils/styles';
import { MapPin, Phone, Mail, ChevronRight, Flag, X, Navigation } from 'lucide-react-native';
import { CourseCardSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/EmptyState';
import { DistanceBadge } from '@/components/DistanceBadge';
import { LocationPermissionPrompt } from '@/components/LocationPermissionPrompt';
import { useLocation } from '@/hooks/useLocation';

type CoursesScreenNavigationProp = StackNavigationProp<
  CoursesStackParamList,
  'CoursesList'
>;

interface CoursesScreenProps {
  navigation: CoursesScreenNavigationProp;
}

export default function CoursesScreen({ navigation }: CoursesScreenProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [courses, setCourses] = useState<(Course | CourseWithDistance)[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<LocationSearchMode>('name');
  const [citySearch, setCitySearch] = useState('');
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  const {
    location,
    permissionStatus,
    loading: locationLoading,
    error: locationError,
    requestPermission,
    refreshLocation,
  } = useLocation();

  const fetchCourses = useCallback(async () => {
    try {
      setError(null);

      if (searchMode === 'nearMe') {
        if (!location) {
          if (permissionStatus === 'undetermined' || permissionStatus === 'denied') {
            setShowPermissionPrompt(true);
          }
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await coursesService.fetchCoursesNearLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          maxDistanceMiles: maxDistance,
          searchTerm: searchQuery || undefined,
        });

        if (fetchError) {
          setError('Failed to load nearby courses. Please try again.');
          console.error('Error fetching nearby courses:', fetchError);
        } else if (data) {
          setCourses(data);
        }
      } else if (searchMode === 'nearCity') {
        if (!citySearch.trim()) {
          setCourses([]);
          setLoading(false);
          return;
        }

        const geoResult = await coursesService.geocodeCity(citySearch);

        if (geoResult.error || !geoResult.data) {
          setError('City not found. Please try another location.');
          setCourses([]);
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await coursesService.fetchCoursesNearLocation({
          latitude: geoResult.data.latitude,
          longitude: geoResult.data.longitude,
          maxDistanceMiles: maxDistance,
          searchTerm: searchQuery || undefined,
        });

        if (fetchError) {
          setError('Failed to load courses near this city. Please try again.');
          console.error('Error fetching courses near city:', fetchError);
        } else if (data) {
          setCourses(data);
        }
      } else {
        // Name-based search (default)
        const { data, error: fetchError } = await coursesService.fetchCourses(searchQuery);

        if (fetchError) {
          setError('Failed to load courses. Please try again.');
          console.error('Error fetching courses:', fetchError);
        } else if (data) {
          setCourses(data);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchMode, location, citySearch, maxDistance, searchQuery, permissionStatus]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (searchMode === 'nearMe' && permissionStatus === 'granted' && !location) {
      refreshLocation();
    }
  }, [searchMode, permissionStatus, location, refreshLocation]);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      setLoading(true);
    },
    []
  );

  const handleCitySearch = useCallback((text: string) => {
    setCitySearch(text);
    setLoading(true);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    if (searchMode === 'nearMe' && !location) {
      refreshLocation();
    }
    fetchCourses();
  }, [searchMode, location, refreshLocation, fetchCourses]);

  const handleCoursePress = useCallback(
    (courseId: string) => {
      navigation.navigate('CourseDetail', { courseId });
    },
    [navigation]
  );

  const handleModeChange = useCallback((mode: LocationSearchMode) => {
    setSearchMode(mode);
    setLoading(true);
    setError(null);
    setShowPermissionPrompt(false);
  }, []);

  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowPermissionPrompt(false);
      await refreshLocation();
      setLoading(true);
    }
  }, [requestPermission, refreshLocation]);

  const handleDismissPermissionPrompt = useCallback(() => {
    setShowPermissionPrompt(false);
    setSearchMode('name');
  }, []);

  const getLocationAddress = (item: Course): string | null => {
    return `${item.city}, ${item.state}, ${item.country}`;
  };

  const isDistanceCourse = (course: Course | CourseWithDistance): course is CourseWithDistance => {
    return 'distance_miles' in course;
  };

  const renderCourseItem = ({ item }: { item: Course | CourseWithDistance }) => {
    const locationAddress = getLocationAddress(item);
    const hasDistance = isDistanceCourse(item);

    return (
      <TouchableOpacity
        style={[styles.courseCard, isDark && styles.courseCardDark]}
        onPress={() => handleCoursePress(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.courseInfo, isDark && styles.courseInfoDark]}>
          <View style={styles.courseHeader}>
            <Text style={[styles.courseName, isDark && styles.courseNameDark]} numberOfLines={1}>
              {item.name}
            </Text>
            {hasDistance && <DistanceBadge distanceMiles={item.distance_miles} />}
          </View>
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

  const renderEmptyState = () => {
    if (searchMode === 'nearMe' && !location) {
      return null;
    }

    return (
      <EmptyState
        icon={<Flag size={64} color={isDark ? '#6b7280' : '#9ca3af'} />}
        title={
          searchMode !== 'name'
            ? t('location.noCoursesNearby')
            : searchQuery
            ? 'No courses found'
            : 'No courses available'
        }
        description={
          searchMode !== 'name'
            ? t('location.adjustRadius')
            : searchQuery
            ? 'Try adjusting your search query'
            : 'Check back later for available courses'
        }
      />
    );
  };

  const renderLoadingState = () => (
    <View style={styles.listContainer}>
      <CourseCardSkeleton />
      <CourseCardSkeleton />
      <CourseCardSkeleton />
      <CourseCardSkeleton />
      <CourseCardSkeleton />
    </View>
  );

  const renderSearchModeToggle = () => (
    <View style={[styles.modeToggleContainer, isDark && styles.modeToggleContainerDark]}>
      <TouchableOpacity
        style={[
          styles.modeButton,
          searchMode === 'name' && styles.modeButtonActive,
          isDark && searchMode !== 'name' && styles.modeButtonDark,
        ]}
        onPress={() => handleModeChange('name')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.modeButtonText,
            searchMode === 'name' && styles.modeButtonTextActive,
            isDark && searchMode !== 'name' && styles.modeButtonTextDark,
          ]}
        >
          {t('location.searchByName')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.modeButton,
          searchMode === 'nearMe' && styles.modeButtonActive,
          isDark && searchMode !== 'nearMe' && styles.modeButtonDark,
        ]}
        onPress={() => handleModeChange('nearMe')}
        activeOpacity={0.7}
      >
        <Navigation size={14} color={searchMode === 'nearMe' ? '#fff' : isDark ? '#adb5bd' : '#868e96'} />
        <Text
          style={[
            styles.modeButtonText,
            searchMode === 'nearMe' && styles.modeButtonTextActive,
            isDark && searchMode !== 'nearMe' && styles.modeButtonTextDark,
          ]}
        >
          {t('location.nearMe')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.modeButton,
          searchMode === 'nearCity' && styles.modeButtonActive,
          isDark && searchMode !== 'nearCity' && styles.modeButtonDark,
        ]}
        onPress={() => handleModeChange('nearCity')}
        activeOpacity={0.7}
      >
        <MapPin size={14} color={searchMode === 'nearCity' ? '#fff' : isDark ? '#adb5bd' : '#868e96'} />
        <Text
          style={[
            styles.modeButtonText,
            searchMode === 'nearCity' && styles.modeButtonTextActive,
            isDark && searchMode !== 'nearCity' && styles.modeButtonTextDark,
          ]}
        >
          {t('location.nearCity')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (error && !refreshing) {
    return (
      <View style={[styles.centerContainer, isDark && styles.centerContainerDark]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>{error}</Text>
        <TouchableOpacity style={globalStyles.button} onPress={() => fetchCourses()}>
          <Text style={globalStyles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {renderSearchModeToggle()}

      <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
        {searchMode === 'nearCity' ? (
          <TextInput
            style={[styles.searchInput, isDark && styles.searchInputDark]}
            placeholder={t('location.enterCity')}
            placeholderTextColor={isDark ? '#adb5bd' : '#868e96'}
            value={citySearch}
            onChangeText={handleCitySearch}
            autoCapitalize="words"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        ) : (
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
        )}
        {(searchQuery.length > 0 || citySearch.length > 0) && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              if (searchMode === 'nearCity') {
                handleCitySearch('');
              } else {
                handleSearch('');
              }
            }}
          >
            <X size={16} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {showPermissionPrompt && (
        <LocationPermissionPrompt
          onRequestPermission={handleRequestPermission}
          onDismiss={handleDismissPermissionPrompt}
          permissionStatus={permissionStatus === 'denied' ? 'denied' : 'undetermined'}
        />
      )}

      {locationLoading && searchMode === 'nearMe' && (
        <View style={[styles.locationLoadingContainer, isDark && styles.locationLoadingContainerDark]}>
          <ActivityIndicator size="small" color="#2d7a4e" />
          <Text style={[styles.locationLoadingText, isDark && styles.locationLoadingTextDark]}>
            {t('location.loading')}
          </Text>
        </View>
      )}

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
  modeToggleContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d6db',
  },
  modeToggleContainerDark: {
    backgroundColor: '#2b3137',
    borderBottomColor: '#343a40',
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
    gap: 4,
  },
  modeButtonDark: {
    backgroundColor: '#343a40',
  },
  modeButtonActive: {
    backgroundColor: '#2d7a4e',
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#868e96',
  },
  modeButtonTextDark: {
    color: '#adb5bd',
  },
  modeButtonTextActive: {
    color: '#fff',
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
  locationLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#e8f5e9',
    gap: 8,
  },
  locationLoadingContainerDark: {
    backgroundColor: '#1e4620',
  },
  locationLoadingText: {
    fontSize: 14,
    color: '#2d7a4e',
  },
  locationLoadingTextDark: {
    color: '#90ee90',
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
  courseInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 6,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2,
  },
  courseName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
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
  courseArrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
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
  courseArrowContainerDark: {
    backgroundColor: '#2b3137',
  },
  errorTextDark: {
    color: '#ef4444',
  },
});
