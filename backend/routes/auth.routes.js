const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { prepare } = require('../db');
const { verifyToken } = require('../middleware/auth');
const { generateOtp, verifyOtp, resendOtp } = require('../services/notifyService');
const { signJwt } = require('../services/cryptoService');
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existing = prepare('SELECT id FROM users WHERE email = ?').get([email.toLowerCase()]);

    if (existing) {
      return res.status(400).json({ message: 'Este correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const id = uuidv4();
    prepare(
      'INSERT INTO users (id, name, email, password, securityWord, role) VALUES (?, ?, ?, ?, ?, ?)'
    ).run([id, name.trim(), email.toLowerCase(), hashedPassword, '', 'user']);

    res.status(201).json({ message: 'Cuenta creada exitosamente' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }

    const user = prepare('SELECT * FROM users WHERE email = ?').get([email.toLowerCase()]);

    if (!user) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'Tu cuenta ha sido desactivada. Contacta al administrador.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    const ttl = 7 * 24 * 3600;
    const token = await signJwt(user.id, { email: user.email, role: user.role, name: user.name }, ttl);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'El correo es obligatorio' });
    }

    const user = prepare('SELECT id, email FROM users WHERE email = ?').get([email.toLowerCase()]);

    if (!user) {
      return res.status(404).json({ message: 'No existe una cuenta con este correo' });
    }

    await generateOtp(email.toLowerCase());

    res.json({ message: 'Código de recuperación enviado a tu correo' });
  } catch (err) {
    console.error('Forgot password error:', err);
    if (err.response) {
      const status = err.response.status;
      if (status === 401) return res.status(500).json({ message: 'Error de autenticación con el servicio de correo' });
      if (status === 429) return res.status(429).json({ message: 'Demasiados intentos. Intenta de nuevo en una hora.' });
    }
    res.status(500).json({ message: 'Error al enviar el código de recuperación' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
      return res.status(400).json({ message: 'Correo y código son obligatorios' });
    }

    const result = await verifyOtp(email.toLowerCase(), codigo);

    if (!result.valido) {
      return res.status(400).json({ message: 'Código inválido' });
    }

    const resetToken = jwt.sign(
      { email: email.toLowerCase(), purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    res.json({ message: 'Código válido', resetToken });
  } catch (err) {
    console.error('Verify OTP error:', err);
    if (err.response) {
      const status = err.response.status;
      if (status === 404) return res.status(400).json({ message: 'Código inválido o expirado' });
    }
    res.status(500).json({ message: 'Error al verificar el código' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword, resetToken } = req.body;

    if (!email || !newPassword || !resetToken) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido o expirado. Solicita un nuevo código.' });
    }

    if (decoded.purpose !== 'password-reset' || decoded.email !== email.toLowerCase()) {
      return res.status(401).json({ message: 'Token inválido para este correo' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    prepare('UPDATE users SET password = ? WHERE email = ?').run([hashedPassword, email.toLowerCase()]);

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'El correo es obligatorio' });
    }

    const user = prepare('SELECT id FROM users WHERE email = ?').get([email.toLowerCase()]);

    if (!user) {
      return res.status(404).json({ message: 'No existe una cuenta con este correo' });
    }

    await resendOtp(email.toLowerCase());

    res.json({ message: 'Código reenviado a tu correo' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    if (err.response && err.response.status === 404) {
      return res.status(400).json({ message: 'No hay un código activo. Solicita uno nuevo.' });
    }
    res.status(500).json({ message: 'Error al reenviar el código' });
  }
});

router.get('/me', verifyToken, (req, res) => {
  const user = prepare(
    'SELECT id, name, email, role, avatar, created_at, active FROM users WHERE id = ?'
  ).get([req.user.id]);

  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  if (!user.active) {
    return res.status(403).json({ message: 'Tu cuenta ha sido desactivada. Contacta al administrador.' });
  }

  const { active, ...safeUser } = user;
  res.json({ user: safeUser });
});

module.exports = router;
