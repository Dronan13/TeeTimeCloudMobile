# NativeWind & Dark Mode Setup - Complete! ✅

## What Has Been Installed

### 1. Dependencies Added
- **nativewind v4.2.1** - Tailwind CSS for React Native
- **tailwindcss@3.3.2** - Tailwind CSS engine
- **babel-plugin-module-resolver** - Path alias support

### 2. Configuration Files Created

#### [tailwind.config.js](tailwind.config.js)
- Configured with NativeWind v4 preset
- Class-based dark mode enabled
- Custom TeeTime Cloud brand colors (primary green palette)
- Custom light and dark theme color tokens
- Content paths for app and src files

#### [babel.config.js](babel.config.js)
- NativeWind v4 babel preset configured
- Module resolver for @/ path aliases
- Expo preset with jsxImportSource

#### [metro.config.js](metro.config.js)
- NativeWind metro configuration
- CSS processing enabled

#### [global.css](global.css)
- Tailwind CSS directives (base, components, utilities)

#### [app.d.ts](app.d.ts)
- TypeScript declarations for NativeWind types

### 3. Theme System Created

#### [src/contexts/ThemeContext.tsx](src/contexts/ThemeContext.tsx)
- ThemeProvider component
- useTheme hook for accessing theme state
- Persistent theme storage using AsyncStorage
- Support for 3 modes: light, dark, system

#### [src/hooks/useThemedStyles.tsx](src/hooks/useThemedStyles.tsx)
- Helper hook for using NativeWind dark mode classes
- `tw()` function to apply dark: prefixes correctly

#### [src/components/ThemeToggle.tsx](src/components/ThemeToggle.tsx)
- Beautiful theme switcher UI component
- Three-option selector: Light ☀️, Dark 🌙, System ⚙️
- Fully themed for both light and dark modes

### 4. Updated Files

#### [App.tsx](App.tsx)
- Added global.css import at the top
- Added ThemeProvider wrapper around the app
- Theme context now available throughout the app

#### [app.json](app.json)
- Changed `userInterfaceStyle` from "light" to "automatic"
- Enables system dark mode detection

#### [src/screens/ProfileScreen.tsx](src/screens/ProfileScreen.tsx)
- Integrated ThemeToggle component
- Added complete dark mode support to all UI elements
- Example of how to implement dark mode in screens

### 5. Documentation

#### [NATIVEWIND_GUIDE.md](NATIVEWIND_GUIDE.md)
- Comprehensive guide for using NativeWind
- Dark mode implementation patterns
- Color reference and best practices
- Code examples and migration guide

## How to Use

### Method 1: Using StyleSheet with Theme Hook (Recommended for Existing Code)

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyScreen() {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.text, isDark && styles.textDark]}>
        Hello World
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#1f2937' },
  text: { color: '#111827' },
  textDark: { color: '#f9fafb' },
});
```

### Method 2: Using NativeWind Classes (Recommended for New Code)

```tsx
import { useThemedStyles } from '@/hooks/useThemedStyles';

function MyScreen() {
  const { tw } = useThemedStyles();

  return (
    <View className={tw('bg-white dark:bg-gray-800 p-4')}>
      <Text className={tw('text-gray-900 dark:text-gray-100 text-lg')}>
        Hello World
      </Text>
    </View>
  );
}
```

### Accessing Theme State

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, activeTheme, isDark, setTheme } = useTheme();

  // Change theme programmatically
  const switchToDark = () => setTheme('dark');
  const switchToLight = () => setTheme('light');
  const useSystem = () => setTheme('system');

  return (
    <View>
      <Text>Current theme: {theme}</Text>
      <Text>Active theme: {activeTheme}</Text>
      <Text>Is dark mode? {isDark ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

## Testing Dark Mode

1. **In the App**:
   - Navigate to Profile screen
   - Use the theme toggle to switch between Light, Dark, and System modes
   - Theme preference is saved and persists across app restarts

2. **System Mode**:
   - Set theme to "System"
   - Change your device's system appearance settings
   - The app will automatically follow your device theme

3. **Testing on Device/Simulator**:
   - iOS: Settings → Display & Brightness → Appearance
   - Android: Settings → Display → Dark theme

## Next Steps

### Migrate Existing Screens

To add dark mode support to other screens:

1. Import the theme hook: `import { useTheme } from '@/contexts/ThemeContext';`
2. Get isDark state: `const { isDark } = useTheme();`
3. Create dark variants of your styles
4. Apply conditional styles: `style={[styles.base, isDark && styles.baseDark]}`

### Example Screens to Update

- [src/screens/HomeScreen.tsx](src/screens/HomeScreen.tsx) - Home dashboard
- [src/screens/CoursesScreen.tsx](src/screens/CoursesScreen.tsx) - Course list
- [src/screens/TeeTimesScreen.tsx](src/screens/TeeTimesScreen.tsx) - Tee times
- [src/screens/NotificationsScreen.tsx](src/screens/NotificationsScreen.tsx) - Notifications
- All other screens in src/screens/

### Color Palette Reference

```
Primary Green:
  #22c55e (primary-500) - Main brand color
  #f0fdf4 (primary-50)  - Light tint
  #15803d (primary-700) - Dark shade

Light Mode:
  Background: #f9fafb
  Foreground: #1f2937
  Card: #ffffff
  Border: #e5e7eb
  Muted: #6b7280

Dark Mode:
  Background: #111827
  Foreground: #f9fafb
  Card: #1f2937
  Border: #374151
  Muted: #9ca3af
```

## Troubleshooting

### Babel Error: ".plugins is not a valid Plugin property"

This was fixed! The babel.config.js has been updated for NativeWind v4. Clear cache and restart:
```bash
rm -rf node_modules/.cache .expo
npm start -- --clear
```

### Dark classes not working?

Make sure you're using the `tw()` helper:
```tsx
// ❌ Wrong
<View className="bg-white dark:bg-gray-800" />

// ✅ Correct
const { tw } = useThemedStyles();
<View className={tw('bg-white dark:bg-gray-800')} />
```

### Theme not persisting?

Check that ThemeProvider is wrapping your app in App.tsx and AsyncStorage has the correct permissions.

### Metro bundler errors?

Clear all caches and restart:
```bash
rm -rf node_modules/.cache .expo
npx expo start --clear
```

### NativeWind styles not applying?

1. Make sure `global.css` is imported in App.tsx (first line)
2. Check that metro.config.js exists and has NativeWind configuration
3. Restart the dev server with `--clear` flag

## Resources

- [NATIVEWIND_GUIDE.md](NATIVEWIND_GUIDE.md) - Complete guide with examples
- [NativeWind Docs](https://www.nativewind.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [src/components/ThemeToggle.tsx](src/components/ThemeToggle.tsx) - Theme toggle implementation
- [src/screens/ProfileScreen.tsx](src/screens/ProfileScreen.tsx) - Dark mode example

---

**Setup completed successfully!** 🎉

Start the dev server and navigate to the Profile screen to see dark mode in action.
