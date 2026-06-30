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

  updateStatus(id, estado) {
    return api.put(`/tickets/${id}/status`, { estado });
  },

  getLogs(id) {
    return api.get(`/tickets/${id}/logs`);
  },

  uploadMedia(fileUri) {
    return api.upload('/upload', fileUri);
  },
};
