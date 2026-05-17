/**
 * Almacenamiento persistente multiplataforma.
 * Móvil: instala AsyncStorage y descomenta las líneas marcadas.
 * `npx expo install @react-native-async-storage/async-storage`
 */

import { Platform } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageService = {
  getItem: async (key) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    // return await AsyncStorage.getItem(key);
    return null;
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    // await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
    // await AsyncStorage.removeItem(key);
  },
};

export const STORAGE_KEYS = {
  SESSION: 'mg_session',          // { token, user }
  REGISTERED_USERS: 'mg_users',  // usuarios registrados via app
};
