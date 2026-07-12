import { Platform } from 'react-native';
import { API_BASE_URL } from '../config';

const CACHE_DIR = 'images/';

function getFileSystem() {
  return require('expo-file-system');
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function getFullUrl(uri) {
  if (!uri) return null;
  if (uri.startsWith('http')) return uri;
  if (uri.startsWith('/uploads')) {
    const base = API_BASE_URL.replace('/api', '');
    const url = `${base}${uri}`;
    if (Platform.OS === 'web') return `${url}?t=${Date.now()}`;
    return url;
  }
  return uri;
}

export async function getCachedImage(uri) {
  if (!uri) return null;

  const fullUrl = getFullUrl(uri);
  if (!fullUrl) return null;

  if (Platform.OS === 'web') return fullUrl;

  const FileSystem = getFileSystem();
  const cacheDir = `${FileSystem.cacheDirectory}${CACHE_DIR}`;

  try {
    const dirInfo = await FileSystem.getInfoAsync(cacheDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
    }

    const hash = hashString(fullUrl);
    const ext = fullUrl.includes('.webp') ? '.webp' : fullUrl.includes('.png') ? '.png' : '.jpg';
    const cachePath = `${cacheDir}${hash}${ext}`;

    const cached = await FileSystem.getInfoAsync(cachePath);
    if (cached.exists) {
      return cachePath;
    }

    const download = await FileSystem.downloadAsync(fullUrl, cachePath);
    if (download.status === 200) {
      return cachePath;
    }

    return fullUrl;
  } catch {
    return fullUrl;
  }
}

export async function clearCache() {
  if (Platform.OS === 'web') return;
  const FileSystem = getFileSystem();
  try {
    const cacheDir = `${FileSystem.cacheDirectory}${CACHE_DIR}`;
    const dirInfo = await FileSystem.getInfoAsync(cacheDir);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(cacheDir, { idempotent: true });
    }
  } catch {}
}
