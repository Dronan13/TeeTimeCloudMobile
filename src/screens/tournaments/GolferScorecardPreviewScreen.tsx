import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TournamentsStackParamList } from '@/types';
import { tournamentsService } from '@/services/tournaments';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Database } from '@/types/supabase';

type Props = NativeStackScreenProps<TournamentsStackParamList, 'GolferScorecardPreview'>;
type TournamentRound = Database['public']['Tables']['tournament_rounds']['Row'];

interface HoleData {
  number: number;
  par: number;
  yards: number;
  score: number | null;
}

export default function GolferScorecardPreviewScreen({ route }: Props) {
  const { roundId, golferInfo } = route.params;
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [roundData, setRoundData] = useState<TournamentRound | null>(null);
  const [holes, setHoles] = useState<HoleData[]>([]);

  useEffect(() => {
    fetchRoundData();
  }, [roundId]);

  const fetchRoundData = async () => {
    try {
      setLoading(true);
      const { data, error } = await tournamentsService.fetchRound(roundId);

      if (error || !data) {
        console.error('Error fetching round:', error);
        return;
      }

      setRoundData(data);

      // Build holes array from the round data
      const holesArray: HoleData[] = [];
      for (let i = 1; i <= 18; i++) {
        holesArray.push({
          number: i,
          par: (data as any)[`hole_${i}_par`] || 0,
          yards: (data as any)[`hole_${i}_yards`] || 0,
          score: (data as any)[`hole_${i}`],
        });
      }
      setHoles(holesArray);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateScores = (holeRange: HoleData[]) => {
    const gross = holeRange.reduce((sum, hole) => sum + (hole.score || 0), 0);
    const par = holeRange.reduce((sum, hole) => sum + hole.par, 0);
    const net = roundData?.tournament_handicap
      ? gross - Math.round(roundData.tournament_handicap / 2)
      : gross;
    const diff = gross - par;

    return { gross, par, net, diff };
  };

  const getScoreColor = (score: number | null, par: number) => {
    if (!score) return isDark ? '#6b7280' : '#9ca3af';
    const diff = score - par;
    if (diff < 0) return '#10b981'; // Under par (green)
    if (diff > 0) return '#ef4444'; // Over par (red)
    return '#6b7280'; // Even (gray)
  };

  const front9 = holes.slice(0, 9);
  const back9 = holes.slice(9, 18);
  const front9Scores = calculateScores(front9);
  const back9Scores = calculateScores(back9);
  const totalScores = calculateScores(holes);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#10b981' : '#059669'} />
          <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
            {t('tournaments.golferScorecard.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!roundData) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
            {t('tournaments.golferScorecard.noData')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Golfer Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <View style={styles.golferMainInfo}>
            {golferInfo.avatarUrl ? (
              <Image
                source={{ uri: golferInfo.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, isDark && styles.avatarPlaceholderDark]}>
                <Text style={[styles.avatarText, isDark && styles.avatarTextDark]}>
                  {golferInfo.firstName?.charAt(0)}{golferInfo.lastName?.charAt(0)}
                </Text>
              </View>
            )}
            <View style={styles.golferNameSection}>
              <Text style={[styles.golferName, isDark && styles.golferNameDark]}>
                {golferInfo.firstName} {golferInfo.lastName}
              </Text>
              <Text style={[styles.clubName, isDark && styles.clubNameDark]}>
                {golferInfo.groupName || t('common.na')}
              </Text>
            </View>
          </View>

          {/* Golfer Details Grid */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, isDark && styles.detailLabelDark]}>
                {t('tournaments.golferScorecard.handicapIndex')}
              </Text>
              <Text style={[styles.detailValue, isDark && styles.detailValueDark]}>
                {roundData.handicap_index?.toFixed(1) || t('common.na')}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, isDark && styles.detailLabelDark]}>
                {t('tournaments.golferScorecard.tournamentHandicap')}
              </Text>
              <Text style={[styles.detailValue, isDark && styles.detailValueDark]}>
                {roundData.tournament_handicap || t('common.na')}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, isDark && styles.detailLabelDark]}>
                {t('tournaments.golferScorecard.teeBox')}
              </Text>
              <Text style={[styles.detailValue, isDark && styles.detailValueDark]}>
                {roundData.tee_color || t('common.na')}
              </Text>
            </View>
          </View>
        </View>

        {/* Front 9 */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            {t('tournaments.golferScorecard.front9')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tableScroll}
          >
            <View>
              {/* Header Row */}
              <View style={styles.tableRow}>
                <View style={[styles.tableHeaderCell, styles.firstCell]}>
                  <Text style={[styles.tableHeaderText, isDark && styles.tableHeaderTextDark]}>
                    {t('tournaments.golferScorecard.hole')}
                  </Text>
                </View>
                {front9.map((hole) => (
                  <View key={hole.number} style={styles.tableHeaderCell}>
                    <Text style={[styles.tableHeaderText, isDark && styles.tableHeaderTextDark]}>
                      {hole.number}
                    </Text>
                  </View>
                ))}
                <View style={[styles.tableHeaderCell, styles.totalCell]}>
                  <Text style={[styles.tableHeaderText, isDark && styles.tableHeaderTextDark, styles.totalText]}>
                    {t('tournaments.golferScorecard.out')}
                  </Text>
                </View>
              </View>

              {/* Par Row */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.firstCell, isDark && styles.tableCellDark]}>
                  <Text style={[styles.tableCellText, isDark && styles.tableCellTextDark]}>
                    {t('tournaments.golferScorecard.par')}
                  </Text>
                </View>
                {front9.map((hole) => (
                  <View key={hole.number} style={[styles.tableCell, isDark && styles.tableCellDark]}>
                    <Text style={[styles.tableCellText, isDark && styles.tableCellTextDark]}>
                      {hole.par}
                    </Text>
                  </View>
                ))}
                <View style={[styles.tableCell, styles.totalCell, isDark && styles.tableCellDark]}>
                  <Text style={[styles.tableCellText, isDark && styles.tableCellTextDark, styles.boldText]}>
                    {front9Scores.par}
                  </Text>
                </View>
              </View>

              {/* Yards Row */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.firstCell, isDark && styles.tableCellDark]}>
                  <Text style={[styles.tableCellText, isDark && styles.tableCellTextDark]}>
                    {t('tournaments.golferScorecard.yards')}
                  </Text>
                </View>
                {front9.map((hole) => (
                  <View key={hole.number} style={[styles.tableCell, isDark && styles.tableCellDark]}>
                    <Text style={[styles.tableCellText, isDark && styles.tableCellTextDark, styles.smallText]}>
                      {hole.yards}
                    </Text>
                  </View>
                ))}
                <View style={[styles.tableCell, styles.totalCell, isDark && styles.tableCellDark]}>
                  <Text style={[styles.tableCellText, isDark && styles.tableCellTextDark]}>
                    -
                  </Text>
                </View>
              </View>

              {/* Score Row */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.firstCell, isDark && styles.tableCellDark]}>
                  <Text style={[styles.tableCellText, isDark && styles.tableCellTextDark, styles.boldText]}>
                    {t('tournaments.golferScorecard.score')}
                  </Text>
                </View>
                {front9.map((hole) => (
                  <View key={hole.number} style={[styles.tableCell, styles.scoreCell, isDark && styles.tableCellDark]}>
                    <Text
                      style={[
                        styles.tableCellText,
                        isDark && styles.tableCellTextDark,
                        styles.boldText,
                        { color: getScoreColor(hole.score, hole.par) }
                      ]}
                    >
                      {hole.score || '-'}
                    </Text>
                  </View>
                ))}
                <View style={[styles.tableCell, styles.totalCell, isDark && styles.tableCellDark]}>
                  <Text style={[styles.tableCellText, isDark && styles.tableCellTextDark, styles.boldText]}>
                    {front9Scores.gross}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Front 9 Summary */}
          <View style={[styles.summaryContainer, isDark && styles.summaryContainerDark]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isDark && styles.summaryLabelDark]}>
                {t('tournaments.golferScorecard.gross')}:
              </Text>
              <Text style={[styles.summaryValue, isDark && styles.summaryValueDark]}>
                {front9Scores.gross}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isDark && styles.summaryLabelDark]}>
                {t('tournaments.golferScorecard.net')}:
              </Text>
              <Text style={[styles.summaryValue, isDark && styles.summaryValueDark]}>
                {front9Scores.net}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isDark && styles.summaryLabelDark]}>
                {t('tournaments.golferScorecard.vsPar')}:
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  isDark && styles.summaryValueDark,
                  { color: getScoreColor(front9Scores.gross, front9Scores.par) }
                ]}
              >
                {front9Scores.diff > 0 ? `+${front9Scores.diff}` : front9Scores.diff}
              </Text>
            </View>
          </View>
        </View>

        {/* Back 9 */}
        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            {t('tournaments.golferScorecard.back9')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tableScroll}
          >
            <View>
              {/* Header Row */}
              <View style={styles.tableRow}>
                <View style={[styles.tableHeaderCell, styles.firstCell]}>
                  <Text style={[styles.tableHeaderText, isDark && styles.tableHeaderTextDark]}>
                    {t('tournaments.golferScorecard.hole')}
                  </Text>
                </View>
                {back9.map((hole) => (
                  <View key={hole.number} style={styles.tableHeaderCell}>
                    <Text style={[styles.tableHeaderText, isDark && styles.tableHeaderTextDark]}>
                      {hole.number}
                    </Text>
                  </View>
                ))}
                <View style={[styles.tableHeaderCell, styles.totalCell]}>
                  <Text style={[styles.tableHeaderText, isDark && styles.tableHeaderTextDark, styles.totalText]}>
                    {t('tournaments.golferScorecard.in')}
                  </Text>
                </View>
              </View>

              {/* Par Row */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.firstCell, isDark && styles.tableCellDark]}>
                  <Text style={[styles.tableCellText, isDark && styles.tableCellTextDark]}>
                    {t('tournaments.golferScorecard.par')}
                  </Text>
                </View>
                {back9.map((hole) => (
                  <View key={hole.number} style={[styles.tableCell, isDark && styles.tableCellDark]}>
                    <Text style={[styles.tableCellText, isDark && styles.tableCellTextDark]}>
                      {hole.par}
                    </Text>
                  </View>
                ))}
                <View style={[styles.tableCell, styles.totalCell, isDark && styles.tableCellDark]}>
                  <Text style={[styles.tableCellText, isDark && styles.tableCellTextDark, styles.boldText]}>
                    {back9Scores.par}
                  </Text>
                </View>
              </View>

              {/* Yards Row */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.firstCell, isDark && styles.tableCellDark]}>
                  <Text style={[styles.tableCellText, isDark && styles.tableCellTextDark]}>
                    {t('tournaments.golferScorecard.yards')}
                  </Text>
                </View>
                {back9.map((hole) => (
                  <View key={hole.number} style={[styles.tableCell, isDark && styles.tableCellDark]}>
                    <Text style={[styles.tableCellText, isDark && styles.tableCellTextDark, styles.smallText]}>
                      {hole.yards}
                    </Text>
                  </View>
                ))}
                <View style={[styles.tableCell, styles.totalCell, isDark && styles.tableCellDark]}>
                  <Text style={[styles.tableCellText, isDark && styles.tableCellTextDark]}>
                    -
                  </Text>
                </View>
              </View>

              {/* Score Row */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.firstCell, isDark && styles.tableCellDark]}>
                  <Text style={[styles.tableCellText, isDark && styles.tableCellTextDark, styles.boldText]}>
                    {t('tournaments.golferScorecard.score')}
                  </Text>
                </View>
                {back9.map((hole) => (
                  <View key={hole.number} style={[styles.tableCell, styles.scoreCell, isDark && styles.tableCellDark]}>
                    <Text
                      style={[
                        styles.tableCellText,
                        isDark && styles.tableCellTextDark,
                        styles.boldText,
                        { color: getScoreColor(hole.score, hole.par) }
                      ]}
                    >
                      {hole.score || '-'}
                    </Text>
                  </View>
                ))}
                <View style={[styles.tableCell, styles.totalCell, isDark && styles.tableCellDark]}>
                  <Text style={[styles.tableCellText, isDark && styles.tableCellTextDark, styles.boldText]}>
                    {back9Scores.gross}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Back 9 Summary */}
          <View style={[styles.summaryContainer, isDark && styles.summaryContainerDark]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isDark && styles.summaryLabelDark]}>
                {t('tournaments.golferScorecard.gross')}:
              </Text>
              <Text style={[styles.summaryValue, isDark && styles.summaryValueDark]}>
                {back9Scores.gross}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isDark && styles.summaryLabelDark]}>
                {t('tournaments.golferScorecard.net')}:
              </Text>
              <Text style={[styles.summaryValue, isDark && styles.summaryValueDark]}>
                {back9Scores.net}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, isDark && styles.summaryLabelDark]}>
                {t('tournaments.golferScorecard.vsPar')}:
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  isDark && styles.summaryValueDark,
                  { color: getScoreColor(back9Scores.gross, back9Scores.par) }
                ]}
              >
                {back9Scores.diff > 0 ? `+${back9Scores.diff}` : back9Scores.diff}
              </Text>
            </View>
          </View>
        </View>

        {/* Total Score */}
        <View style={[styles.totalSection, isDark && styles.totalSectionDark]}>
          <Text style={[styles.totalTitle, isDark && styles.totalTitleDark]}>
            {t('tournaments.golferScorecard.total')}
          </Text>
          <View style={styles.totalGrid}>
            <View style={styles.totalItem}>
              <Text style={[styles.totalLabel, isDark && styles.totalLabelDark]}>
                {t('tournaments.golferScorecard.gross')}
              </Text>
              <Text style={[styles.totalValue, isDark && styles.totalValueDark]}>
                {totalScores.gross}
              </Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalLabel, isDark && styles.totalLabelDark]}>
                {t('tournaments.golferScorecard.net')}
              </Text>
              <Text style={[styles.totalValue, isDark && styles.totalValueDark]}>
                {totalScores.net}
              </Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={[styles.totalLabel, isDark && styles.totalLabelDark]}>
                {t('tournaments.golferScorecard.vsPar')}
              </Text>
              <Text
                style={[
                  styles.totalValue,
                  isDark && styles.totalValueDark,
                  { color: getScoreColor(totalScores.gross, totalScores.par) }
                ]}
              >
                {totalScores.diff > 0 ? `+${totalScores.diff}` : totalScores.diff}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  loadingTextDark: {
    color: '#9ca3af',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyTextDark: {
    color: '#9ca3af',
  },

  // Header Styles
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDark: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  golferMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderDark: {
    backgroundColor: '#374151',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
  },
  avatarTextDark: {
    color: '#d1d5db',
  },
  golferNameSection: {
    marginLeft: 16,
    flex: 1,
  },
  golferName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  golferNameDark: {
    color: '#f9fafb',
  },
  clubName: {
    fontSize: 16,
    color: '#6b7280',
  },
  clubNameDark: {
    color: '#9ca3af',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailLabelDark: {
    color: '#9ca3af',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  detailValueDark: {
    color: '#f9fafb',
  },

  // Section Styles
  section: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    padding: 16,
  },
  sectionDark: {
    backgroundColor: '#1f2937',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  sectionTitleDark: {
    color: '#f9fafb',
  },

  // Table Styles
  tableScroll: {
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeaderCell: {
    width: 44,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#059669',
  },
  firstCell: {
    width: 60,
  },
  totalCell: {
    width: 50,
    backgroundColor: '#047857',
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  tableHeaderTextDark: {
    color: '#ffffff',
  },
  totalText: {
    fontWeight: '700',
  },
  tableCell: {
    width: 44,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
  },
  tableCellDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  scoreCell: {
    backgroundColor: '#ffffff',
  },
  tableCellText: {
    fontSize: 14,
    color: '#374151',
  },
  tableCellTextDark: {
    color: '#d1d5db',
  },
  boldText: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 11,
  },

  // Summary Styles
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
  },
  summaryContainerDark: {
    backgroundColor: '#374151',
  },
  summaryRow: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryLabelDark: {
    color: '#9ca3af',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  summaryValueDark: {
    color: '#f9fafb',
  },

  // Total Section Styles
  totalSection: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalSectionDark: {
    backgroundColor: '#1f2937',
  },
  totalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  totalTitleDark: {
    color: '#f9fafb',
  },
  totalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  totalItem: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  totalLabelDark: {
    color: '#9ca3af',
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  totalValueDark: {
    color: '#f9fafb',
  },
});
