const express = require('express');
const bcrypt = require('bcryptjs');
const { prepare } = require('../db');
const { verifyToken, requireActive } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

router.get('/', verifyToken, requireRole('admin'), (req, res) => {
  try {
    const users = prepare(
      'SELECT id, name, email, role, avatar, created_at, active FROM users ORDER BY created_at DESC'
    ).all();

    res.json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.put('/profile', verifyToken, requireActive, (req, res) => {
  try {
    const { name, avatar } = req.body;

    if (!name && avatar === undefined) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ message: 'El nombre no puede estar vacío' });
    }

    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name.trim());
    }
    if (avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(avatar);
    }

    values.push(req.user.id);
    prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(values);

    const user = prepare(
      'SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?'
    ).get([req.user.id]);

    res.json({ message: 'Perfil actualizado', user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.put('/password', verifyToken, requireActive, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Contraseña actual y nueva son obligatorias' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const user = prepare('SELECT * FROM users WHERE id = ?').get([req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    prepare('UPDATE users SET password = ? WHERE id = ?').run([hashedPassword, req.user.id]);

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.put('/:id', verifyToken, requireRole('admin'), (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = prepare('SELECT * FROM users WHERE id = ?').get([req.params.id]);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const fields = [];
    const values = [];

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: 'El nombre no puede estar vacio' });
      fields.push('name = ?');
      values.push(name.trim());
    }
    if (email !== undefined) {
      if (!email.trim()) return res.status(400).json({ message: 'El email no puede estar vacio' });
      const existing = prepare('SELECT id FROM users WHERE email = ? AND id != ?').get([email.toLowerCase(), req.params.id]);
      if (existing) return res.status(400).json({ message: 'Este correo ya esta registrado' });
      fields.push('email = ?');
      values.push(email.toLowerCase());
    }
    if (role !== undefined) {
      if (!['admin', 'user'].includes(role)) return res.status(400).json({ message: 'Rol no valido' });
      fields.push('role = ?');
      values.push(role);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    values.push(req.params.id);
    prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(values);

    const updated = prepare('SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?').get([req.params.id]);
    res.json({ message: 'Usuario actualizado', user: updated });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/:id/deactivate', verifyToken, requireRole('admin'), (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'No puedes desactivarte a ti mismo' });
    }

    const user = prepare('SELECT * FROM users WHERE id = ?').get([req.params.id]);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    prepare('UPDATE users SET active = 0 WHERE id = ?').run([req.params.id]);
    res.json({ message: 'Usuario desactivado correctamente' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.put('/:id/restore', verifyToken, requireRole('admin'), (req, res) => {
  try {
    const user = prepare('SELECT * FROM users WHERE id = ?').get([req.params.id]);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    prepare('UPDATE users SET active = 1 WHERE id = ?').run([req.params.id]);
    res.json({ message: 'Usuario restaurado correctamente' });
  } catch (err) {
    console.error('Restore user error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
