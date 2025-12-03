import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TournamentsStackParamList } from '@/types';
import { tournamentsService } from '@/services/tournaments';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';

type Props = NativeStackScreenProps<TournamentsStackParamList, 'TournamentRegistration'>;

interface FlightOption {
  id: string;
  name: string;
  max_players: number;
  is_closed: boolean;
  player_count: number;
}

export default function TournamentRegistrationScreen({
  route,
  navigation,
}: Props) {
  const { tournamentId } = route.params;
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  const [tournament, setTournament] = useState<any>(null);
  const [groups, setGroups] = useState<FlightOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [cartRequired, setCartRequired] = useState(false);
  const [agreedToRules, setAgreedToRules] = useState(false);

  useEffect(() => {
    fetchTournamentAndGroups();
  }, [tournamentId]);

  const fetchTournamentAndGroups = async () => {
    try {
      setLoading(true);

      // Fetch tournament details
      const { data: tournamentData } =
        await tournamentsService.fetchTournamentDetail(tournamentId);

      if (tournamentData) {
        setTournament(tournamentData);
      }

      // Fetch groups
      const { data: groupsData } =
        await tournamentsService.fetchTournamentGroups(tournamentId);

      if (groupsData) {
        // Enrich groups with player counts
        const enrichedGroups = groupsData.map((group: any) => ({
          id: group.id,
          name: group.name,
          max_players: group.max_players,
          is_closed: group.is_closed,
          player_count: group.tournament_rounds?.[0]?.count || 0,
        }));
        setGroups(enrichedGroups);

        // Auto-select first available group
        const availableGroup = enrichedGroups.find(
          (g) => !g.is_closed && g.player_count < g.max_players
        );
        if (availableGroup) {
          setSelectedGroupId(availableGroup.id);
        }
      }
    } catch (err) {
      Alert.alert(t('common.error'), t('errors.server'));
    } finally {
      setLoading(false);
    }
  };

  const validateRegistration = (): boolean => {
    // Check handicap
    if (!profile?.handicap_index) {
      Alert.alert(
        t('tournament.registration.errorTitle'),
        t('tournament.registration.errorInvalidHandicap')
      );
      return false;
    }

    // Check selected group
    if (!selectedGroupId) {
      Alert.alert(
        t('tournament.registration.errorTitle'),
        'Please select a flight'
      );
      return false;
    }

    // Check group availability
    const selectedGroup = groups.find((g) => g.id === selectedGroupId);
    if (!selectedGroup) {
      Alert.alert(
        t('tournament.registration.errorTitle'),
        t('tournament.registration.errorFullFlight')
      );
      return false;
    }

    if (selectedGroup.is_closed) {
      Alert.alert(
        t('tournament.registration.errorTitle'),
        t('tournament.registration.errorGroupClosed')
      );
      return false;
    }

    if (selectedGroup.player_count >= selectedGroup.max_players) {
      Alert.alert(
        t('tournament.registration.errorTitle'),
        t('tournament.registration.errorFullFlight')
      );
      return false;
    }

    // Check tournament registration dates
    const now = new Date();
    if (tournament?.registration_close_at) {
      const closeDate = new Date(tournament.registration_close_at);
      if (now > closeDate) {
        Alert.alert(
          t('tournament.registration.errorTitle'),
          'Registration period has ended'
        );
        return false;
      }
    }

    // Check rules agreement
    if (!agreedToRules) {
      Alert.alert(
        t('tournament.registration.errorTitle'),
        'Please agree to tournament rules'
      );
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateRegistration() || !user?.id || !selectedGroupId) {
      return;
    }

    try {
      setRegistering(true);

      const roundData = {
        tournament_id: tournamentId,
        golf_round_group_id: selectedGroupId,
        user_id: user.id,
        handicap_index: profile?.handicap_index || 0,
        is_complete: false,
      };

      const { data, error } = await tournamentsService.createRound(roundData);

      if (error) {
        Alert.alert(
          t('tournament.registration.errorTitle'),
          t('tournament.registration.errorMessage')
        );
        return;
      }

      // Success!
      Alert.alert(
        t('tournament.registration.successTitle'),
        t('tournament.registration.successMessage', {
          tournamentName: tournament?.name || 'the tournament',
        }),
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('TournamentDetail', {
                tournamentId,
              });
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert(t('common.error'), t('errors.unknown'));
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, isDark && styles.centerContainerDark]}>
        <ActivityIndicator size="large" color="#2d7a4e" />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={[styles.centerContainer, isDark && styles.centerContainerDark]}>
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
          {t('errors.notFound')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Tournament Header */}
      <View style={[styles.section, isDark && styles.sectionDark]}>
        <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>
          {t('tournament.registration.title')}
        </Text>
        <Text style={[styles.tournamentName, isDark && styles.tournamentNameDark]}>
          {tournament.name}
        </Text>
      </View>

      {/* User Information */}
      <View style={[styles.section, isDark && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          {t('tournament.registration.yourInfo')}
        </Text>

        <View style={styles.infoRow}>
          <Text style={[styles.label, isDark && styles.labelDark]}>
            Name
          </Text>
          <Text style={[styles.value, isDark && styles.valueDark]}>
            {profile?.first_name} {profile?.last_name}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, isDark && styles.labelDark]}>
            Handicap
          </Text>
          <Text style={[styles.value, isDark && styles.valueDark]}>
            {profile?.handicap_index?.toFixed(1) || 'Not set'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, isDark && styles.labelDark]}>
            Email
          </Text>
          <Text style={[styles.value, isDark && styles.valueDark]} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
      </View>

      {/* Flight Selection */}
      <View style={[styles.section, isDark && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          {t('tournament.registration.selectFlight')}
        </Text>

        {groups.length > 0 ? (
          groups.map((group) => {
            const isAtCapacity = group.player_count >= group.max_players;
            const isSelected = selectedGroupId === group.id;

            return (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.flightOption,
                  isDark && styles.flightOptionDark,
                  isSelected && styles.flightOptionSelected,
                  isDark && isSelected && styles.flightOptionSelectedDark,
                  (group.is_closed || isAtCapacity) && styles.flightOptionDisabled,
                ]}
                onPress={() => {
                  if (!group.is_closed && !isAtCapacity) {
                    setSelectedGroupId(group.id);
                  }
                }}
                disabled={group.is_closed || isAtCapacity}
              >
                <View style={styles.flightLeft}>
                  <Text
                    style={[
                      styles.flightName,
                      isDark && styles.flightNameDark,
                      (group.is_closed || isAtCapacity) && styles.flightNameDisabled,
                    ]}
                  >
                    {group.name}
                  </Text>
                  <Text
                    style={[
                      styles.flightMeta,
                      isDark && styles.flightMetaDark,
                      (group.is_closed || isAtCapacity) && styles.flightMetaDisabled,
                    ]}
                  >
                    {group.player_count} / {group.max_players} {t('common.players')}
                    {group.is_closed && ' • Closed'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.radio,
                    isSelected && styles.radioSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={[styles.noFlightsText, isDark && styles.noFlightsTextDark]}>
            No flights available
          </Text>
        )}
      </View>

      {/* Preferences */}
      <View style={[styles.section, isDark && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          {t('tournament.registration.preferences')}
        </Text>

        <View style={styles.preferenceRow}>
          <Text style={[styles.label, isDark && styles.labelDark]}>
            {t('tournament.registration.cartRequired')}
          </Text>
          <Switch
            value={cartRequired}
            onValueChange={setCartRequired}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
            thumbColor={cartRequired ? '#22c55e' : '#ffffff'}
          />
        </View>
      </View>

      {/* Agreement */}
      <View style={[styles.section, isDark && styles.sectionDark]}>
        <View style={styles.agreementRow}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              agreedToRules && styles.checkboxChecked,
              isDark && agreedToRules && styles.checkboxCheckedDark,
            ]}
            onPress={() => setAgreedToRules(!agreedToRules)}
          >
            {agreedToRules && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
          <Text style={[styles.agreementText, isDark && styles.agreementTextDark]}>
            {t('tournament.registration.agreeToRules')}
          </Text>
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            registering && styles.submitButtonDisabled,
          ]}
          onPress={handleRegister}
          disabled={registering}
        >
          {registering ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {t('tournament.registration.confirmButton')}
            </Text>
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
    backgroundColor: '#1a1d21',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  centerContainerDark: {
    backgroundColor: '#1a1d21',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
  },
  errorTextDark: {
    color: '#fca5a5',
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionDark: {
    backgroundColor: '#2b3137',
    borderColor: '#495057',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  sectionLabelDark: {
    color: '#d1d5db',
  },
  tournamentName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1d21',
  },
  tournamentNameDark: {
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1d21',
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#ffffff',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  labelDark: {
    color: '#d1d5db',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1d21',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  valueDark: {
    color: '#ffffff',
  },
  flightOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  flightOptionDark: {
    backgroundColor: '#1a1d21',
    borderColor: '#495057',
  },
  flightOptionSelected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#2d7a4e',
  },
  flightOptionSelectedDark: {
    backgroundColor: '#1a3a1a',
    borderColor: '#22c55e',
  },
  flightOptionDisabled: {
    opacity: 0.5,
  },
  flightLeft: {
    flex: 1,
  },
  flightName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1d21',
    marginBottom: 4,
  },
  flightNameDark: {
    color: '#ffffff',
  },
  flightNameDisabled: {
    color: '#9ca3af',
  },
  flightMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  flightMetaDark: {
    color: '#d1d5db',
  },
  flightMetaDisabled: {
    color: '#9ca3af',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#2d7a4e',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2d7a4e',
  },
  noFlightsText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  noFlightsTextDark: {
    color: '#d1d5db',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#2d7a4e',
    borderColor: '#2d7a4e',
  },
  checkboxCheckedDark: {
    backgroundColor: '#22c55e',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  agreementText: {
    fontSize: 14,
    color: '#1a1d21',
    flex: 1,
  },
  agreementTextDark: {
    color: '#ffffff',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  submitButton: {
    backgroundColor: '#2d7a4e',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
