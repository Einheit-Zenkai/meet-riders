# Dashboard Module

This module contains the refactored dashboard page with improved maintainability and modularity.

## Structure

```
dashboard/
├── components/           # Dashboard-specific components
│   ├── DashboardHeader.tsx      # Main header component
│   ├── SearchAndFilters.tsx     # Search bar with filters
│   ├── NotificationsDropdown.tsx # Notifications dropdown
│   ├── ThemeToggle.tsx          # Theme switcher
│   ├── LogoutButton.tsx         # Logout functionality
│   ├── RidesList.tsx            # Rides list display
│   ├── LoadingScreen.tsx        # Loading state
│   └── index.ts                 # Component exports
├── hooks/               # Custom hooks
│   └── useDashboard.ts          # Dashboard business logic
├── page.tsx            # Main dashboard page
└── README.md           # This file
```

## Components

### DashboardHeader
Main header component that combines search, filters, and actions.

**Props:**
- `welcomeName: string | null` - User's display name
- Filter-related props for search and filtering functionality

### SearchAndFilters
Search bar with dropdown filters panel.

**Features:**
- Real-time destination search
- Time window filtering
- Future: Department and year filtering

### NotificationsDropdown
Notifications display with unread count badge.

**Features:**
- Click outside to close
- Unread count indicator
- Expandable for future notification system

### ThemeToggle
Theme switcher between light and dark modes.

**Features:**
- Persists theme preference to localStorage
- Smooth transitions

### LogoutButton
Logout functionality with confirmation dialog.

**Features:**
- Confirmation dialog before logout
- Loading state during logout process

### RidesList
Displays available rides with loading and empty states.

**Features:**
- Loading skeleton
- Empty state with call-to-action
- Responsive design

### LoadingScreen
Reusable loading component with spinner and customizable message.

### DashboardPartyCard
Specialized party card component that works with Supabase Party data.

**Features:**
- **Supabase Integration**: Works with the correct Party interface from Supabase
- Real-time countdown timer
- Host vs. participant views
- Join/Cancel party functionality
- University badge display
- Friends-only indicator
- Proper date handling for expiry timestamps

## Hooks

### useDashboard
Custom hook that encapsulates all dashboard business logic.

**Returns:**
- User profile state
- Loading states
- Filtered and ordered parties
- Filter controls
- Refresh function for parties

**Features:**
- **Supabase Integration**: Fetches parties directly from the `parties` table
- Profile validation and redirection
- University-based ride ordering
- Real-time filtering
- **Auto-refresh**: Parties refresh every 30 seconds
- Error handling and loading states
- **Real-time Updates**: Proper date handling for expiry timestamps

## Benefits of This Structure

1. **Separation of Concerns**: Business logic is separated from UI components
2. **Reusability**: Components can be easily reused or moved
3. **Testability**: Each component and hook can be tested independently
4. **Maintainability**: Changes are localized to specific components
5. **Type Safety**: Full TypeScript coverage with proper interfaces
6. **Performance**: Optimized with proper memoization and state management

## Best Practices Implemented

- ✅ Single Responsibility Principle
- ✅ Proper TypeScript interfaces
- ✅ Error handling and loading states
- ✅ Accessibility considerations
- ✅ Clean component composition
- ✅ Custom hooks for business logic
- ✅ Click outside to close functionality
- ✅ Proper state management
- ✅ Responsive design patterns
