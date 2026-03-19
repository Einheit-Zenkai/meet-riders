import AsyncStorage from '@react-native-async-storage/async-storage';

const EXTERNAL_NOTIFICATIONS_KEY = 'mr_external_notifications_enabled';

export const getExternalNotificationsEnabled = async (): Promise<boolean> => {
  const raw = await AsyncStorage.getItem(EXTERNAL_NOTIFICATIONS_KEY);
  if (raw === null) {
    return true;
  }
  return raw === '1';
};

export const setExternalNotificationsEnabled = async (enabled: boolean): Promise<void> => {
  await AsyncStorage.setItem(EXTERNAL_NOTIFICATIONS_KEY, enabled ? '1' : '0');
};
