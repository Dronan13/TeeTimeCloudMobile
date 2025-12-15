import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const courseDetailStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#1a1d21',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
    gap: 16,
  },
  centerContainerDark: {
    backgroundColor: '#1a1d21',
  },

  // Error & Retry Styles
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorTextDark: {
    color: '#ef4444',
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

  // Gallery Styles
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

  // Header Styles
  headerSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d6db',
  },
  headerSectionDark: {
    backgroundColor: '#2b3137',
    borderBottomColor: '#343a40',
  },
  courseName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  courseNameDark: {
    color: '#f8f9fa',
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
  ratingTextDark: {
    color: '#f8f9fa',
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
  holesInfoDark: {
    color: '#adb5bd',
  },

  // Action Buttons Styles
  reserveSection: {
    padding: 16,
    backgroundColor: '#fff',
    gap: 12,
  },
  reserveSectionDark: {
    backgroundColor: '#2b3137',
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
  startRoundButton: {
    backgroundColor: '#f0f9f4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 2,
    borderColor: '#2d7a4e',
  },
  startRoundButtonDark: {
    backgroundColor: '#133224',
    borderColor: '#2d7a4e',
  },
  startRoundButtonText: {
    color: '#2d7a4e',
    fontSize: 18,
    fontWeight: '600',
  },
  startRoundButtonTextDark: {
    color: '#2d7a4e',
  },

  // Section Styles
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  sectionDark: {
    backgroundColor: '#2b3137',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#f8f9fa',
  },

  // Description Styles
  description: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 24,
  },
  descriptionDark: {
    color: '#adb5bd',
  },

  // Amenities Styles
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
  amenityChipDark: {
    backgroundColor: '#133224',
    borderColor: '#1d4d34',
  },
  amenityText: {
    fontSize: 13,
    color: '#2d7a4e',
    fontWeight: '600',
  },
  amenityTextDark: {
    color: '#2d7a4e',
  },

  // Contact Styles
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    gap: 12,
  },
  contactItemDark: {
    borderBottomColor: '#343a40',
  },
  contactText: {
    fontSize: 15,
    color: '#212529',
    flex: 1,
  },
  contactTextDark: {
    color: '#f8f9fa',
  },

  // Social Media Styles
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
  socialButtonDark: {
    backgroundColor: '#343a40',
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
  },
  socialButtonTextDark: {
    color: '#f8f9fa',
  },

  // Event Styles
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d1d6db',
  },
  eventCardDark: {
    backgroundColor: '#2b3137',
    borderColor: '#343a40',
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
  eventTitleDark: {
    color: '#f8f9fa',
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
  eventDateDark: {
    color: '#adb5bd',
  },
  eventLocation: {
    fontSize: 13,
    color: '#868e96',
  },
  eventLocationDark: {
    color: '#adb5bd',
  },
  eventPrice: {
    fontSize: 13,
    color: '#2d7a4e',
    fontWeight: '600',
  },

  // Modal Styles
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

  // Spacing
  bottomSpacing: {
    height: 24,
  },
});
