import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import type {
  UserDto,
  SubjectDto,
  LearningSessionDto,
  AnalyticsSummaryDto,
  StreakSummaryDto,
} from '@devlearn/types';

export const AUTH_TOKEN_KEY = '@devlearn_auth_token';
export const API_URL_KEY = '@devlearn_api_url';

/**
 * Dynamically determine backend URL.
 * When running Expo Go on a physical phone, Constants.expoConfig?.hostUri contains the
 * computer's local Wi-Fi IP address (e.g. 192.168.18.62:8081).
 */
export function getDefaultHost(): string {
  // 1. Try to extract IP from Expo Metro bundler hostUri (physical phone / Expo Go)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000/api`;
    }
  }

  // 2. Fallbacks for emulators / simulators / web
  return (
    Platform.select({
      android: 'http://10.0.2.2:5000/api',
      ios: 'http://localhost:5000/api',
      default: 'http://localhost:5000/api',
    }) || 'http://localhost:5000/api'
  );
}

export const apiClient = axios.create({
  baseURL: getDefaultHost(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Load saved custom API base URL if specified
AsyncStorage.getItem(API_URL_KEY).then((savedUrl) => {
  if (savedUrl) {
    apiClient.defaults.baseURL = savedUrl;
  }
});


// Request interceptor to attach JWT Authorization header
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // Ignore error reading token
  }
  return config;
});

// Response interceptor to handle unauthenticated 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
// MOBILE API CLIENT FUNCTIONS
// -------------------------------------------------------------

export const mobileApi = {
  // Base URL configuration
  setBaseUrl: async (url: string) => {
    apiClient.defaults.baseURL = url;
    await AsyncStorage.setItem(API_URL_KEY, url);
  },
  getBaseUrl: async () => {
    return (await AsyncStorage.getItem(API_URL_KEY)) || getDefaultHost();
  },


  // Authentication
  login: async (email: string, password: string): Promise<{ user: UserDto; token?: string }> => {
    const res = await apiClient.post('/auth/login', { email, password });
    const data = res.data?.data;
    if (data?.token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
    }
    return data;
  },

  register: async (name: string, email: string, password: string): Promise<{ user: UserDto; token?: string }> => {
    const res = await apiClient.post('/auth/register', { name, email, password });
    const data = res.data?.data;
    if (data?.token) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
    }
    return data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  },

  getMe: async (): Promise<UserDto> => {
    const res = await apiClient.get('/users/me');
    return res.data?.data?.user;
  },

  // Subjects
  getSubjects: async (): Promise<SubjectDto[]> => {
    const res = await apiClient.get('/subjects');
    return res.data?.data?.subjects || [];
  },

  createSubject: async (name: string, description?: string): Promise<SubjectDto> => {
    const res = await apiClient.post('/subjects', { name, description });
    return res.data?.data?.subject;
  },


  // Sessions
  getSessions: async (limit: number = 20): Promise<LearningSessionDto[]> => {
    const res = await apiClient.get(`/learning/sessions?limit=${limit}`);
    return res.data?.data?.sessions || [];
  },

  logSession: async (payload: {
    subjectId: string;
    durationMinutes: number;
    topic?: string;
    learnedNotes?: string;
    date?: string;
  }): Promise<LearningSessionDto> => {
    const res = await apiClient.post('/learning/sessions', {
      ...payload,
      date: payload.date || new Date().toISOString(),
    });
    return res.data?.data?.session;
  },

  deleteSession: async (id: string): Promise<void> => {
    await apiClient.delete(`/learning/sessions/${id}`);
  },

  // Analytics & Streaks
  getAnalyticsSummary: async (): Promise<AnalyticsSummaryDto> => {
    const res = await apiClient.get('/analytics/summary');
    return res.data?.data?.summary;
  },

  getStreaks: async (): Promise<StreakSummaryDto> => {
    const res = await apiClient.get('/analytics/streaks');
    return res.data?.data?.streak;
  },
};
