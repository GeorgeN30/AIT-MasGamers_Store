import { api } from './api';

export const ticketService = {
  getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.q) params.append('q', filters.q);
    const query = params.toString();
    return api.get(`/tickets${query ? '?' + query : ''}`);
  },

  getById(id) {
    return api.get(`/tickets/${id}`);
  },

  create(data) {
    return api.post('/tickets', data);
  },

  updateStatus(id, estado, nota) {
    return api.put(`/tickets/${id}/status`, { estado, nota });
  },

  getLogs(id) {
    return api.get(`/tickets/${id}/logs`);
  },

  updateTicket(id, data) {
    return api.put(`/tickets/${id}`, data);
  },

  deleteTicket(id) {
    return api.post(`/tickets/${id}/delete`, {});
  },

  getRecentActivity() {
    return api.get('/tickets/recent-activity');
  },

  uploadMedia(fileUri, type = 'evidence') {
    return api.upload('/upload', fileUri, 'file', { type });
  },

  getMessages(ticketId) {
    return api.get(`/chat/${ticketId}/messages`);
  },

  sendMessage(ticketId, message) {
    return api.post(`/chat/${ticketId}/messages`, { message });
  },

  getNotifications() {
    return api.get('/chat/notifications');
  },

  markNotificationRead(id) {
    return api.put(`/chat/notifications/${id}/read`, {});
  },

  markAllNotificationsRead() {
    return api.put('/chat/notifications/read-all', {});
  },

  deleteNotification(id) {
    return api.request(`/chat/notifications/${id}`, { method: 'DELETE' });
  },

  deleteAllNotifications() {
    return api.request('/chat/notifications/all', { method: 'DELETE' });
  },

  downloadReport() {
    return `${api.baseUrl}/dashboard/report`;
  },
};
