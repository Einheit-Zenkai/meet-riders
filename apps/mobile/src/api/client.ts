import axios from 'axios';

import { getEnvVar } from '../lib/env';

const baseURL = getEnvVar('EXPO_PUBLIC_API_URL') ?? 'https://api.meetriders.example.com';

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
});

export const setAuthToken = (token?: string): void => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};
