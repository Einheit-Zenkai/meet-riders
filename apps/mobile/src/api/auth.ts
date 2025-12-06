import type { AxiosResponse } from 'axios';
import { apiClient } from './client';

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

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  if (!process.env.EXPO_PUBLIC_API_URL) {
    // Fallback for development without a configured API.
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
};
