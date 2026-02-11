import { getEnvVar } from '../lib/env';

const baseURL = getEnvVar('EXPO_PUBLIC_API_URL') ?? 'https://api.meetriders.example.com';

let authToken: string | undefined;

export const setAuthToken = (token?: string): void => {
  authToken = token;
};

// Simple fetch-based API client (replaces axios to avoid Node.js built-in issues)
export const apiClient = {
  async post<T>(endpoint: string, data?: unknown): Promise<{ data: T }> {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    const json = await response.json();
    return { data: json };
  },
  
  async get<T>(endpoint: string): Promise<{ data: T }> {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    const json = await response.json();
    return { data: json };
  },
};
