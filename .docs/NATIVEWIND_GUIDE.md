# NativeWind & Dark Mode Guide

This guide explains how to use NativeWind styling and the dark mode theme system in TeeTime Cloud.

## Table of Contents
1. [Theme System Overview](#theme-system-overview)
2. [Using NativeWind Classes](#using-nativewind-classes)
3. [Dark Mode Support](#dark-mode-support)
4. [Example Components](#example-components)

## Theme System Overview

The app uses a custom theme system with three modes:
- **Light**: Always use light theme
- **Dark**: Always use dark theme
- **System**: Follow device system preference (default)

### Theme Provider
The `ThemeProvider` wraps the entire app in [App.tsx](App.tsx) and provides theme state to all components.

### useTheme Hook
Access theme state in any component:

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, activeTheme, setTheme, isDark } = useTheme();

  // theme: 'light' | 'dark' | 'system' (user preference)
  // activeTheme: 'light' | 'dark' (actual active theme)
  // isDark: boolean (true if dark mode is active)
  // setTheme: function to change theme mode
}
```

## Using NativeWind Classes

NativeWind allows you to use Tailwind CSS classes directly in React Native components.

### Basic Usage

```tsx
import { View, Text } from 'react-native';

function Example() {
  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold text-gray-900">
        Hello World
      </Text>
    </View>
  );
}
```

### Common Classes

```tsx
// Layout
className="flex-1"
className="flex-row items-center justify-between"
className="absolute top-0 left-0 right-0"

// Spacing
className="p-4 m-2"          // padding & margin (4 = 16px, 2 = 8px)
className="px-4 py-2"        // horizontal & vertical
className="mt-4 mb-2"        // top & bottom margin

// Colors
className="bg-white text-gray-900"
className="bg-primary text-white"    // uses custom colors from tailwind.config.js

// Typography
className="text-base font-normal"
className="text-xl font-bold"
className="text-sm text-gray-500"

// Borders & Rounded
className="border border-gray-300 rounded-lg"
className="rounded-full"

// Shadows (iOS)
className="shadow-md shadow-lg"
```

## Dark Mode Support

### Method 1: Using StyleSheet (Current Approach)

The current implementation uses React Native StyleSheet with conditional dark mode styles:

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.text, isDark && styles.textDark]}>
        Hello
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#1f2937',
  },
  text: {
    color: '#111827',
  },
  textDark: {
    color: '#f9fafb',
  },
});
```

### Method 2: Using NativeWind Dark Classes

You can also use NativeWind's built-in dark mode support with the `dark:` prefix:

```tsx
import { useThemedStyles } from '@/hooks/useThemedStyles';

function MyComponent() {
  const { tw } = useThemedStyles();

  return (
    <View className={tw('bg-white dark:bg-gray-800 p-4')}>
      <Text className={tw('text-gray-900 dark:text-gray-100 text-lg')}>
        Hello
      </Text>
    </View>
  );
}
```

**Important:** The `tw()` helper is required to make `dark:` prefixes work correctly. It adds the "dark" class when dark mode is active.

### Custom Theme Colors

Use custom colors defined in [tailwind.config.js](tailwind.config.js):

```tsx
// Primary brand color (green)
className="bg-primary text-white"
className="bg-primary-500 hover:bg-primary-600"

// Light mode specific colors
className="bg-light-background text-light-foreground"

// Dark mode specific colors
className="bg-dark-background text-dark-foreground"

// Conditional
className={tw('bg-light-card dark:bg-dark-card')}
```

## Example Components

### Example 1: Simple Card

```tsx
import { View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

function Card({ title, description }: { title: string; description: string }) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        isDark && styles.cardDark
      ]}
    >
      <Text style={[styles.title, isDark && styles.titleDark]}>
        {title}
      </Text>
      <Text style={[styles.description, isDark && styles.descriptionDark]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardDark: {
    backgroundColor: '#1f2937',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  titleDark: {
    color: '#f9fafb',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
  },
  descriptionDark: {
    color: '#9ca3af',
  },
});
```

### Example 2: Using NativeWind

```tsx
import { View, Text } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';

function Card({ title, description }: { title: string; description: string }) {
  const { tw } = useThemedStyles();

  return (
    <View className={tw('bg-white dark:bg-gray-800 p-4 rounded-xl mb-3')}>
      <Text className={tw('text-lg font-bold text-gray-900 dark:text-gray-100 mb-2')}>
        {title}
      </Text>
      <Text className={tw('text-sm text-gray-600 dark:text-gray-400')}>
        {description}
      </Text>
    </View>
  );
}
```

### Example 3: Theme Toggle Component

See [src/components/ThemeToggle.tsx](src/components/ThemeToggle.tsx) for a complete example of a theme switcher component.

## Color Reference

### From tailwind.config.js

```js
// Primary (Green)
primary-50  → #f0fdf4
primary-500 → #22c55e (default)
primary-700 → #15803d

// Light Mode
light-background → #f9fafb
light-foreground → #1f2937
light-card      → #ffffff
light-border    → #e5e7eb
light-muted     → #6b7280

// Dark Mode
dark-background → #111827
dark-foreground → #f9fafb
dark-card       → #1f2937
dark-border     → #374151
dark-muted      → #9ca3af
```

## Best Practices

1. **Consistency**: Choose either StyleSheet or NativeWind for each component, don't mix both approaches in the same component.

2. **Use the tw() helper**: When using NativeWind dark mode classes, always wrap with `tw()`:
   ```tsx
   ✅ className={tw('bg-white dark:bg-gray-800')}
   ❌ className="bg-white dark:bg-gray-800"  // dark: won't work
   ```

3. **Test both modes**: Always test your UI in both light and dark modes.

4. **Use semantic colors**: Prefer theme colors over hardcoded hex values:
   ```tsx
   ✅ text-light-foreground dark:text-dark-foreground
   ❌ text-[#1f2937] dark:text-[#f9fafb]
   ```

5. **Accessibility**: Ensure sufficient contrast in both themes:
   - Light mode: dark text on light backgrounds
   - Dark mode: light text on dark backgrounds

## Migration Guide

To convert existing StyleSheet components to support dark mode:

1. Import `useTheme` hook
2. Get `isDark` boolean
3. Create dark variants of your styles
4. Apply conditional styles: `style={[styles.base, isDark && styles.baseDark]}`

Example:
```tsx
// Before
<View style={styles.container}>
  <Text style={styles.text}>Hello</Text>
</View>

// After
const { isDark } = useTheme();

<View style={[styles.container, isDark && styles.containerDark]}>
  <Text style={[styles.text, isDark && styles.textDark]}>Hello</Text>
</View>
```

## Additional Resources

- [NativeWind Documentation](https://www.nativewind.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Native Documentation](https://reactnative.dev/)
