# Google OAuth Setup Guide for MeetRiders

This guide will help you set up **free** Google authentication for both web and mobile apps using Supabase. No Google Cloud billing required!

## Overview

Your friend was right - you can use Google OAuth completely free! Here's what you need to know:
- **Google Cloud Platform** offers OAuth for free (no billing required)
- **Supabase** makes it super easy to configure
- Both your web and mobile apps are already coded and ready to go!

## Prerequisites

- A Supabase project (you already have this)
- A Google account
- Your project already has the OAuth buttons implemented!

---

## Part 1: Create Google OAuth Credentials (FREE!)

### Step 1: Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. **Skip any billing setup prompts** - you don't need billing for OAuth!

### Step 2: Create a New Project (or select existing)

1. Click the project dropdown in the top navigation bar
2. Click "New Project"
3. Name it something like "MeetRiders" or "MeetRiders Auth"
4. Click "Create"
5. Wait for the project to be created, then select it

### Step 3: Enable Google+ API (Required for OAuth)

1. In the left sidebar, go to **"APIs & Services" > "Library"**
2. Search for "Google+ API" or "People API"
3. Click on it and click **"Enable"**
4. This is **FREE** and required for OAuth to work

### Step 4: Configure OAuth Consent Screen

1. Go to **"APIs & Services" > "OAuth consent screen"**
2. Choose **"External"** (this allows anyone with a Google account to sign in)
3. Click **"Create"**

#### Fill in the required fields:
- **App name**: MeetRiders (or your app name)
- **User support email**: Your email address
- **App logo**: (Optional - you can skip this)
- **App domain** section: (You can leave these blank for now)
- **Authorized domains**: Add your domain if you have one (e.g., `meetriders.com`)
  - For localhost testing, you can skip this
- **Developer contact information**: Your email address

4. Click **"Save and Continue"**

#### Scopes (Step 2):
- Click **"Add or Remove Scopes"**
- Add these scopes (should be automatically included):
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
  - `openid`
- Click **"Update"** then **"Save and Continue"**

#### Test users (Step 3):
- If your app is in "Testing" mode, add your email and any test users
- Click **"Save and Continue"**

5. Review and click **"Back to Dashboard"**

**Note:** Your app will be in "Testing" mode by default. This is fine for development. When ready to launch publicly, click "Publish App" on the OAuth consent screen.

### Step 5: Create OAuth 2.0 Client ID

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials" > "OAuth 2.0 Client ID"**

#### Create Web Application Credentials:

1. **Application type**: Web application
2. **Name**: "MeetRiders Web" (or any name)
3. **Authorized JavaScript origins**:
   - Add `http://localhost:3000` (for local testing)
   - Add your production domain when ready (e.g., `https://meetriders.com`)
4. **Authorized redirect URIs**:
   - Add your Supabase callback URL (see below)

**Finding your Supabase callback URL:**
- Go to your [Supabase Dashboard](https://supabase.com/dashboard)
- Select your project
- Go to **Authentication > Providers > Google**
- Copy the "Callback URL (for OAuth)" - it looks like:
  ```
  https://your-project-ref.supabase.co/auth/v1/callback
  ```
- Paste this into "Authorized redirect URIs"

5. Click **"Create"**
6. **SAVE YOUR CREDENTIALS!** You'll see:
   - **Client ID**: Something like `123456789-abc123xyz.apps.googleusercontent.com`
   - **Client Secret**: A random string
   - Copy both of these - you'll need them for Supabase!

#### Create Mobile Application Credentials (for Expo):

1. Click **"Create Credentials" > "OAuth 2.0 Client ID"** again
2. **Application type**: Android **or** iOS (create both if needed)

**For Android:**
- **Package name**: `com.meetriders.app` (check your `apps/mobile/app.json` for the exact package)
- **SHA-1 certificate fingerprint**:
  - For development, get your debug keystore fingerprint:
    ```bash
    # On Windows (PowerShell)
    cd $env:USERPROFILE\.android
    keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
    ```
  - Copy the SHA-1 fingerprint
  - For production, use your production keystore's SHA-1

**For iOS:**
- **Bundle ID**: `com.meetriders.app` (check your `apps/mobile/app.json`)

3. Click **"Create"**
4. Save the Client ID (you'll need this for mobile)

---

## Part 2: Configure Supabase

### Step 1: Enable Google Provider in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication > Providers**
4. Find **Google** in the list
5. Toggle it **ON** (enabled)

### Step 2: Add Your Google Credentials

In the Google provider settings:

1. **Client ID (for OAuth)**: Paste your **Web Application** Client ID from Google Cloud Console
2. **Client Secret (for OAuth)**: Paste your Client Secret
3. **Authorized Client IDs**: 
   - If you created Android/iOS credentials, add those Client IDs here (one per line)
   - This allows your mobile app to authenticate
4. Click **"Save"**

### Step 3: Verify Callback URL

- Make sure your Google Cloud Console has the Supabase callback URL in the "Authorized redirect URIs"
- It should look like: `https://your-project-ref.supabase.co/auth/v1/callback`

---

## Part 3: Configure Your Apps

### Web App Configuration

Your web app is already configured! The code is ready in:
- [apps/web/src/app/(Authentication)/login/page.tsx](apps/web/src/app/(Authentication)/login/page.tsx)
- [apps/web/src/app/(Authentication)/signup/page.tsx](apps/web/src/app/(Authentication)/signup/page.tsx)

Just make sure your `.env.local` file has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Mobile App Configuration

Your mobile app is also ready! The OAuth code is in:
- [apps/mobile/src/screens/LoginScreen.tsx](apps/mobile/src/screens/LoginScreen.tsx)
- [apps/mobile/src/screens/SignupScreen.tsx](apps/mobile/src/screens/SignupScreen.tsx)
- [apps/mobile/src/api/auth.ts](apps/mobile/src/api/auth.ts)

**Deep Linking Configuration (Already Done):**

Your `apps/mobile/app.json` should have the `scheme` configured:
```json
{
  "expo": {
    "scheme": "meetriders"
  }
}
```

**Environment Variables:**

Make sure your `apps/mobile/.env` has:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Part 4: Testing

### Test Web App (localhost:3000)

1. Start your web app: `pnpm dev:web`
2. Go to `http://localhost:3000/login`
3. Click **"Sign in with Google"**
4. You should be redirected to Google's OAuth consent screen
5. Sign in with your Google account
6. You'll be redirected back to your app and logged in!

### Test Mobile App

1. Start your mobile app: `pnpm dev:mobile`
2. Open the app on your device/simulator
3. Go to the login screen
4. Tap **"Sign in with Google"**
5. A browser will open for Google OAuth
6. Sign in and authorize
7. You'll be redirected back to the app!

---

## Troubleshooting

### "Access blocked: Authorization Error"

**Cause:** Your app is in "Testing" mode and you're trying to log in with a Google account that's not added as a test user.

**Solution:**
- Go to Google Cloud Console > OAuth consent screen
- Add your email to "Test users"
- OR publish your app (click "Publish App" on the OAuth consent screen)

### "redirect_uri_mismatch"

**Cause:** The redirect URI in your request doesn't match what you configured in Google Cloud Console.

**Solution:**
- Double-check that the Supabase callback URL is added to "Authorized redirect URIs" in Google Cloud Console
- Format: `https://your-project-ref.supabase.co/auth/v1/callback`

### "Invalid Client"

**Cause:** The Client ID or Client Secret is incorrect.

**Solution:**
- Re-check your Client ID and Secret in Google Cloud Console
- Make sure you're using the **Web Application** credentials in Supabase (not Android/iOS)
- Update them in Supabase Authentication > Providers > Google

### Mobile app not redirecting back

**Cause:** Deep linking is not properly configured.

**Solution:**
- Check `apps/mobile/app.json` has `"scheme": "meetriders"`
- Make sure the OAuth redirect URL in `apps/mobile/src/api/auth.ts` uses the correct scheme
- Try rebuilding the app: `expo prebuild --clean`

### "Invalid grant" or "Token exchange failed"

**Cause:** The authorization code may have expired or been used already.

**Solution:**
- Try signing in again (codes are single-use)
- Clear your browser cache and cookies
- Check that your system clock is accurate

---

## Production Deployment

When you're ready to deploy to production:

### 1. Update Google Cloud Console

Add your production URLs to "Authorized JavaScript origins" and "Authorized redirect URIs":
- JavaScript origins: `https://yourdomain.com`
- Redirect URIs: Keep the Supabase callback URL

### 2. Publish Your OAuth Consent Screen

- Go to Google Cloud Console > OAuth consent screen
- Click **"Publish App"**
- This removes the "Testing" limitation

### 3. Update Environment Variables

Make sure your production environment has the correct Supabase credentials.

---

## Why This is FREE

- **Google Cloud Platform**: OAuth 2.0 is completely free, no billing account needed
- **Supabase**: Free tier includes unlimited OAuth authentications
- **No hidden costs**: You only pay if you use paid Google Cloud services (which OAuth is not)

Your friend was absolutely right - this is **100% free** for authentication! 🎉

---

## Need Help?

If you run into issues:

1. Check the Supabase logs: Dashboard > Logs > Auth logs
2. Check browser console for errors
3. Verify all redirect URIs match exactly
4. Make sure test users are added if app is in Testing mode

---

## Summary

✅ **Web app is ready** - Just configure Supabase
✅ **Mobile app is ready** - Just configure Supabase  
✅ **Completely FREE** - No billing required
✅ **Easy setup** - Follow steps above

Your apps already have Google Sign-In buttons and all the OAuth code implemented. Just follow the Supabase configuration steps above and you'll be up and running!
