import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';

interface HoleData {
  number: number;
  score: number | null;
  par: number;
}

interface ScorecardGridProps {
  holes: HoleData[];
  currentHole: number;
  onHoleSelect: (holeNumber: number) => void;
  front9Total?: number;
  back9Total?: number;
  totalScore?: number;
}

export default function ScorecardGrid({
  holes,
  currentHole,
  onHoleSelect,
  front9Total = 0,
  back9Total = 0,
  totalScore = 0,
}: ScorecardGridProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const getScoreColor = (score: number | null, par: number) => {
    if (score === null) return '#d1d5db';
    const diff = score - par;
    if (diff < 0) return '#10b981'; // Under par (green)
    if (diff > 0) return '#ef4444'; // Over par (red)
    return isDark ? '#d1d5db' : '#6b7280'; // Even (gray)
  };

  const renderHoleCell = (hole: HoleData) => {
    const isSelected = hole.number === currentHole;

    return (
      <TouchableOpacity
        key={`hole-${hole.number}`}
        style={[
          styles.cell,
          isDark && styles.cellDark,
          isSelected && styles.cellSelected,
          isDark && isSelected && styles.cellSelectedDark,
        ]}
        onPress={() => onHoleSelect(hole.number)}
      >
        <Text
          style={[
            styles.cellNumber,
            isDark && styles.cellNumberDark,
          ]}
        >
          {t('tournament.scorecard.hole', { number: hole.number })}
        </Text>
        <Text
          style={[
            styles.cellScore,
            { color: getScoreColor(hole.score, hole.par) },
          ]}
        >
          {hole.score ?? '—'}
        </Text>
        <Text style={[
            styles.cellPar,
            isDark && styles.cellParDark,
          ]}>
          {t('tournament.scorecard.parValue', { value: hole.par })}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSummaryCell = (label: string, score: number, totalPar: number) => {
    const vsPar = score - totalPar;

    return (
      <View style={[styles.cell, styles.summaryCell, isDark && styles.summaryCellDark]}>
        <Text style={[styles.summaryLabel, isDark && styles.summaryLabelDark]}>
          {label}
        </Text>
        <Text style={[styles.summaryScore, isDark && styles.summaryScoreDark]}>
          {score}
        </Text>
        <Text style={[styles.summaryVsPar, isDark && styles.summaryVsParDark]}>
          {vsPar > 0 ? `+${vsPar}` : vsPar === 0 ? 'E' : vsPar}
        </Text>
      </View>
    );
  };

  const frontNineHoles = holes.slice(0, 9);
  const backNineHoles = holes.slice(9, 18);

  const totalParFront = frontNineHoles.reduce((sum, h) => sum + h.par, 0);
  const totalParBack = backNineHoles.reduce((sum, h) => sum + h.par, 0);
  const totalPar = totalParFront + totalParBack;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>
        {t('tournament.scorecard.title')}
      </Text>

      {/* Front 9 - 5x2 Grid */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          {t('tournament.scorecard.front9')}
        </Text>
        <View style={styles.gridContainer}>
          {frontNineHoles.map((hole) => renderHoleCell(hole))}
          {renderSummaryCell(t('tournament.scorecard.out'), front9Total, totalParFront)}
        </View>
      </View>

      {/* Back 9 - 5x2 Grid */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          {t('tournament.scorecard.back9')}
        </Text>
        <View style={styles.gridContainer}>
          {backNineHoles.map((hole) => renderHoleCell(hole))}
          {renderSummaryCell(t('tournament.scorecard.in'), back9Total, totalParBack)}
        </View>
      </View>

      {/* Totals */}
      <View
        style={[
          styles.totalsRow,
          isDark && styles.totalsRowDark,
        ]}
      >
        <View style={styles.totalItem}>
          <Text style={[styles.totalLabel, isDark && styles.totalLabelDark]}>
            {t('tournament.scorecard.total')}
          </Text>
          <Text style={[styles.totalValue, isDark && styles.totalValueDark]}>
            {totalScore}
          </Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={[styles.totalLabel, isDark && styles.totalLabelDark]}>
            {t('tournament.scorecard.par')}
          </Text>
          <Text style={[styles.totalValue, isDark && styles.totalValueDark]}>
            {totalPar}
          </Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={[styles.totalLabel, isDark && styles.totalLabelDark]}>
            {t('tournament.scorecard.vsPar')}
          </Text>
          <Text
            style={[
              styles.totalValue,
              {
                color:
                  totalScore > totalPar
                    ? '#ef4444'
                    : totalScore < totalPar
                      ? '#10b981'
                      : '#6b7280',
              },
              isDark && styles.totalValueDark,
            ]}
          >
            {totalScore > totalPar ? '+' : ''}
            {totalScore - totalPar}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  containerDark: {
    backgroundColor: '#2b3137',
    borderColor: '#495057',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1d21',
    marginBottom: 12,
  },
  titleDark: {
    color: '#ffffff',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  sectionTitleDark: {
    color: '#d1d5db',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cell: {
    width: '18%',
    minHeight: 65,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cellDark: {
    backgroundColor: '#1a1d21',
    borderColor: '#495057',
  },
  cellSelected: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    borderWidth: 2,
  },
  cellSelectedDark: {
    backgroundColor: '#1a3a1a',
    borderColor: '#22c55e',
    borderWidth: 2,
  },
  cellNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 1,
    textAlign: 'center',
  },
  cellNumberDark: {
    color: '#d1d5db',
  },
  cellScore: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 1,
    textAlign: 'center',
  },
  cellPar: {
    fontSize: 9,
    fontWeight: '500',
    color: '#9ca3af',
    marginTop: 1,
    textAlign: 'center',
  },
  cellParDark: {
    color: '#d1d5db',
  },
  summaryCell: {
    backgroundColor: '#2d7a4e',
    borderColor: '#2d7a4e',
    borderWidth: 1,
  },
  summaryCellDark: {
    backgroundColor: '#1e4d30',
    borderColor: '#2d7a4e',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 1,
    textAlign: 'center',
  },
  summaryLabelDark: {
    color: '#ffffff',
  },
  summaryScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginVertical: 1,
    textAlign: 'center',
  },
  summaryScoreDark: {
    color: '#ffffff',
  },
  summaryVsPar: {
    fontSize: 9,
    fontWeight: '500',
    color: '#e0f2e9',
    marginTop: 1,
    textAlign: 'center',
  },
  summaryVsParDark: {
    color: '#e0f2e9',
  },
  totalsRow: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 4,
  },
  totalsRowDark: {
    backgroundColor: '#1a1d21',
    borderColor: '#495057',
  },
  totalItem: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  totalLabelDark: {
    color: '#d1d5db',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1d21',
  },
  totalValueDark: {
    color: '#ffffff',
  },
});
