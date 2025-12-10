import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CoursesStackParamList, Database } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, parseISO } from 'date-fns';

type ReservationScreenRouteProp = RouteProp<CoursesStackParamList, 'ReservationScreen'>;
type ReservationScreenNavigationProp = StackNavigationProp<
  CoursesStackParamList,
  'ReservationScreen'
>;

type TeeTimeSlot =
  Database['public']['Views']['tee_time_slots_with_reservation_count']['Row'];

export default function ReservationScreen() {
  const route = useRoute<ReservationScreenRouteProp>();
  const navigation = useNavigation<ReservationScreenNavigationProp>();
  const { slotId, courseId } = route.params;
  const { user, profile } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [slot, setSlot] = useState<TeeTimeSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [holes, setHoles] = useState<number>(18);
  const [notes, setNotes] = useState('');

  // Checkboxes (using Switches for mobile UI)
  const [assistanceRequired, setAssistanceRequired] = useState(false);
  const [caddyRequired, setCaddyRequired] = useState(false);
  const [clubsRequired, setClubsRequired] = useState(false);
  const [golfCartRequired, setGolfCartRequired] = useState(false);
  const [pushCartRequired, setPushCartRequired] = useState(false);

  useEffect(() => {
    fetchSlotDetails();
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || user?.email || '');
      setPhone(profile.phone || '');
    }
  }, [slotId, profile]);

  const fetchSlotDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('tee_time_slots_with_reservation_count')
        .select('*')
        .eq('id', slotId)
        .single();

      if (error) throw error;
      setSlot(data);
    } catch (error) {
      console.error('Error fetching slot details:', error);
      Alert.alert(t('common.error'), t('reservation.errorLoadDetails'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!firstName || !lastName || !email || !phone) {
      Alert.alert(
        t('reservation.incompleteProfile'),
        t('reservation.incompleteProfileMessage'),
        [
          {
            text: t('reservation.goToProfile'),
            onPress: () => console.log('Navigate to profile manually'),
          },
          { text: t('common.cancel'), style: 'cancel' },
        ]
      );
      return;
    }

    setSubmitting(true);
    try {
      // Determine booking status
      const isHomeCourse = profile?.home_course_id === courseId;
      const bookingStatus = isHomeCourse ? 'confirmed' : 'pending';

      const { error } = await supabase.from('tee_time_reservations').insert({
        course_id: courseId,
        slot_id: slotId,
        user_id: user?.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        holes: holes,
        notes: notes,
        assistance_required: assistanceRequired,
        caddy_required: caddyRequired,
        clubs_required: clubsRequired,
        golf_cart_required: golfCartRequired,
        push_cart_required: pushCartRequired,
        booking_status: bookingStatus,
        payment_status: 'pending', // Default
      });

      if (error) throw error;

      const status = bookingStatus === 'confirmed' ? t('reservation.successConfirmed') : t('reservation.successSubmitted');
      Alert.alert(
        t('common.success'),
        t('reservation.reservationSuccessMessage', { status }),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.navigate('CoursesList'), // Or navigate to My Tee Times
          },
        ]
      );
    } catch (error) {
      console.error('Error creating reservation:', error);
      Alert.alert(t('common.error'), t('reservation.errorCreateReservation'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.header, isDark && styles.headerDark]}>
        <Text style={[styles.courseName, isDark && styles.courseNameDark]}>{t('reservation.reservationDetails')}</Text>
        {slot && (
          <View style={styles.slotInfo}>
            <Text style={[styles.slotDate, isDark && styles.slotDateDark]}>
              {slot.tee_date ? format(parseISO(slot.tee_date), 'EEEE, MMMM d, yyyy') : ''}
            </Text>
            <Text style={styles.slotTime}>
              {slot.tee_time ? slot.tee_time.slice(0, 5) : ''} - {t('reservation.hole')} {slot.hole}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.form}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>{t('reservation.gameDetails')}</Text>

        <Text style={[styles.label, isDark && styles.labelDark]}>{t('reservation.holes')}</Text>
        <View style={[styles.holesSelector, isDark && styles.holesSelectorDark]}>
          <TouchableOpacity
            style={[styles.holesOption, holes === 9 && styles.holesOptionActive, isDark && styles.holesOptionDark, holes === 9 && isDark && styles.holesOptionActiveDark]}
            onPress={() => setHoles(9)}
          >
            <Text style={[styles.holesText, holes === 9 && styles.holesTextActive, isDark && styles.holesTextDark]}>
              {t('reservation.nineHoles')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.holesOption, holes === 18 && styles.holesOptionActive, isDark && styles.holesOptionDark, holes === 18 && isDark && styles.holesOptionActiveDark]}
            onPress={() => setHoles(18)}
          >
            <Text style={[styles.holesText, holes === 18 && styles.holesTextActive, isDark && styles.holesTextDark]}>
              {t('reservation.eighteenHoles')}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>{t('reservation.extrasRequirements')}</Text>

        <View style={[styles.checkboxRow, isDark && styles.checkboxRowDark]}>
          <Text style={[styles.checkboxLabel, isDark && styles.checkboxLabelDark]}>{t('reservation.golfCartRequired')}</Text>
          <Switch
            value={golfCartRequired}
            onValueChange={setGolfCartRequired}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
            thumbColor={golfCartRequired ? '#22c55e' : '#f3f4f6'}
          />
        </View>

        <View style={[styles.checkboxRow, isDark && styles.checkboxRowDark]}>
          <Text style={[styles.checkboxLabel, isDark && styles.checkboxLabelDark]}>{t('reservation.pushCartRequired')}</Text>
          <Switch
            value={pushCartRequired}
            onValueChange={setPushCartRequired}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
            thumbColor={pushCartRequired ? '#22c55e' : '#f3f4f6'}
          />
        </View>

        <View style={[styles.checkboxRow, isDark && styles.checkboxRowDark]}>
          <Text style={[styles.checkboxLabel, isDark && styles.checkboxLabelDark]}>{t('reservation.caddyRequired')}</Text>
          <Switch
            value={caddyRequired}
            onValueChange={setCaddyRequired}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
            thumbColor={caddyRequired ? '#22c55e' : '#f3f4f6'}
          />
        </View>

        <View style={[styles.checkboxRow, isDark && styles.checkboxRowDark]}>
          <Text style={[styles.checkboxLabel, isDark && styles.checkboxLabelDark]}>{t('reservation.clubsRequired')}</Text>
          <Switch
            value={clubsRequired}
            onValueChange={setClubsRequired}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
            thumbColor={clubsRequired ? '#22c55e' : '#f3f4f6'}
          />
        </View>

        <View style={[styles.checkboxRow, isDark && styles.checkboxRowDark]}>
          <Text style={[styles.checkboxLabel, isDark && styles.checkboxLabelDark]}>{t('reservation.assistanceRequired')}</Text>
          <Switch
            value={assistanceRequired}
            onValueChange={setAssistanceRequired}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
            thumbColor={assistanceRequired ? '#22c55e' : '#f3f4f6'}
          />
        </View>

        <Text style={[styles.label, isDark && styles.labelDark]}>{t('reservation.notes')}</Text>
        <TextInput
          style={[styles.input, styles.textArea, isDark && styles.inputDark]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('reservation.notesPlaceholder')}
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleReserve}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{t('reservation.confirmReservation')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainerDark: {
    backgroundColor: '#111827',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  headerDark: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  courseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  courseNameDark: {
    color: '#f9fafb',
  },
  slotInfo: {
    alignItems: 'center',
  },
  slotDate: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 4,
  },
  slotDateDark: {
    color: '#9ca3af',
  },
  slotTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22c55e',
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#f9fafb',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
  },
  labelDark: {
    color: '#9ca3af',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    color: '#f9fafb',
  },
  textArea: {
    height: 100,
  },
  holesSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  holesSelectorDark: {
    backgroundColor: '#1f2937',
  },
  holesOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  holesOptionDark: {
    backgroundColor: '#1f2937',
  },
  holesOptionActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  holesOptionActiveDark: {
    backgroundColor: '#374151',
  },
  holesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  holesTextDark: {
    color: '#9ca3af',
  },
  holesTextActive: {
    color: '#22c55e',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  checkboxRowDark: {
    borderBottomColor: '#374151',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
  },
  checkboxLabelDark: {
    color: '#9ca3af',
  },
  submitButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#86efac',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
