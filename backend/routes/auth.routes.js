const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { prepare } = require('../db');
const { verifyToken } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, securityWord } = req.body;

    if (!name || !email || !password || !securityWord) {
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
    const hashedSecurityWord = await bcrypt.hash(securityWord.toLowerCase(), 10);

    const id = uuidv4();
    prepare(
      'INSERT INTO users (id, name, email, password, securityWord, role) VALUES (?, ?, ?, ?, ?, ?)'
    ).run([id, name.trim(), email.toLowerCase(), hashedPassword, hashedSecurityWord, 'user']);

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

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

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

router.post('/verify-security', async (req, res) => {
  try {
    const { email, securityWord } = req.body;

    if (!email || !securityWord) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const user = prepare('SELECT * FROM users WHERE email = ?').get([email.toLowerCase()]);

    if (!user) {
      return res.status(401).json({ message: 'Correo o palabra de seguridad incorrectos' });
    }

    const validWord = await bcrypt.compare(securityWord.toLowerCase(), user.securityWord);
    if (!validWord) {
      return res.status(401).json({ message: 'Correo o palabra de seguridad incorrectos' });
    }

    res.json({ message: 'Identidad verificada' });
  } catch (err) {
    console.error('Verify security error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, securityWord, newPassword } = req.body;

    if (!email || !securityWord || !newPassword) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const user = prepare('SELECT * FROM users WHERE email = ?').get([email.toLowerCase()]);

    if (!user) {
      return res.status(401).json({ message: 'No se pudo verificar la identidad' });
    }

    const validWord = await bcrypt.compare(securityWord.toLowerCase(), user.securityWord);
    if (!validWord) {
      return res.status(401).json({ message: 'No se pudo verificar la identidad' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    prepare('UPDATE users SET password = ? WHERE email = ?').run([hashedPassword, email.toLowerCase()]);

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Error del servidor' });
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
