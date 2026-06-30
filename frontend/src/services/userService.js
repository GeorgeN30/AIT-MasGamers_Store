import { api } from './api';

export const userService = {
  getAll() {
    return api.get('/users');
  },

  update(id, data) {
    return api.put(`/users/${id}`, data);
  },

  deactivate(id) {
    return api.post(`/users/${id}/deactivate`);
  },

  restore(id) {
    return api.put(`/users/${id}/restore`);
  },
};
