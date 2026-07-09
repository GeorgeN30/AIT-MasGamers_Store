const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: __dirname + '/../.env' });

const CRYPTO_API_URL = process.env.NOTIFY_API_URL || 'https://core.geozns.com';
const CRYPTO_API_KEY = process.env.NOTIFY_API_KEY;

const client = axios.create({
  baseURL: CRYPTO_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${CRYPTO_API_KEY}`,
  },
  timeout: 5000,
});

async function signJwt(userId, claims, ttlSecs, appId) {
  try {
    const body = {
      user_id: userId,
      claims,
      ttl_secs: ttlSecs || 3600,
    };
    if (appId) body.app_id = appId;
    const response = await client.post('/v1/jwt/sign', body);
    return response.data.token;
  } catch (err) {
    console.warn('Crypto-vault JWT sign failed, falling back to local sign:', err.response?.data || err.message);
    const localClaims = { sub: userId, id: userId, ...claims };
    if (appId) localClaims.app_id = appId;
    return jwt.sign(localClaims, process.env.JWT_SECRET, {
      expiresIn: (ttlSecs || 3600) + 's',
    });
  }
}

async function verifyJwt(token) {
  try {
    const response = await client.post('/v1/jwt/verify', { token });
    if (response.data.valid) {
      const claims = response.data.claims;
      const decoded = { ...claims.extra, id: claims.sub, sub: claims.sub };
      if (claims.app_id) decoded.app_id = claims.app_id;
      return decoded;
    }
  } catch {
    // vault verify failed, try local
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}

module.exports = { signJwt, verifyJwt };