# Settings Page Structure

This settings page has been refactored into a modular, maintainable structure with separated concerns.

## File Structure

```
settings/
├── page.tsx                    # Main settings page component
├── components/                 # Reusable UI components
│   ├── index.ts               # Component exports
│   ├── AvatarSection.tsx      # Avatar upload UI
│   ├── PasswordSection.tsx    # Password change form
│   ├── BasicInfoSection.tsx   # Profile information form
│   ├── TravelPreferences.tsx  # Travel preference selector
│   ├── DangerZone.tsx         # Account deletion and sign out
│   └── SettingsForm.tsx       # Main settings form wrapper
└── hooks/                     # Custom React hooks
    ├── useProfile.ts          # Profile data management
    ├── useAvatarUpload.ts     # Avatar upload functionality
    ├── usePasswordChange.ts   # Password change logic
    └── useSettingsSave.ts     # Settings save functionality
```

## Components

### AvatarSection
- Handles avatar display and file selection
- Shows preview dialog for selected images
- Integrates with avatar upload hook

### PasswordSection
- Password change form
- Validation and error handling
- Independent from main profile data

### BasicInfoSection
- Basic profile information inputs
- Nickname, bio, university, punctuality, ideal location/time
- Input validation (e.g., nickname character restrictions)

### TravelPreferences
- Transport mode preference selection
- Visual ranking system (1, 2, 3, disliked)
- Dynamic UI for unselected modes

### DangerZone
- Account deletion functionality
- Sign out button
- Confirmation dialogs with proper warnings

### SettingsForm
- Main form wrapper
- Integrates all profile sections
- Handles form submission and validation

## Custom Hooks

### useProfile
- Manages all profile data state
- Loads profile from Supabase
- Handles preference state management
- Returns profile data and handlers

### useAvatarUpload
- Manages image file selection and preview
- File reader integration
- Image preview state management

### usePasswordChange
- Password change functionality
- Validation logic
- Success/error state management

### useSettingsSave
- Handles saving profile data
- Image upload to Supabase storage
- Profile update in database
- Loading states and error handling

## Benefits of This Structure

1. **Separation of Concerns**: Each component and hook has a single responsibility
2. **Reusability**: Components can be easily reused or modified
3. **Maintainability**: Smaller, focused files are easier to debug and update
4. **Testability**: Individual components and hooks can be tested in isolation
5. **Type Safety**: Strong TypeScript typing throughout
6. **Performance**: Selective re-renders based on component-specific state changes

## Usage

The main page component (`page.tsx`) orchestrates all the hooks and components:

```tsx
export default function SettingsPage() {
  const { loading: authLoading } = useAuth();
  const { loading: profileLoading, avatarUrl } = useProfile();
  
  const {
    imageFile,
    imagePreview,
    fileInputRef,
    handleImageChange,
    handleAvatarClick,
    setInitialImagePreview,
  } = useAvatarUpload();

  const {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordMsg,
    passwordErr,
    handlePasswordChange,
  } = usePasswordChange();

  // ... rest of component logic
}
```

This structure makes the codebase much more maintainable and easier to work with while preserving all existing functionality.
