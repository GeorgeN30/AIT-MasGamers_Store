const axios = require('axios');
require('dotenv').config();

const NOTIFY_API_URL = process.env.NOTIFY_API_URL || 'https://core.cable-visiont.com';
const NOTIFY_API_KEY = process.env.NOTIFY_API_KEY;

if (!NOTIFY_API_KEY) {
  console.warn('NOTIFY_API_KEY no configurada en .env');
}

const client = axios.create({
  baseURL: NOTIFY_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${NOTIFY_API_KEY}`,
  },
  timeout: 10000,
});

async function generateOtp(email, appName = 'MasGamers', fromName = 'MasGamers') {
  const response = await client.post('/v1/otp/generate', {
    email,
    app_name: appName,
    from_name: fromName,
  });
  return response.data;
}

async function verifyOtp(email, codigo) {
  const response = await client.post('/v1/otp/verify', {
    email,
    codigo,
  });
  return response.data;
}

async function resendOtp(email, appName = 'MasGamers', fromName = 'MasGamers') {
  const response = await client.post('/v1/otp/resend', {
    email,
    app_name: appName,
    from_name: fromName,
  });
  return response.data;
}

module.exports = { generateOtp, verifyOtp, resendOtp };
