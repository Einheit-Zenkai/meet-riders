import type { Session, User, Provider } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { apiClient } from './client';
import { getSupabaseClient } from '../lib/supabase';
import { hasEnvVar, getEnvVar } from '../lib/env';

// Ensure web browser redirect is handled properly
WebBrowser.maybeCompleteAuthSession();

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface SignupResponse extends AuthResponse {
  confirmationRequired: boolean;
}

const buildAuthResponse = (session: Session | null, user: User | null, fallbackEmail: string): AuthResponse => ({
  token: session?.access_token ?? '',
  user: {
    id: user?.id ?? 'unknown',
    email: user?.email ?? fallbackEmail,
  },
});

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const supabase = getSupabaseClient();
  const hasRemoteApi = hasEnvVar('EXPO_PUBLIC_API_URL');

  if (!supabase) {
    if (!hasRemoteApi) {
      return {
        token: 'dev-token',
        user: {
          id: 'local',
          email: payload.email,
        },
      };
    }

    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    return response.data;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error) {
    throw error;
  }

  return buildAuthResponse(data.session, data.user, payload.email);
};

export const signup = async (payload: SignupPayload): Promise<SignupResponse> => {
  const supabase = getSupabaseClient();
  const hasRemoteApi = hasEnvVar('EXPO_PUBLIC_API_URL');

  if (!supabase) {
    if (!hasRemoteApi) {
      return {
        token: 'dev-token',
        user: {
          id: 'local',
          email: payload.email,
        },
        confirmationRequired: false,
      };
    }

    const response = await apiClient.post<SignupResponse>('/auth/signup', payload);
    return response.data;
  }

  const { data: existing, error: existingError } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', payload.username)
    .maybeSingle();

  if (existingError && existingError.code !== 'PGRST116') {
    throw existingError;
  }

  if (existing) {
    const duplicationError = new Error('USERNAME_IN_USE');
    duplicationError.name = 'UsernameTaken';
    throw duplicationError;
  }

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        username: payload.username,
      },
    },
  });

  if (error) {
    throw error;
  }

  return {
    ...buildAuthResponse(data.session, data.user, payload.email),
    confirmationRequired: !data.user?.email_confirmed_at,
  };
};

/**
 * Get the redirect URL for OAuth providers.
 * This uses the app scheme configured in app.json for deep linking.
 */
const getOAuthRedirectUrl = (): string => {
  return AuthSession.makeRedirectUri({
    scheme: 'meetriders',
    path: 'auth/callback',
  });
};

export type OAuthProvider = 'google' | 'azure';

export interface OAuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
  };
  needsOnboarding?: boolean;
  error?: string;
}

/**
 * Sign in with OAuth provider (Google or Microsoft/Azure).
 * Opens a web browser for authentication and handles the redirect.
 */
export const signInWithOAuth = async (provider: OAuthProvider): Promise<OAuthResult> => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: 'Supabase client not configured. Please check your environment variables.',
    };
  }

  const redirectUrl = getOAuthRedirectUrl();

  try {
    // Get the OAuth URL from Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider === 'azure' ? 'azure' : 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.url) {
      return {
        success: false,
        error: 'Failed to get authentication URL',
      };
    }

    // Open the OAuth URL in a web browser
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (result.type !== 'success') {
      return {
        success: false,
        error: result.type === 'cancel' ? 'Authentication was cancelled' : 'Authentication failed',
      };
    }

    // Extract tokens from the redirect URL
    const url = result.url;
    const params = new URL(url);
    const hashParams = new URLSearchParams(params.hash.substring(1));
    const queryParams = new URLSearchParams(params.search);

    // Try to get tokens from hash fragment (implicit flow) or query params
    const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');

    if (accessToken) {
      // Set the session manually
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });

      if (sessionError) {
        return {
          success: false,
          error: sessionError.message,
        };
      }

      const user = sessionData.user;

      // Check if user has completed onboarding (has a profile with nickname)
      let needsOnboarding = true;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', user.id)
          .maybeSingle();

        needsOnboarding = !profile?.nickname;
      }

      return {
        success: true,
        user: {
          id: user?.id || '',
          email: user?.email || '',
        },
        needsOnboarding,
      };
    }

    // Check for error in the response
    const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
    if (errorDescription) {
      return {
        success: false,
        error: decodeURIComponent(errorDescription),
      };
    }

    return {
      success: false,
      error: 'No access token received from authentication provider',
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
  }
};

/**
 * Sign up with OAuth provider (Google or Microsoft/Azure).
 * This is essentially the same as sign in - OAuth handles both cases.
 */
export const signUpWithOAuth = signInWithOAuth;
