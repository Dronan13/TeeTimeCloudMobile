import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ScoreInputProps {
  currentScore: number | null;
  onScoreChange: (score: number | null) => void;
  holePar: number;
}

export default function ScoreInput({
  currentScore,
  onScoreChange,
  holePar,
}: ScoreInputProps) {
  const { isDark } = useTheme();

  // Score options: 1-9 directly, 10+ with X button
  const scoreOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const getScoreColor = (score: number | null) => {
    if (score === null) return '#6b7280';
    const diff = score - holePar;
    if (diff < 0) return '#10b981'; // Under par (green)
    if (diff > 0) return '#ef4444'; // Over par (red)
    return '#6b7280'; // Even (gray)
  };

  const handleScorePress = (score: number) => {
    // If clicking same score, toggle double digit or clear
    if (currentScore === score) {
      onScoreChange(score + 10);
    } else {
      onScoreChange(score);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Display current score */}
      <View style={[styles.displayBox, isDark && styles.displayBoxDark]}>
        <Text style={[styles.displayLabel, isDark && styles.displayLabelDark]}>
          Score
        </Text>
        <Text
          style={[
            styles.displayValue,
            {
              color: getScoreColor(currentScore),
            },
          ]}
        >
          {currentScore ?? '—'}
        </Text>
        {currentScore !== null && (
          <Text style={[styles.parDiff, isDark && styles.parDiffDark]}>
            {currentScore > holePar ? '+' : ''}
            {currentScore - holePar} vs par {holePar}
          </Text>
        )}
      </View>

      {/* Number pad grid */}
      <View style={styles.padGrid}>
        {scoreOptions.map((score) => {
          const isSelected = currentScore === score;
          const isDoubleDigit = currentScore === score + 10;

          return (
            <TouchableOpacity
              key={score}
              style={[
                styles.numberButton,
                isDark && styles.numberButtonDark,
                isSelected && styles.numberButtonActive,
                isDark && isSelected && styles.numberButtonActiveDark,
                isDoubleDigit && styles.numberButtonDouble,
                isDark && isDoubleDigit && styles.numberButtonDoubleDark,
              ]}
              onPress={() => handleScorePress(score)}
            >
              <Text
                style={[
                  styles.numberText,
                  isDark && styles.numberTextDark,
                  (isSelected || isDoubleDigit) && styles.numberTextActive,
                ]}
              >
                {score}
              </Text>
              {isDoubleDigit && (
                <Text
                  style={[
                    styles.numberText,
                    isDark && styles.numberTextDark,
                    styles.numberTextActive,
                  ]}
                >
                  +
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Clear button */}
      <TouchableOpacity
        style={[styles.clearButton, isDark && styles.clearButtonDark]}
        onPress={() => onScoreChange(null)}
      >
        <X size={20} color={isDark ? '#ffffff' : '#1a1d21'} />
        <Text style={[styles.clearButtonText, isDark && styles.clearButtonTextDark]}>
          Clear
        </Text>
      </TouchableOpacity>

      {/* Helper text */}
      <Text style={[styles.helperText, isDark && styles.helperTextDark]}>
        Tap a score twice to add 10
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  containerDark: {
    backgroundColor: '#2b3137',
    borderColor: '#495057',
  },
  displayBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  displayBoxDark: {
    backgroundColor: '#1a1d21',
    borderColor: '#495057',
  },
  displayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  displayLabelDark: {
    color: '#d1d5db',
  },
  displayValue: {
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 2,
  },
  parDiff: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  parDiffDark: {
    color: '#d1d5db',
  },
  padGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 0,
  },
  numberButton: {
    flex: 1,
    minWidth: '30%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  numberButtonDark: {
    backgroundColor: '#1a1d21',
    borderColor: '#495057',
  },
  numberButtonActive: {
    backgroundColor: '#2d7a4e',
    borderColor: '#2d7a4e',
  },
  numberButtonActiveDark: {
    backgroundColor: '#2d7a4e',
    borderColor: '#22c55e',
  },
  numberButtonDouble: {
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  numberButtonDoubleDark: {
    borderStyle: 'dashed',
  },
  numberText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1d21',
    textAlign: 'center',
  },
  numberTextDark: {
    color: '#ffffff',
  },
  numberTextActive: {
    color: '#ffffff',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
    marginBottom: 6,
  },
  clearButtonDark: {
    backgroundColor: '#1a1d21',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1d21',
  },
  clearButtonTextDark: {
    color: '#ffffff',
  },
  helperText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  helperTextDark: {
    color: '#6b7280',
  },
});
