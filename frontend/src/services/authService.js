import { api } from './api';

export const authService = {
  login(email, password) {
    return api.post('/auth/login', { email, password });
  },

  register(userData) {
    return api.post('/auth/register', userData);
  },

  forgotPassword(email) {
    return api.post('/auth/forgot-password', { email });
  },

  verifyOtp(email, codigo) {
    return api.post('/auth/verify-otp', { email, codigo });
  },

  resetPassword(email, newPassword, resetToken) {
    return api.post('/auth/reset-password', { email, newPassword, resetToken });
  },

  resendOtp(email) {
    return api.post('/auth/resend-otp', { email });
  },

  getProfile() {
    return api.get('/auth/me');
  },

  updateProfile(userData) {
    return api.put('/users/profile', userData);
  },

  changePassword(currentPassword, newPassword) {
    return api.put('/users/password', { currentPassword, newPassword });
  },
};
