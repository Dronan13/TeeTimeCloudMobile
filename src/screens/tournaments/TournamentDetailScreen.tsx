import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ChevronRight, MapPin, Users, Trophy, Calendar } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TournamentsStackParamList } from '@/types';
import { tournamentsService } from '@/services/tournaments';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

type Props = NativeStackScreenProps<TournamentsStackParamList, 'TournamentDetail'>;

export default function TournamentDetailScreen({
  route,
  navigation,
}: Props) {
  const { tournamentId } = route.params;
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [tournament, setTournament] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRegistered, setUserRegistered] = useState(false);

  const fetchTournamentDetail = useCallback(async () => {
    try {
      setLoading(true);

      const { data: tournamentData, error: tournamentError } =
        await tournamentsService.fetchTournamentDetail(tournamentId);

      if (tournamentError || !tournamentData) {
        Alert.alert(t('common.error'), t('errors.server'));
        return;
      }

      setTournament(tournamentData);

      // Fetch groups
      const { data: groupsData } = await tournamentsService.fetchTournamentGroups(
        tournamentId
      );
      setGroups(groupsData || []);

      // Check if user is registered
      if (user?.id) {
        const { data: isReg } = await tournamentsService.isUserRegistered(
          tournamentId,
          user.id
        );
        setUserRegistered(isReg || false);
      }
    } catch (err) {
      Alert.alert(t('common.error'), t('errors.unknown'));
    } finally {
      setLoading(false);
    }
  }, [tournamentId, user?.id, t]);

  useEffect(() => {
    fetchTournamentDetail();
  }, [fetchTournamentDetail]);

  const formatDateRange = (startAt: string, endAt?: string) => {
    try {
      const start = new Date(startAt);
      const end = endAt ? new Date(endAt) : start;
      if (start.toDateString() === end.toDateString()) {
        return format(start, 'MMM d, yyyy');
      }
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    } catch {
      return 'TBA';
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
      {/* Header Section */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <Text style={[styles.title, isDark && styles.titleDark]}>
          {tournament.name}
        </Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          {tournament.description}
        </Text>
      </View>

      {/* Info Cards */}
      <View style={styles.infoGrid}>
        {tournament.start_at && (
          <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
            <Calendar size={20} color="#2d7a4e" />
            <Text style={[styles.infoLabel, isDark && styles.infoLabelDark]}>
              {formatDateRange(tournament.start_at, tournament.end_at)}
            </Text>
          </View>
        )}

        {tournament.courses && (
          <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
            <MapPin size={20} color="#2d7a4e" />
            <Text style={[styles.infoLabel, isDark && styles.infoLabelDark]}>
              {tournament.courses.name}
            </Text>
          </View>
        )}

        {tournament.max_players && (
          <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
            <Users size={20} color="#2d7a4e" />
            <Text style={[styles.infoLabel, isDark && styles.infoLabelDark]}>
              {tournament.max_players} {t('common.players')}
            </Text>
          </View>
        )}

        {tournament.format && (
          <View style={[styles.infoCard, isDark && styles.infoCardDark]}>
            <Trophy size={20} color="#2d7a4e" />
            <Text style={[styles.infoLabel, isDark && styles.infoLabelDark]}>
              {t(`tournament.format.${tournament.format}`) || tournament.format}
            </Text>
          </View>
        )}
      </View>

      {/* Tournament Details */}
      <View style={[styles.section, isDark && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          {t('tournament.detail.description')}
        </Text>
        <Text style={[styles.sectionContent, isDark && styles.sectionContentDark]}>
          {tournament.description || t('common.viewDetails')}
        </Text>
      </View>

      {/* Tournament Details Section */}
      <View style={[styles.section, isDark && styles.sectionDark]}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          {t('tournament.detail.title')}
        </Text>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, isDark && styles.detailLabelDark]}>
            {t('tournament.detail.format')}
          </Text>
          <Text style={[styles.detailValue, isDark && styles.detailValueDark]}>
            {t(`tournament.format.${tournament.format}`) || tournament.format}
          </Text>
        </View>
        {tournament.handicap_percent !== undefined && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, isDark && styles.detailLabelDark]}>
              {t('tournament.detail.handicapAllowance')}
            </Text>
            <Text style={[styles.detailValue, isDark && styles.detailValueDark]}>
              {tournament.handicap_percent}%
            </Text>
          </View>
        )}
        {tournament.registration_close_at && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, isDark && styles.detailLabelDark]}>
              {t('tournament.detail.registrationOpen')}
            </Text>
            <Text style={[styles.detailValue, isDark && styles.detailValueDark]}>
              {format(new Date(tournament.registration_close_at), 'MMM d, yyyy')}
            </Text>
          </View>
        )}
      </View>

      {/* Groups & Flights */}
      {groups.length > 0 && (
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            {t('tournament.detail.groupsFlights')}
          </Text>
          {groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={[styles.groupCard, isDark && styles.groupCardDark]}
              onPress={() =>
                navigation.navigate('TournamentGroupList', {
                  groupId: group.id,
                  groupName: group.name,
                })
              }
            >
              <View style={styles.groupInfo}>
                <Text style={[styles.groupName, isDark && styles.groupNameDark]}>
                  {group.name}
                </Text>
                <Text style={[styles.groupMeta, isDark && styles.groupMetaDark]}>
                  {group.tournament_rounds?.[0]?.count || 0} {t('common.players')}
                  {group.is_closed && ` • ${t('common.edit')}`}
                </Text>
              </View>
              <ChevronRight size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, isDark && styles.secondaryButtonDark]}
          onPress={() =>
            navigation.navigate('Leaderboard', { tournamentId })
          }
        >
          <Text style={[styles.secondaryButtonText, isDark && styles.secondaryButtonTextDark]}>
            {t('tournament.detail.leaderboard')}
          </Text>
        </TouchableOpacity>

        {!userRegistered ? (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() =>
              navigation.navigate('TournamentRegistration', {
                tournamentId,
              })
            }
          >
            <Text style={styles.primaryButtonText}>
              {t('tournament.register')}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => {
              Alert.alert('Registered', 'You are registered for this tournament');
            }}
            disabled
          >
            <Text style={styles.primaryButtonText}>
              {t('tournament.registered')}
            </Text>
          </TouchableOpacity>
        )}
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
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDark: {
    backgroundColor: '#2b3137',
    borderBottomColor: '#495057',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1d21',
    marginBottom: 8,
  },
  titleDark: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  subtitleDark: {
    color: '#d1d5db',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 8,
  },
  infoCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoCardDark: {
    backgroundColor: '#2b3137',
    borderColor: '#495057',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1d21',
    marginTop: 8,
    textAlign: 'center',
  },
  infoLabelDark: {
    color: '#ffffff',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1d21',
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#ffffff',
  },
  sectionContent: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  sectionContentDark: {
    color: '#d1d5db',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailLabelDark: {
    color: '#d1d5db',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1d21',
  },
  detailValueDark: {
    color: '#ffffff',
  },
  groupCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  groupCardDark: {
    backgroundColor: '#1a1d21',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1d21',
  },
  groupNameDark: {
    color: '#ffffff',
  },
  groupMeta: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  groupMetaDark: {
    color: '#d1d5db',
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
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2d7a4e',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d6db',
  },
  secondaryButtonDark: {
    backgroundColor: '#2b3137',
    borderColor: '#495057',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1d21',
  },
  secondaryButtonTextDark: {
    color: '#ffffff',
  },
});
