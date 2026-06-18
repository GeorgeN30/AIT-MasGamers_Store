import { api } from './api';

export const ticketService = {
  getAll() {
    return api.get('/tickets');
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
