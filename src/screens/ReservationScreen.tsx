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
      Alert.alert('Error', 'Failed to load reservation details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!firstName || !lastName || !email || !phone) {
      Alert.alert(
        'Incomplete Profile',
        'Please update your profile with your Name and Phone Number before booking.',
        [
          {
            text: 'Go to Profile',
            onPress: () => console.log('Navigate to profile manually'),
          },
          { text: 'Cancel', style: 'cancel' },
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

      Alert.alert(
        'Success',
        `Reservation ${bookingStatus === 'confirmed' ? 'Confirmed' : 'Submitted'}!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('CoursesList'), // Or navigate to My Tee Times
          },
        ]
      );
    } catch (error) {
      console.error('Error creating reservation:', error);
      Alert.alert('Error', 'Failed to create reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.courseName}>Reservation Details</Text>
        {slot && (
          <View style={styles.slotInfo}>
            <Text style={styles.slotDate}>
              {slot.tee_date ? format(parseISO(slot.tee_date), 'EEEE, MMMM d, yyyy') : ''}
            </Text>
            <Text style={styles.slotTime}>
              {slot.tee_time ? slot.tee_time.slice(0, 5) : ''} - Hole {slot.hole}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Game Details</Text>

        <Text style={styles.label}>Holes</Text>
        <View style={styles.holesSelector}>
          <TouchableOpacity
            style={[styles.holesOption, holes === 9 && styles.holesOptionActive]}
            onPress={() => setHoles(9)}
          >
            <Text style={[styles.holesText, holes === 9 && styles.holesTextActive]}>
              9 Holes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.holesOption, holes === 18 && styles.holesOptionActive]}
            onPress={() => setHoles(18)}
          >
            <Text style={[styles.holesText, holes === 18 && styles.holesTextActive]}>
              18 Holes
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Extras & Requirements</Text>

        <View style={styles.checkboxRow}>
          <Text style={styles.checkboxLabel}>Golf Cart Required</Text>
          <Switch
            value={golfCartRequired}
            onValueChange={setGolfCartRequired}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
            thumbColor={golfCartRequired ? '#22c55e' : '#f3f4f6'}
          />
        </View>

        <View style={styles.checkboxRow}>
          <Text style={styles.checkboxLabel}>Push Cart Required</Text>
          <Switch
            value={pushCartRequired}
            onValueChange={setPushCartRequired}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
            thumbColor={pushCartRequired ? '#22c55e' : '#f3f4f6'}
          />
        </View>

        <View style={styles.checkboxRow}>
          <Text style={styles.checkboxLabel}>Caddy Required</Text>
          <Switch
            value={caddyRequired}
            onValueChange={setCaddyRequired}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
            thumbColor={caddyRequired ? '#22c55e' : '#f3f4f6'}
          />
        </View>

        <View style={styles.checkboxRow}>
          <Text style={styles.checkboxLabel}>Clubs Required</Text>
          <Switch
            value={clubsRequired}
            onValueChange={setClubsRequired}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
            thumbColor={clubsRequired ? '#22c55e' : '#f3f4f6'}
          />
        </View>

        <View style={styles.checkboxRow}>
          <Text style={styles.checkboxLabel}>Assistance Required</Text>
          <Switch
            value={assistanceRequired}
            onValueChange={setAssistanceRequired}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
            thumbColor={assistanceRequired ? '#22c55e' : '#f3f4f6'}
          />
        </View>

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any special requests or notes..."
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
            <Text style={styles.submitButtonText}>Confirm Reservation</Text>
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
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  courseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  slotInfo: {
    alignItems: 'center',
  },
  slotDate: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 4,
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
    marginTop: 8,
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
  textArea: {
    height: 100,
  },
  holesSelector: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  holesOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  holesOptionActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  holesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
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
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
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
