import { storageService, STORAGE_KEYS } from './storageService';
import { API_BASE_URL } from '../config';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async getToken() {
    try {
      const raw = await storageService.getItem(STORAGE_KEYS.SESSION);
      if (raw) {
        const { token } = JSON.parse(raw);
        return token;
      }
    } catch {}
    return null;
  }

  async request(endpoint, options = {}) {
    const token = await this.getToken();
    const headers = { 'Content-Type': 'application/json' };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { ...options, headers: { ...headers, ...options.headers } };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error del servidor');
    }

    return data;
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async upload(endpoint, fileUri, fieldName = 'file') {
    const token = await this.getToken();
    const formData = new FormData();

    formData.append(fieldName, {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al subir archivo');
    }
    return data;
  }
}

export const api = new ApiClient();
