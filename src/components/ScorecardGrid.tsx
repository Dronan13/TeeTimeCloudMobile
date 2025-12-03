import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
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
  const { isDark } = useTheme();

  const getScoreColor = (score: number | null, par: number) => {
    if (score === null) return '#d1d5db';
    const diff = score - par;
    if (diff < 0) return '#10b981'; // Under par (green)
    if (diff > 0) return '#ef4444'; // Over par (red)
    return '#6b7280'; // Even (gray)
  };

  const renderHoleCell = (hole: HoleData, isTotal = false) => {
    const isSelected = hole.number === currentHole;

    return (
      <TouchableOpacity
        key={`hole-${hole.number}`}
        style={[
          styles.cell,
          isDark && styles.cellDark,
          isSelected && styles.cellSelected,
          isDark && isSelected && styles.cellSelectedDark,
          isTotal && styles.cellTotal,
          isDark && isTotal && styles.cellTotalDark,
        ]}
        onPress={() => !isTotal && onHoleSelect(hole.number)}
        disabled={isTotal}
      >
        <Text
          style={[
            styles.cellNumber,
            isDark && styles.cellNumberDark,
            isTotal && styles.cellTotalText,
          ]}
        >
          {hole.number}
        </Text>
        <Text
          style={[
            styles.cellScore,
            { color: getScoreColor(hole.score, hole.par) },
            isDark && styles.cellScoreDark,
            isTotal && styles.cellTotalText,
          ]}
        >
          {hole.score ?? '—'}
        </Text>
      </TouchableOpacity>
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
        Score Card
      </Text>

      {/* Front 9 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Front 9
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gridRow}
        >
          {frontNineHoles.map((hole) => renderHoleCell(hole))}
          <View style={[styles.cell, styles.cellTotal, isDark && styles.cellTotalDark]}>
            <Text style={[styles.cellNumber, styles.cellTotalText]}>OUT</Text>
            <Text style={[styles.cellScore, styles.cellTotalText]}>
              {front9Total}
            </Text>
            <Text style={[styles.cellPar, styles.cellTotalText]}>
              {totalParFront}
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Back 9 */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Back 9
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gridRow}
        >
          {backNineHoles.map((hole) => renderHoleCell(hole))}
          <View style={[styles.cell, styles.cellTotal, isDark && styles.cellTotalDark]}>
            <Text style={[styles.cellNumber, styles.cellTotalText]}>IN</Text>
            <Text style={[styles.cellScore, styles.cellTotalText]}>
              {back9Total}
            </Text>
            <Text style={[styles.cellPar, styles.cellTotalText]}>
              {totalParBack}
            </Text>
          </View>
        </ScrollView>
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
            Total
          </Text>
          <Text style={[styles.totalValue, isDark && styles.totalValueDark]}>
            {totalScore}
          </Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={[styles.totalLabel, isDark && styles.totalLabelDark]}>
            Par
          </Text>
          <Text style={[styles.totalValue, isDark && styles.totalValueDark]}>
            {totalPar}
          </Text>
        </View>
        <View style={styles.totalItem}>
          <Text style={[styles.totalLabel, isDark && styles.totalLabelDark]}>
            vs Par
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
    marginBottom: 12,
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
  gridRow: {
    flexDirection: 'row',
    gap: 6,
  },
  cell: {
    minWidth: 50,
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    alignItems: 'center',
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
  cellTotal: {
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#6b7280',
    minWidth: 60,
  },
  cellTotalDark: {
    backgroundColor: '#1a1d21',
    borderColor: '#9ca3af',
  },
  cellNumber: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 2,
  },
  cellNumberDark: {
    color: '#d1d5db',
  },
  cellScore: {
    fontSize: 16,
    fontWeight: '700',
  },
  cellScoreDark: {
    color: '#ffffff',
  },
  cellPar: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9ca3af',
    marginTop: 2,
  },
  cellTotalText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
