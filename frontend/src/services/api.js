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

  _mimeType(uri) {
    const ext = uri.split('.').pop()?.toLowerCase();
    const map = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
                  webm: 'audio/webm', mp4: 'audio/mp4', m4a: 'audio/mp4',
                  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg' };
    return map[ext] || 'image/jpeg';
  }

  async upload(endpoint, fileUri, fieldName = 'file') {
    const token = await this.getToken();
    const formData = new FormData();
    const mimeType = this._mimeType(fileUri);
    const ext = fileUri.split('.').pop() || 'jpg';

    const isWeb = typeof window !== 'undefined' && window.document;
    if (isWeb) {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      formData.append(fieldName, blob, `upload.${ext}`);
    } else {
      formData.append(fieldName, {
        uri: fileUri,
        type: mimeType,
        name: `upload.${ext}`,
      });
    }

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
