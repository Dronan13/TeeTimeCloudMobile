import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Linking,
  FlatList,
  Modal,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { CoursesStackParamList, CourseWithDetails, CourseEvent } from '@/types';
import { coursesService } from '@/services/courses';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const [course, setCourse] = useState<CourseWithDetails | null>(null);
  const [events, setEvents] = useState<CourseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
        setError('Failed to load course details');
        console.error('Error fetching course:', courseResult.error);
      } else if (courseResult.data) {
        setCourse(courseResult.data);
      }

      if (eventsResult.data) {
        setEvents(eventsResult.data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
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

  const handlePhonePress = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  const handleEmailPress = useCallback((email: string) => {
    Linking.openURL(`mailto:${email}`);
  }, []);

  const handleWebsitePress = useCallback((url: string) => {
    Linking.openURL(url);
  }, []);

  const handleEventPress = useCallback((event: CourseEvent) => {
    // Could navigate to event details or open registration URL
    if (event.registration_url) {
      Linking.openURL(event.registration_url);
    }
  }, []);

  const handleImagePress = useCallback((imageUrl: string) => {
    setFullscreenImageUrl(imageUrl);
    setIsImageModalVisible(true);
  }, []);

  const handleCloseImageModal = useCallback(() => {
    setIsImageModalVisible(false);
    setTimeout(() => setFullscreenImageUrl(null), 300);
  }, []);

  const renderGalleryItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => handleImagePress(item.image_url)}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.galleryImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderEventItem = ({ item }: { item: CourseEvent }) => {
    const startDate = new Date(item.start_at);
    const formattedDate = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        style={[styles.eventCard, isDark && styles.eventCardDark]}
        onPress={() => handleEventPress(item)}
        activeOpacity={0.7}
      >
        {item.image_url && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleImagePress(item.image_url!);
            }}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: item.image_url }}
              style={styles.eventImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        <View style={styles.eventInfo}>
          <Text style={[styles.eventTitle, isDark && styles.eventTitleDark]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.eventDate, isDark && styles.eventDateDark]}>
            📅 {formattedDate} at {formattedTime}
          </Text>
          {item.location && (
            <Text style={[styles.eventLocation, isDark && styles.eventLocationDark]} numberOfLines={1}>
              📍 {item.location}
            </Text>
          )}
          {item.price !== null && item.price > 0 && (
            <Text style={styles.eventPrice}>💰 ${item.price.toFixed(2)}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderAmenity = (amenity: string, index: number) => (
    <View key={index} style={styles.amenityChip}>
      <Text style={styles.amenityText}>{amenity}</Text>
    </View>
  );

  const getOperatingHoursText = (operatingHours: any): string => {
    if (!operatingHours) return 'Hours not available';
    if (typeof operatingHours === 'string') return operatingHours;
    if (typeof operatingHours === 'object') {
      // Try to format common structures
      const today = new Date()
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase();
      if (operatingHours[today]) {
        return `Today: ${operatingHours[today]}`;
      }
      return 'See website for hours';
    }
    return 'Hours not available';
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, isDark && styles.centerContainerDark]}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>Loading course details...</Text>
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={[styles.centerContainer, isDark && styles.centerContainerDark]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error || 'Course not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCourseDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const galleryImages =
    course.gallery && course.gallery.length > 0
      ? course.gallery
      : course.image_url
        ? [{ image_url: course.image_url, id: 'main' }]
        : [];

  return (
    <>
      <ScrollView style={[styles.container, isDark && styles.containerDark]} showsVerticalScrollIndicator={false}>
        {/* Gallery Carousel */}
        {galleryImages.length > 0 && (
          <View style={styles.galleryContainer}>
            <FlatList
              data={galleryImages}
              renderItem={renderGalleryItem}
              keyExtractor={(item, index) => item.id || `image-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / SCREEN_WIDTH
                );
                setCurrentImageIndex(index);
              }}
            />
            {galleryImages.length > 1 && (
              <View style={styles.paginationDots}>
                {galleryImages.map((_, index) => (
                  <View
                    key={index}
                    style={[styles.dot, index === currentImageIndex && styles.activeDot]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Course Header */}
        <View style={[styles.headerSection, isDark && styles.headerSectionDark]}>
          <Text style={[styles.courseName, isDark && styles.courseNameDark]}>{course.name}</Text>

          {/* Rating */}
          {course.rating !== null && course.rating > 0 && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingStars}>
                {'⭐'.repeat(Math.round(course.rating))}
              </Text>
              <Text style={[styles.ratingText, isDark && styles.ratingTextDark]}>{course.rating.toFixed(1)}</Text>
            </View>
          )}

          {/* Holes Info */}
          {course.holes && <Text style={[styles.holesInfo, isDark && styles.holesInfoDark]}>🏌️ {course.holes} Holes</Text>}
        </View>

        {/* Reserve Button */}
        <View style={[styles.reserveSection, isDark && styles.reserveSectionDark]}>
          <TouchableOpacity
            style={styles.reserveButton}
            onPress={handleReserveTeeTime}
            activeOpacity={0.8}
          >
            <Text style={styles.reserveButtonText}>⛳ Reserve Tee Time</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        {course.description && (
          <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>About</Text>
            <Text style={[styles.description, isDark && styles.descriptionDark]}>{course.description}</Text>
          </View>
        )}

        {/* Amenities */}
        {course.amenities && course.amenities.length > 0 && (
          <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {course.amenities.map((amenity, index) => renderAmenity(amenity, index))}
            </View>
          </View>
        )}

        {/* Contact Information */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Contact Information</Text>

          {course.phone && (
            <TouchableOpacity
              style={[styles.contactItem, isDark && styles.contactItemDark]}
              onPress={() => handlePhonePress(course.phone!)}
            >
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={[styles.contactText, isDark && styles.contactTextDark]}>{course.phone}</Text>
            </TouchableOpacity>
          )}

          {course.email && (
            <TouchableOpacity
              style={[styles.contactItem, isDark && styles.contactItemDark]}
              onPress={() => handleEmailPress(course.email!)}
            >
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={[styles.contactText, isDark && styles.contactTextDark]}>{course.email}</Text>
            </TouchableOpacity>
          )}

          {course.site_url && (
            <TouchableOpacity
              style={[styles.contactItem, isDark && styles.contactItemDark]}
              onPress={() => handleWebsitePress(course.site_url!)}
            >
              <Text style={styles.contactIcon}>🌐</Text>
              <Text style={[styles.contactText, isDark && styles.contactTextDark]}>Visit Website</Text>
            </TouchableOpacity>
          )}

          {/* Operating Hours */}
          {course.operating_hours && (
            <View style={[styles.contactItem, isDark && styles.contactItemDark]}>
              <Text style={styles.contactIcon}>🕒</Text>
              <Text style={[styles.contactText, isDark && styles.contactTextDark]}>
                {getOperatingHoursText(course.operating_hours)}
              </Text>
            </View>
          )}
        </View>

        {/* Social Media */}
        {(course.facebook || course.instagram) && (
          <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Follow Us</Text>
            <View style={styles.socialContainer}>
              {course.facebook && (
                <TouchableOpacity
                  style={[styles.socialButton, isDark && styles.socialButtonDark]}
                  onPress={() => handleWebsitePress(course.facebook!)}
                >
                  <Text style={[styles.socialButtonText, isDark && styles.socialButtonTextDark]}>📘 Facebook</Text>
                </TouchableOpacity>
              )}
              {course.instagram && (
                <TouchableOpacity
                  style={[styles.socialButton, isDark && styles.socialButtonDark]}
                  onPress={() => handleWebsitePress(course.instagram!)}
                >
                  <Text style={[styles.socialButtonText, isDark && styles.socialButtonTextDark]}>📷 Instagram</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Upcoming Events */}
        {events.length > 0 && (
          <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Upcoming Events</Text>
            {events.map((event) => (
              <View key={event.id}>{renderEventItem({ item: event })}</View>
            ))}
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fullscreen Image Modal */}
      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseImageModal}
      >
        <View style={styles.modalContainer}>
          <StatusBar barStyle="light-content" />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={handleCloseImageModal}
            activeOpacity={0.8}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalImageContainer}
            activeOpacity={1}
            onPress={handleCloseImageModal}
          >
            {fullscreenImageUrl && (
              <Image
                source={{ uri: fullscreenImageUrl }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </>
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
  },
  retryButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  galleryContainer: {
    height: 250,
    backgroundColor: '#000',
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 250,
  },
  paginationDots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headerSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  courseName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingStars: {
    fontSize: 16,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  holesInfo: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 4,
  },
  reserveSection: {
    padding: 16,
    backgroundColor: '#fff',
  },
  reserveButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  amenityChip: {
    backgroundColor: '#e0f2e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 13,
    color: '#22c55e',
    fontWeight: '600',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  contactIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },
  contactText: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  eventImage: {
    width: 100,
    height: 100,
    backgroundColor: '#e5e7eb',
  },
  eventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  eventPrice: {
    fontSize: 13,
    color: '#22c55e',
    fontWeight: '600',
    marginTop: 4,
  },
  bottomSpacing: {
    height: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
  },
  modalImageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  // Dark mode styles
  containerDark: {
    backgroundColor: '#111827',
  },
  centerContainerDark: {
    backgroundColor: '#111827',
  },
  loadingTextDark: {
    color: '#9ca3af',
  },
  headerSectionDark: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  courseNameDark: {
    color: '#f9fafb',
  },
  ratingTextDark: {
    color: '#f9fafb',
  },
  holesInfoDark: {
    color: '#9ca3af',
  },
  reserveSectionDark: {
    backgroundColor: '#1f2937',
  },
  sectionDark: {
    backgroundColor: '#1f2937',
  },
  sectionTitleDark: {
    color: '#f9fafb',
  },
  descriptionDark: {
    color: '#9ca3af',
  },
  contactItemDark: {
    borderBottomColor: '#374151',
  },
  contactTextDark: {
    color: '#f9fafb',
  },
  socialButtonDark: {
    backgroundColor: '#374151',
  },
  socialButtonTextDark: {
    color: '#f9fafb',
  },
  eventCardDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
  },
  eventTitleDark: {
    color: '#f9fafb',
  },
  eventDateDark: {
    color: '#9ca3af',
  },
  eventLocationDark: {
    color: '#9ca3af',
  },
});
