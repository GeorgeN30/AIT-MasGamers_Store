/**
 * Servicio de autenticación. Alterna entre mock y API real con USE_MOCK.
 * Para migrar: USE_MOCK = false + actualiza BASE_URL. Las firmas no cambian.
 */

import mockUsers from '../database/mockUsers.json';
import { storageService, STORAGE_KEYS } from './storageService';

const USE_MOCK = true;
const BASE_URL = 'https://tu-api.com/api';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredUsers = async () => {
  try {
    const raw = await storageService.getItem(STORAGE_KEYS.REGISTERED_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveUser = async (user) => {
  const stored = await getStoredUsers();
  stored.push(user);
  await storageService.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(stored));
};


const mockLogin = async (email, password) => {
  await delay(800);
  const allUsers = [...mockUsers.users, ...(await getStoredUsers())];
  const user = allUsers.find((u) => u.email === email && u.password === password);
  if (user) {
    const { password: _, securityWord: __, ...safeUser } = user;
    return { success: true, token: 'fake-jwt-token-12345', user: safeUser };
  }
  throw new Error('Correo o contraseña incorrectos');
};

const mockRegister = async (userData) => {
  await delay(800);
  const allUsers = [...mockUsers.users, ...(await getStoredUsers())];
  if (allUsers.find((u) => u.email === userData.email)) {
    throw new Error('Este correo ya está registrado');
  }
  await saveUser({ id: Date.now(), role: 'user', avatar: null, ...userData });
  return { success: true };
};

// Comparación de securityWord es case-insensitive
const mockVerifySecurityWord = async (email, securityWord) => {
  await delay(800);
  const allUsers = [...mockUsers.users, ...(await getStoredUsers())];
  const match = allUsers.find(
    (u) => u.email === email && u.securityWord?.toLowerCase() === securityWord.toLowerCase()
  );
  if (!match) throw new Error('Correo o palabra de seguridad incorrectos');
  return { success: true };
};

const mockResetPassword = async (email, securityWord, newPassword) => {
  await delay(800);
  // Usuarios del JSON base: no se puede persistir en runtime (lo maneja el backend en prod)
  const isJsonUser = mockUsers.users.find(
    (u) => u.email === email && u.securityWord?.toLowerCase() === securityWord.toLowerCase()
  );
  if (isJsonUser) return { success: true };

  const stored = await getStoredUsers();
  const idx = stored.findIndex(
    (u) => u.email === email && u.securityWord?.toLowerCase() === securityWord.toLowerCase()
  );
  if (idx === -1) throw new Error('No se pudo verificar la identidad');
  stored[idx].password = newPassword;
  await storageService.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(stored));
  return { success: true };
};


const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error del servidor');
  return data;
};

const realLogin = (email, password) =>
  apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

const realRegister = (userData) =>
  apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) });

const realVerifySecurityWord = (email, securityWord) =>
  apiFetch('/auth/verify-security', { method: 'POST', body: JSON.stringify({ email, securityWord }) });

const realResetPassword = (email, securityWord, newPassword) =>
  apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, securityWord, newPassword }) });


export const authService = {
  login: USE_MOCK ? mockLogin : realLogin,
  register: USE_MOCK ? mockRegister : realRegister,
  verifySecurityWord: USE_MOCK ? mockVerifySecurityWord : realVerifySecurityWord,
  resetPassword: USE_MOCK ? mockResetPassword : realResetPassword,
};
