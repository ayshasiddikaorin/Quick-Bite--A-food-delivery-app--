import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoredAuth } from '../models/auth';

const AUTH_KEY = 'QUICKBITE_AUTH';

export const getStoredAuth = async (): Promise<StoredAuth | null> => {
  try {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch (error) {
    console.log('Get Auth Error:', error);
    return null;
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  const stored = await getStoredAuth();
  return stored?.token ?? null;
};

export const saveAuth = async (auth: StoredAuth): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch (error) {
    console.log('Save Auth Error:', error);
  }
};

export const clearAuth = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
  } catch (error) {
    console.log('Clear Auth Error:', error);
  }
};
