# Quick Start: Google OAuth Setup

## What Was Done

✅ **Web App** - Added Google OAuth buttons to:
  - Login page: [apps/web/src/app/(Authentication)/login/page.tsx](apps/web/src/app/(Authentication)/login/page.tsx)
  - Signup page: [apps/web/src/app/(Authentication)/signup/page.tsx](apps/web/src/app/(Authentication)/signup/page.tsx)
  - OAuth callback handler: [apps/web/src/app/auth/callback/route.ts](apps/web/src/app/auth/callback/route.ts)

✅ **Mobile App** - Already has Google OAuth buttons in:
  - Login screen: [apps/mobile/src/screens/LoginScreen.tsx](apps/mobile/src/screens/LoginScreen.tsx)
  - Signup screen: [apps/mobile/src/screens/SignupScreen.tsx](apps/mobile/src/screens/SignupScreen.tsx)
  - OAuth implementation: [apps/mobile/src/api/auth.ts](apps/mobile/src/api/auth.ts)

## Next Steps (5 minutes)

### 1. Get Google OAuth Credentials (FREE!)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable Google+ API (it's in APIs & Services > Library)
4. Set up OAuth consent screen (APIs & Services > OAuth consent screen)
   - Choose "External"
   - Fill in app name and your email
   - Add scopes: email, profile, openid
5. Create credentials (APIs & Services > Credentials)
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Type: **Web application**
   - Add Supabase callback URL to "Authorized redirect URIs"
     - Get it from: Supabase Dashboard > Authentication > Providers > Google
     - Format: `https://your-project.supabase.co/auth/v1/callback`
   - Save your **Client ID** and **Client Secret**

### 2. Configure Supabase (1 minute)

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to Authentication > Providers
3. Enable **Google**
4. Paste your Client ID and Client Secret
5. Click Save

### 3. Test It Out

**Web:**
```bash
pnpm dev:web
```
Go to http://localhost:3000/login and click "Sign in with Google"

**Mobile:**
```bash
pnpm dev:mobile
```
Open the app and tap "Sign in with Google"

## Troubleshooting

### "Access blocked" error?
- Add your email as a test user in Google Cloud Console > OAuth consent screen
- OR publish your app (click "Publish App")

### "redirect_uri_mismatch" error?
- Double-check the Supabase callback URL is in Google Cloud Console's "Authorized redirect URIs"

## Full Documentation

See [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) for detailed instructions and troubleshooting.

---

**Note:** Google OAuth is completely FREE - no billing required! 🎉
