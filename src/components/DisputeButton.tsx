import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
} from 'react-native';
import { Flag } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface DisputeButtonProps {
  roundId: string;
  isDisputeFlagged?: boolean;
  onDisputeSubmit: (reason: string) => Promise<void>;
  loading?: boolean;
}

export default function DisputeButton({
  roundId,
  isDisputeFlagged = false,
  onDisputeSubmit,
  loading = false,
}: DisputeButtonProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const handleRequestDispute = () => {
    if (isDisputeFlagged) {
      Alert.alert(
        'Dispute Already Flagged',
        'This round has already been flagged for dispute review.',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }

    Alert.prompt(
      'Request Dispute Review',
      'Please explain why you are requesting a dispute for this round:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: async (reason) => {
            if (!reason || reason.trim().length === 0) {
              Alert.alert('Error', 'Please provide a reason for the dispute.');
              return;
            }

            try {
              await onDisputeSubmit(reason.trim());
              Alert.alert(
                'Success',
                'Your dispute request has been submitted. An administrator will review it shortly.'
              );
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to submit dispute request. Please try again.'
              );
            }
          },
          style: 'default',
        },
      ],
      'plain-text'
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDark && styles.buttonDark,
        isDisputeFlagged && styles.buttonFlagged,
      ]}
      onPress={handleRequestDispute}
      disabled={loading}
      activeOpacity={0.8}
      accessibilityLabel="Request dispute review"
      accessibilityRole="button"
      accessible
    >
      {loading ? (
        <ActivityIndicator size="small" color={isDark ? '#ffffff' : '#1a1d21'} />
      ) : (
        <>
          <Flag
            size={16}
            color={isDisputeFlagged ? '#fbbf24' : isDark ? '#ffffff' : '#1a1d21'}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.buttonText,
              isDark && styles.buttonTextDark,
              isDisputeFlagged && styles.buttonTextFlagged,
            ]}
          >
            {isDisputeFlagged ? 'Dispute Flagged' : 'Request Dispute'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  buttonDark: {
    backgroundColor: '#2b3137',
    borderColor: '#495057',
  },
  buttonFlagged: {
    backgroundColor: '#fffbeb',
    borderColor: '#fbbf24',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1d21',
  },
  buttonTextDark: {
    color: '#ffffff',
  },
  buttonTextFlagged: {
    color: '#b45309',
  },
});
