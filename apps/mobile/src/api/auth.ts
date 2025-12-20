import type { AxiosResponse } from 'axios';
import type { Session, User } from '@supabase/supabase-js';

import { apiClient } from './client';
import { getSupabaseClient } from '../lib/supabase';
import { hasEnvVar } from '../lib/env';

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

    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/login', payload);
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

    const response: AxiosResponse<SignupResponse> = await apiClient.post('/auth/signup', payload);
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
