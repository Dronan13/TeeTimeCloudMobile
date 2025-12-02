import { useTheme } from '@/contexts/ThemeContext';

/**
 * Hook to conditionally apply dark mode classes with NativeWind
 *
 * @example
 * const { tw } = useThemedStyles();
 * <View className={tw('bg-white dark:bg-gray-800')} />
 */
export function useThemedStyles() {
  const { isDark } = useTheme();

  /**
   * Conditionally adds 'dark' to className string when dark mode is active
   * This makes NativeWind's dark: prefix work correctly
   */
  const tw = (classNames: string): string => {
    return isDark ? `dark ${classNames}` : classNames;
  };

  return { tw, isDark };
}
