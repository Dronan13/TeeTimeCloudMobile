import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';
import { Calendar, MapPin, DollarSign } from 'lucide-react-native';
import { CourseEvent } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { courseDetailStyles } from './styles';

interface CourseEventsProps {
  events: CourseEvent[];
  onImagePress: (imageUrl: string) => void;
}

const EventCard: React.FC<{
  event: CourseEvent;
  isDark: boolean;
  onEventPress: () => void;
  onImagePress: (imageUrl: string) => void;
}> = ({ event, isDark, onEventPress, onImagePress }) => {
  const startDate = new Date(event.start_at);
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
      style={[courseDetailStyles.eventCard, isDark && courseDetailStyles.eventCardDark]}
      onPress={onEventPress}
      activeOpacity={0.7}
    >
      {event.image_url && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onImagePress(event.image_url!);
          }}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: event.image_url }}
            style={courseDetailStyles.eventImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}
      <View style={courseDetailStyles.eventInfo}>
        <Text style={[courseDetailStyles.eventTitle, isDark && courseDetailStyles.eventTitleDark]} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={courseDetailStyles.eventRow}>
          <Calendar size={12} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={2} />
          <Text style={[courseDetailStyles.eventDate, isDark && courseDetailStyles.eventDateDark]}>
            {formattedDate} at {formattedTime}
          </Text>
        </View>
        {event.address && (
          <View style={courseDetailStyles.eventRow}>
            <MapPin size={12} color={isDark ? '#adb5bd' : '#868e96'} strokeWidth={2} />
            <Text style={[courseDetailStyles.eventLocation, isDark && courseDetailStyles.eventLocationDark]} numberOfLines={1}>
              {event.address}
            </Text>
          </View>
        )}
        {event.price !== null && event.price > 0 && (
          <View style={courseDetailStyles.eventRow}>
            <DollarSign size={12} color="#2d7a4e" strokeWidth={2} />
            <Text style={courseDetailStyles.eventPrice}>${event.price.toFixed(2)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const CourseEvents: React.FC<CourseEventsProps> = ({ events, onImagePress }) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const handleEventPress = (event: CourseEvent) => {
    if (event.registration_url) {
      Linking.openURL(event.registration_url);
    }
  };

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <View style={[courseDetailStyles.section, isDark && courseDetailStyles.sectionDark]}>
      <Text style={[courseDetailStyles.sectionTitle, isDark && courseDetailStyles.sectionTitleDark]}>
        {t('courses.upcomingEvents')}
      </Text>
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isDark={isDark}
          onEventPress={() => handleEventPress(event)}
          onImagePress={onImagePress}
        />
      ))}
    </View>
  );
};
