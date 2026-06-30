const jwt = require('jsonwebtoken');
require('dotenv').config();

const { prepare } = require('../db');

function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

function requireActive(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  try {
    const user = prepare('SELECT active FROM users WHERE id = ?').get([req.user.id]);
    if (!user || !user.active) {
      return res.status(403).json({ message: 'Tu cuenta ha sido desactivada. Contacta al administrador.' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Error del servidor' });
  }
}

module.exports = { verifyToken, requireActive };
