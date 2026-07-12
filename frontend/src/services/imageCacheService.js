import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { API_BASE_URL } from '../config';

const CACHE_DIR = `${FileSystem.cacheDirectory}images/`;

async function ensureCacheDir() {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
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
    return `${base}${uri}`;
  }
  return uri;
}

export async function getCachedImage(uri) {
  if (!uri) return null;

  const fullUrl = getFullUrl(uri);
  if (!fullUrl) return null;

  if (Platform.OS === 'web') return fullUrl;

  try {
    await ensureCacheDir();

    const hash = hashString(fullUrl);
    const ext = fullUrl.includes('.webp') ? '.webp' : fullUrl.includes('.png') ? '.png' : '.jpg';
    const cachePath = `${CACHE_DIR}${hash}${ext}`;

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
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
    }
  } catch {}
}
