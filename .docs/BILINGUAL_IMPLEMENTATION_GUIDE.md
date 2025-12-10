# Bilingual Support Implementation Guide

## ✅ Completed Work

I've successfully implemented bilingual support (English/Spanish) for your TeeTime Cloud mobile app. Here's what has been completed:

### Infrastructure Setup ✅
1. **Installed i18next packages**: `i18next` and `react-i18next`
2. **Created translation files**:
   - [src/locales/en.json](src/locales/en.json) - English translations
   - [src/locales/es.json](src/locales/es.json) - Spanish translations
3. **Created LanguageContext**: [src/contexts/LanguageContext.tsx](src/contexts/LanguageContext.tsx)
   - Provides `useLanguage()` hook with `t()` function for translations
   - Manages language preference with AsyncStorage persistence
   - Initialized i18next with both language resources
4. **Updated App.tsx**: Wrapped app with `LanguageProvider`
5. **Created LanguageSelector component**: [src/components/LanguageSelector.tsx](src/components/LanguageSelector.tsx)
   - Beautiful UI matching ThemeToggle style
   - Flag icons for each language
   - Integrated with language context

### Completed Screen Updates ✅
- ✅ [LandingScreen.tsx](src/screens/LandingScreen.tsx) - All text translated
- ✅ [SignInScreen.tsx](src/screens/SignInScreen.tsx) - All text and alerts translated
- ✅ [HomeScreen.tsx](src/screens/HomeScreen.tsx) - All text translated
- ✅ [ProfileScreen.tsx](src/screens/ProfileScreen.tsx) - All text, menu items, and alerts translated + LanguageSelector added
- ✅ [ThemeToggle.tsx](src/components/ThemeToggle.tsx) - Theme options translated

### Completed Navigation Updates ✅
- ✅ [AppTabs.tsx](src/navigation/AppTabs.tsx) - All tab titles and navigation headers translated
  - Home, Courses, Tee Times, Notifications, Profile tabs
  - CoursesStackNavigator: CoursesList, CourseDetail, CourseTeeTimesScreen, ReservationScreen
  - ProfileStackNavigator: ProfileMain, ProfileEdit, UpdatePassword, Support, TermsOfUse

---

## 📋 Remaining Screens to Update

The following 11 screens still need bilingual support added:

### Auth Screens
1. **ForgotPasswordScreen.tsx** - Password reset screen
2. **UpdatePasswordScreen.tsx** - Change password screen

### Course Screens
3. **CoursesScreen.tsx** - Golf courses list
4. **CourseDetailScreen.tsx** - Individual course details
5. **CourseTeeTimesScreen.tsx** - Available tee times for a course
6. **ReservationScreen.tsx** - Book a tee time

### Booking Screens
7. **TeeTimesScreen.tsx** - User's tee time reservations

### Notification & Profile Screens
8. **NotificationsScreen.tsx** - Notifications feed
9. **ProfileEditScreen.tsx** - Edit user profile
10. **SupportScreen.tsx** - Support/help screen
11. **TermsOfUseScreen.tsx** - Terms and conditions

---

## 🔧 How to Update Remaining Screens

Follow this pattern for each screen:

### Step 1: Import useLanguage hook
```typescript
import { useLanguage } from '@/contexts/LanguageContext';
```

### Step 2: Add hook to component
```typescript
export default function YourScreen() {
  // ... existing hooks
  const { t } = useLanguage();

  // ... rest of component
}
```

### Step 3: Replace hardcoded text with t() calls

**Before:**
```typescript
<Text>Welcome Back</Text>
<Alert.alert('Error', 'Please fill in all fields');
```

**After:**
```typescript
<Text>{t('auth.signIn.title')}</Text>
<Alert.alert(t('common.error'), t('auth.signIn.errorAllFields'));
```

### Step 4: Use translation keys from translation files

All translation keys are already defined in:
- `src/locales/en.json`
- `src/locales/es.json`

**Example translation structure:**
```json
{
  "courses": {
    "title": "Courses",
    "searchPlaceholder": "Search courses...",
    "details": {
      "title": "Course Details",
      "about": "About"
    }
  }
}
```

**Usage in component:**
```typescript
<Text>{t('courses.title')}</Text>
<Text>{t('courses.details.about')}</Text>
```

---

## 📝 Example: Updating ForgotPasswordScreen

### Before:
```typescript
export default function ForgotPasswordScreen({ navigation }) {
  const { isDark } = useTheme();

  return (
    <View>
      <Text>Forgot Password</Text>
      <Text>Enter your email to reset your password</Text>
      <TextInput placeholder="Enter your email" />
      <Button title="Send Reset Link" />
    </View>
  );
}
```

### After:
```typescript
import { useLanguage } from '@/contexts/LanguageContext';

export default function ForgotPasswordScreen({ navigation }) {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <View>
      <Text>{t('auth.forgotPassword.title')}</Text>
      <Text>{t('auth.forgotPassword.subtitle')}</Text>
      <TextInput placeholder={t('auth.forgotPassword.emailPlaceholder')} />
      <Button title={t('auth.forgotPassword.sendResetLink')} />
    </View>
  );
}
```

---

## 🗂️ Translation Key Reference

Here are the main translation key categories available:

### Common Keys
- `common.loading`
- `common.error`
- `common.success`
- `common.cancel`
- `common.save`
- `common.viewDetails`
- etc.

### Navigation Keys
- `navigation.home`
- `navigation.courses`
- `navigation.teeTimes`
- `navigation.notifications`
- `navigation.profile`

### Auth Keys
- `auth.signIn.*`
- `auth.forgotPassword.*`
- `auth.updatePassword.*`
- `auth.signOut.*`

### Screen-Specific Keys
- `home.*`
- `courses.*`
- `teeTimes.*`
- `reservation.*`
- `notifications.*`
- `profile.*`

### Theme & Language
- `theme.title`, `theme.light`, `theme.dark`, `theme.system`
- `language.title`, `language.english`, `language.spanish`

---

## ✨ Features Already Working

1. **Language Switching**: Users can switch between English and Spanish from ProfileScreen
2. **Persistent Selection**: Language choice is saved to AsyncStorage
3. **Navigation Titles**: All navigation headers update with language changes
4. **Alert Messages**: System alerts use translated text
5. **Theme Integration**: Language selector styled to match dark/light themes

---

## 🧪 Testing

To test bilingual support:

1. **Run the app**: `npx expo start`
2. **Navigate to Profile**: Tap Profile tab
3. **Change language**: Use Language Selector to switch between English/Spanish
4. **Verify translations**: Navigate through app to see all translated screens
5. **Test persistence**: Close and reopen app to verify language persists

### What to Check:
- ✅ All navigation titles change
- ✅ All button text changes
- ✅ All labels and placeholders change
- ✅ Alert messages appear in selected language
- ✅ No missing translations (check console for warnings)

---

## 🐛 Troubleshooting

### If translations don't appear:
1. Check translation key exists in both `en.json` and `es.json`
2. Verify `useLanguage()` hook is imported and used
3. Check console for missing translation warnings
4. Restart app/clear cache if needed

### If language doesn't persist:
1. Check AsyncStorage permissions
2. Verify LanguageProvider wraps entire app in App.tsx
3. Check no errors in LanguageContext

---

## 📚 Additional Resources

- **i18next Documentation**: https://www.i18next.com/
- **React-i18next Docs**: https://react.i18next.com/
- **Translation Files**: Check `src/locales/` directory for all available keys

---

## ✅ Next Steps

1. Update remaining 11 screens following the pattern above
2. Test all screens in both English and Spanish
3. Add any missing translation keys to `en.json` and `es.json`
4. Ensure all alerts, error messages, and form validation use translations

---

**Note**: All core infrastructure is complete! You just need to apply the `t()` function to replace hardcoded strings in the remaining screens. The translation keys are already defined and ready to use.
