const axios = require('axios');
require('dotenv').config();

const GATEWAY_API_URL = process.env.NOTIFY_API_URL || 'https://core.geozns.com';
const GATEWAY_API_KEY = process.env.NOTIFY_API_KEY;

const APP_ID = 'MasGamers-movil';

const client = axios.create({
  baseURL: GATEWAY_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${GATEWAY_API_KEY}`,
  },
  timeout: 5000,
});

async function notifyUser(userId, payload) {
  try {
    const response = await client.post('/v1/notify', {
      app_id: APP_ID,
      user_id: userId,
      payload,
      fallback_push: false,
      device_tokens: [],
    });
    return response.data;
  } catch (err) {
    console.error(`Gateway notifyUser error (${userId}):`, err.response?.data || err.message);
    return null;
  }
}

async function notifyAdmins(payload, adminIds) {
  const results = [];
  for (const adminId of adminIds) {
    const result = await notifyUser(adminId, payload);
    results.push(result);
  }
  return results;
}

module.exports = { notifyUser, notifyAdmins, APP_ID };