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
import { Phone, Mail, Globe, Clock, Flag, MapPin, Calendar, DollarSign, X, Star, Facebook, Instagram } from 'lucide-react-native';

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
          <View style={styles.eventRow}>
            <Calendar size={12} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={2} />
            <Text style={[styles.eventDate, isDark && styles.eventDateDark]}>
              {formattedDate} at {formattedTime}
            </Text>
          </View>
          {item.location && (
            <View style={styles.eventRow}>
              <MapPin size={12} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={2} />
              <Text style={[styles.eventLocation, isDark && styles.eventLocationDark]} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          )}
          {item.price !== null && item.price > 0 && (
            <View style={styles.eventRow}>
              <DollarSign size={12} color="#2d7a4e" strokeWidth={2} />
              <Text style={styles.eventPrice}>${item.price.toFixed(2)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderAmenity = (amenity: string, index: number) => (
    <View key={index} style={[styles.amenityChip, isDark && styles.amenityChipDark]}>
      <Text style={[styles.amenityText, isDark && styles.amenityTextDark]}>{amenity}</Text>
    </View>
  );

  const getOperatingHoursText = (operatingHours: any): string => {
    if (!operatingHours) return 'Hours not available';
    if (typeof operatingHours === 'string') return operatingHours;
    if (typeof operatingHours === 'object') {
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
        <ActivityIndicator size="large" color="#2d7a4e" />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>Loading course details...</Text>
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={[styles.centerContainer, isDark && styles.centerContainerDark]}>
        <Flag size={64} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={1.5} />
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>{error || 'Course not found'}</Text>
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
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  color={index < Math.round(course.rating!) ? '#f59e0b' : '#d1d6db'}
                  fill={index < Math.round(course.rating!) ? '#f59e0b' : 'transparent'}
                  strokeWidth={2}
                />
              ))}
              <Text style={[styles.ratingText, isDark && styles.ratingTextDark]}>{course.rating.toFixed(1)}</Text>
            </View>
          )}

          {/* Holes Info */}
          {course.holes && (
            <View style={styles.holesRow}>
              <Flag size={16} color={isDark ? '#adb5bd' : '#495057'} strokeWidth={2} />
              <Text style={[styles.holesInfo, isDark && styles.holesInfoDark]}>{course.holes} Holes</Text>
            </View>
          )}
        </View>

        {/* Reserve Button */}
        <View style={[styles.reserveSection, isDark && styles.reserveSectionDark]}>
          <TouchableOpacity
            style={styles.reserveButton}
            onPress={handleReserveTeeTime}
            activeOpacity={0.8}
          >
            <Flag size={20} color="#fff" strokeWidth={2} />
            <Text style={styles.reserveButtonText}>Reserve Tee Time</Text>
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
              <Phone size={20} color="#2d7a4e" strokeWidth={2} />
              <Text style={[styles.contactText, isDark && styles.contactTextDark]}>{course.phone}</Text>
            </TouchableOpacity>
          )}

          {course.email && (
            <TouchableOpacity
              style={[styles.contactItem, isDark && styles.contactItemDark]}
              onPress={() => handleEmailPress(course.email!)}
            >
              <Mail size={20} color="#2d7a4e" strokeWidth={2} />
              <Text style={[styles.contactText, isDark && styles.contactTextDark]}>{course.email}</Text>
            </TouchableOpacity>
          )}

          {course.site_url && (
            <TouchableOpacity
              style={[styles.contactItem, isDark && styles.contactItemDark]}
              onPress={() => handleWebsitePress(course.site_url!)}
            >
              <Globe size={20} color="#2d7a4e" strokeWidth={2} />
              <Text style={[styles.contactText, isDark && styles.contactTextDark]}>Visit Website</Text>
            </TouchableOpacity>
          )}

          {/* Operating Hours */}
          {course.operating_hours && (
            <View style={[styles.contactItem, isDark && styles.contactItemDark]}>
              <Clock size={20} color="#2d7a4e" strokeWidth={2} />
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
                  style={[styles.socialButton, styles.facebookButton, isDark && styles.socialButtonDark]}
                  onPress={() => handleWebsitePress(course.facebook!)}
                >
                  <Facebook size={18} color={isDark ? '#f8f9fa' : '#212529'} strokeWidth={2} />
                  <Text style={[styles.socialButtonText, isDark && styles.socialButtonTextDark]}>Facebook</Text>
                </TouchableOpacity>
              )}
              {course.instagram && (
                <TouchableOpacity
                  style={[styles.socialButton, styles.instagramButton, isDark && styles.socialButtonDark]}
                  onPress={() => handleWebsitePress(course.instagram!)}
                >
                  <Instagram size={18} color={isDark ? '#f8f9fa' : '#212529'} strokeWidth={2} />
                  <Text style={[styles.socialButtonText, isDark && styles.socialButtonTextDark]}>Instagram</Text>
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
            <X size={24} color="#fff" strokeWidth={2} />
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
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
    gap: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#868e96',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2d7a4e',
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
    borderBottomColor: '#d1d6db',
  },
  courseName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginLeft: 8,
  },
  holesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  holesInfo: {
    fontSize: 15,
    color: '#495057',
  },
  reserveSection: {
    padding: 16,
    backgroundColor: '#fff',
  },
  reserveButton: {
    backgroundColor: '#2d7a4e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 24,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  amenityChip: {
    backgroundColor: '#f0f9f4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#daf1e4',
  },
  amenityText: {
    fontSize: 13,
    color: '#2d7a4e',
    fontWeight: '600',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    gap: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#212529',
    flex: 1,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    backgroundColor: '#e9ecef',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  facebookButton: {
    backgroundColor: '#e9ecef',
  },
  instagramButton: {
    backgroundColor: '#e9ecef',
  },
  socialIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#1877f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d1d6db',
  },
  eventImage: {
    width: 100,
    height: 100,
    backgroundColor: '#d1d6db',
  },
  eventInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventDate: {
    fontSize: 13,
    color: '#868e96',
  },
  eventLocation: {
    fontSize: 13,
    color: '#868e96',
  },
  eventPrice: {
    fontSize: 13,
    color: '#2d7a4e',
    fontWeight: '600',
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
    backgroundColor: '#1a1d21',
  },
  centerContainerDark: {
    backgroundColor: '#1a1d21',
  },
  loadingTextDark: {
    color: '#adb5bd',
  },
  errorTextDark: {
    color: '#ef4444',
  },
  headerSectionDark: {
    backgroundColor: '#2b3137',
    borderBottomColor: '#343a40',
  },
  courseNameDark: {
    color: '#f8f9fa',
  },
  ratingTextDark: {
    color: '#f8f9fa',
  },
  holesInfoDark: {
    color: '#adb5bd',
  },
  reserveSectionDark: {
    backgroundColor: '#2b3137',
  },
  sectionDark: {
    backgroundColor: '#2b3137',
  },
  sectionTitleDark: {
    color: '#f8f9fa',
  },
  descriptionDark: {
    color: '#adb5bd',
  },
  amenityChipDark: {
    backgroundColor: '#133224',
    borderColor: '#1d4d34',
  },
  amenityTextDark: {
    color: '#2d7a4e',
  },
  contactItemDark: {
    borderBottomColor: '#343a40',
  },
  contactTextDark: {
    color: '#f8f9fa',
  },
  socialButtonDark: {
    backgroundColor: '#343a40',
  },
  socialButtonTextDark: {
    color: '#f8f9fa',
  },
  eventCardDark: {
    backgroundColor: '#2b3137',
    borderColor: '#343a40',
  },
  eventTitleDark: {
    color: '#f8f9fa',
  },
  eventDateDark: {
    color: '#adb5bd',
  },
  eventLocationDark: {
    color: '#adb5bd',
  },
});
