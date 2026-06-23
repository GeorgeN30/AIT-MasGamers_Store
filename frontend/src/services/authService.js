import { api } from './api';

export const authService = {
  login(email, password) {
    return api.post('/auth/login', { email, password });
  },

  register(userData) {
    return api.post('/auth/register', userData);
  },

  verifySecurityWord(email, securityWord) {
    return api.post('/auth/verify-security', { email, securityWord });
  },

  resetPassword(email, securityWord, newPassword) {
    return api.post('/auth/reset-password', { email, securityWord, newPassword });
  },

  getProfile() {
    return api.get('/auth/me');
  },
};
