import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Flag } from 'lucide-react-native';
import { CoursesStackParamList, CourseWithDetails, CourseEvent } from '@/types';
import { coursesService } from '@/services/courses';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DetailSkeleton } from '@/components/skeletons';
import {
  CourseGallery,
  CourseHeader,
  CourseActionButtons,
  CourseDescription,
  CourseAmenities,
  CourseContact,
  CourseSocial,
  CourseEvents,
  ImageModal,
  courseDetailStyles,
} from '@/components/course-detail';

type CourseDetailScreenNavigationProp = StackNavigationProp<
  CoursesStackParamList,
  'CourseDetail'
>;
type CourseDetailScreenRouteProp = RouteProp<CoursesStackParamList, 'CourseDetail'>;

interface CourseDetailScreenProps {
  navigation: CourseDetailScreenNavigationProp;
  route: CourseDetailScreenRouteProp;
}

export default function CourseDetailScreen({
  navigation,
  route,
}: CourseDetailScreenProps) {
  const { courseId } = route.params;
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [course, setCourse] = useState<CourseWithDetails | null>(null);
  const [events, setEvents] = useState<CourseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [courseResult, eventsResult] = await Promise.all([
        coursesService.fetchCourseById(courseId),
        coursesService.fetchCourseEvents(courseId),
      ]);

      if (courseResult.error) {
        setError(t('courses.errorLoadDetails'));
        console.error('Error fetching course:', courseResult.error);
      } else if (courseResult.data) {
        setCourse(courseResult.data);
      }

      if (eventsResult.data) {
        setEvents(eventsResult.data);
      }
    } catch (err) {
      setError(t('courses.errorUnexpected'));
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReserveTeeTime = useCallback(() => {
    if (course) {
      navigation.navigate('CourseTeeTimesScreen', {
        courseId: course.id,
        courseName: course.name,
      });
    }
  }, [course, navigation]);

  const handleStartRound = useCallback(() => {
    if (course) {
      // Navigate to Rounds tab and then to NewRound screen
      // @ts-ignore - navigation.getParent() is valid but TypeScript doesn't know about it
      const tabNavigator = navigation.getParent();
      if (tabNavigator) {
        tabNavigator.navigate('Rounds', {
          screen: 'NewRound',
          params: { preselectedCourseId: course.id },
        });
      }
    }
  }, [course, navigation]);

  const handleImagePress = useCallback((imageUrl: string) => {
    setFullscreenImageUrl(imageUrl);
    setIsImageModalVisible(true);
  }, []);

  const handleCloseImageModal = useCallback(() => {
    setIsImageModalVisible(false);
    setTimeout(() => setFullscreenImageUrl(null), 300);
  }, []);

  if (loading) {
    return (
      <View style={[courseDetailStyles.container, isDark && courseDetailStyles.containerDark]}>
        <DetailSkeleton />
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={[courseDetailStyles.centerContainer, isDark && courseDetailStyles.centerContainerDark]}>
        <Flag size={64} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={1.5} />
        <Text style={[courseDetailStyles.errorText, isDark && courseDetailStyles.errorTextDark]}>
          {error || t('courses.notFound')}
        </Text>
        <TouchableOpacity style={courseDetailStyles.retryButton} onPress={fetchCourseDetails}>
          <Text style={courseDetailStyles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const galleryImages =
    course.gallery && course.gallery.length > 0
      ? course.gallery
      : course.image_url
        ? [{
            image_url: course.image_url,
            id: 'main',
            alt_text: null,
            caption: null,
            course_id: course.id,
            created_at: null,
            sort_order: null,
            updated_at: null,
          }]
        : [];

  return (
    <>
      <ScrollView
        style={[courseDetailStyles.container, isDark && courseDetailStyles.containerDark]}
        showsVerticalScrollIndicator={false}
      >
        <CourseGallery images={galleryImages} onImagePress={handleImagePress} />

        <CourseHeader name={course.name} rating={course.rating} holes={course.holes} />

        <CourseActionButtons
          onReserveTeeTime={handleReserveTeeTime}
          onStartRound={handleStartRound}
        />

        {course.description && <CourseDescription description={course.description} />}

        <CourseAmenities amenities={course.amenities || []} />

        <CourseContact
          phone={course.phone}
          email={course.email}
          siteUrl={course.site_url}
          operatingHours={course.operating_hours}
        />

        <CourseSocial facebook={course.facebook} instagram={course.instagram} />

        <CourseEvents events={events} onImagePress={handleImagePress} />

        <View style={courseDetailStyles.bottomSpacing} />
      </ScrollView>

      <ImageModal
        visible={isImageModalVisible}
        imageUrl={fullscreenImageUrl}
        onClose={handleCloseImageModal}
      />
    </>
  );
}
