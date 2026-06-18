const express = require('express');
const { prepare } = require('../db');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

router.get('/', verifyToken, requireRole('admin'), (req, res) => {
  try {
    const users = prepare(
      'SELECT id, name, email, role, avatar, created_at FROM users ORDER BY created_at DESC'
    ).all();

    res.json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
