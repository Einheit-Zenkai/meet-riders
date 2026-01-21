# OAuth Setup Guide for MeetRiders Mobile

This guide explains how to set up Google and Microsoft (Azure) OAuth authentication for the MeetRiders mobile app.

## Prerequisites

1. Supabase project configured with OAuth providers
2. Expo app running on Android

---

## 1. Supabase Dashboard Configuration

### Google OAuth Setup

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **Providers**
3. Find and enable **Google**
4. You'll need:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)

#### Getting Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application** (Supabase handles the OAuth flow)
6. Add authorized redirect URIs:
   ```
   https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
   ```
7. Copy the Client ID and Client Secret to Supabase

### Microsoft (Azure) OAuth Setup

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** → **Providers**
3. Find and enable **Azure** (Microsoft)
4. You'll need:
   - **Client ID** (Application ID from Azure)
   - **Client Secret** (from Azure)
   - **Azure Tenant URL** (optional, use 'common' for multi-tenant)

#### Getting Microsoft OAuth Credentials:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: MeetRiders
   - **Supported account types**: Choose based on your needs
     - "Accounts in any organizational directory and personal Microsoft accounts" for broadest access
   - **Redirect URI**: Select "Web" and enter:
     ```
     https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
     ```
5. After registration, note the **Application (client) ID**
6. Go to **Certificates & secrets** → **New client secret**
7. Copy the secret value (shown only once!)
8. In Supabase, paste:
   - Client ID = Application (client) ID
   - Client Secret = Secret value
   - Azure Tenant URL = `https://login.microsoftonline.com/common` (for multi-tenant)

---

## 2. Supabase Redirect URL Configuration

In your Supabase Dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Add the following to **Redirect URLs**:
   ```
   meetriders://auth/callback
   ```

This allows the OAuth flow to redirect back to the mobile app.

---

## 3. Mobile App Configuration

The app is already configured with the necessary code. Ensure your environment variables are set:

In `apps/mobile/.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://<YOUR-PROJECT-REF>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<YOUR-ANON-KEY>
```

---

## 4. Testing OAuth

1. Rebuild the Android app after making changes:
   ```bash
   cd apps/mobile
   pnpm android
   ```

2. On the Login or Signup screen, tap "Sign in with Google" or "Sign in with Microsoft"

3. The app will open a web browser for authentication

4. After successful auth, you'll be redirected back to the app

---

## Troubleshooting

### "Authentication was cancelled"
- User closed the browser before completing sign-in
- Check if popup blockers are interfering

### "No access token received"
- Verify redirect URLs are correctly configured in Supabase
- Check that the OAuth provider credentials are correct

### Deep link not working
- Rebuild the app after modifying `app.json`
- Verify the scheme is set to `meetriders` in `app.json`
- For development, use `expo run:android` instead of Expo Go

### "Supabase client not configured"
- Check your environment variables are correctly set
- Restart the Expo development server

---

## Security Notes

1. Never expose your Client Secrets in client-side code
2. Use Supabase's server-side OAuth handling
3. Keep your Supabase anon key secure but understand it's designed to be public
4. Enable Row Level Security (RLS) on all your tables
