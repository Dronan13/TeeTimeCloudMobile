import { Alert } from 'react-native';
import { TFunction } from 'i18next';

/**
 * Shows a standardized error alert with optional retry action
 * @param t - Translation function from useTranslation hook
 * @param errorKey - The error key from translation files (e.g., 'fetchCourses', 'network')
 * @param retry - Optional retry callback function
 */
export const showError = (
  t: TFunction,
  errorKey: string,
  retry?: () => void
) => {
  const buttons = [
    { text: t('common.cancel'), style: 'cancel' as const },
  ];

  if (retry) {
    buttons.push({
      text: t('common.retry'),
      onPress: retry,
    } as any);
  }

  Alert.alert(
    t('errors.title'),
    t(`errors.${errorKey}`),
    buttons
  );
};

/**
 * Shows a standardized success alert
 * @param t - Translation function from useTranslation hook
 * @param successKey - The success key from translation files (e.g., 'saved', 'updated')
 * @param onDismiss - Optional callback when alert is dismissed
 */
export const showSuccess = (
  t: TFunction,
  successKey: string,
  onDismiss?: () => void
) => {
  Alert.alert(
    t('success.title'),
    t(`success.${successKey}`),
    [{ text: t('common.ok'), onPress: onDismiss }]
  );
};

/**
 * Parses an error and returns the appropriate error key
 * @param error - The error object
 * @returns The error key to use for translation
 */
export const getErrorKey = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('timeout')) {
      return 'timeout';
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'unauthorized';
    }
    if (message.includes('not found') || message.includes('404')) {
      return 'notFound';
    }
    if (message.includes('server') || message.includes('500')) {
      return 'server';
    }
  }

  return 'generic';
};
