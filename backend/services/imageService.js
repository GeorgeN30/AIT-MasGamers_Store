const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config({ path: __dirname + '/../.env' });

const GATEWAY_URL = process.env.NOTIFY_API_URL || 'https://core.geozns.com';
const API_KEY = process.env.NOTIFY_API_KEY;

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];

function isImage(filename) {
  const ext = require('path').extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

function getExtensionFromContentType(contentType) {
  const map = {
    'image/webp': '.webp',
    'image/png': '.png',
    'image/jpeg': '.jpg',
  };
  return map[contentType] || '.webp';
}

async function compressImage(fileBuffer, filename, type) {
  const form = new FormData();
  form.append('file', fileBuffer, { filename });

  let endpoint;
  if (type === 'avatar') {
    endpoint = '/v1/image/preset?preset=avatar_md';
  } else {
    endpoint = '/v1/image/compress?quality=80';
  }

  const response = await axios.post(`${GATEWAY_URL}${endpoint}`, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${API_KEY}`,
    },
    responseType: 'arraybuffer',
    timeout: 30000,
  });

  const contentType = response.headers['content-type'] || 'image/webp';
  const newExt = getExtensionFromContentType(contentType);
  const compressedBuffer = Buffer.from(response.data);

  return {
    buffer: compressedBuffer,
    contentType,
    newExtension: newExt,
    originalSize: parseInt(response.headers['x-original-size'] || '0', 10),
    compressedSize: parseInt(response.headers['x-compressed-size'] || '0', 10),
    compressionRatio: response.headers['x-compression-ratio'] || 'N/A',
  };
}

module.exports = { isImage, compressImage };
