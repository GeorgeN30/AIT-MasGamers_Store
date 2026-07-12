const express = require('express');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { prepare } = require('../db');
const { verifyToken, requireActive } = require('../middleware/auth');
const { notifyUser, notifyAdmins } = require('../services/gatewayService');
const { signJwt } = require('../services/cryptoService');

const router = express.Router();

function getAdminIds() {
  const admins = prepare('SELECT id FROM users WHERE role = ? AND active = 1').all(['admin']);
  return admins.map(a => a.id);
}

function createNotification(userId, ticketId, type, title, body) {
  const id = uuidv4();
  prepare(
    'INSERT INTO notifications (id, userId, ticketId, type, title, body) VALUES (?, ?, ?, ?, ?, ?)'
  ).run([id, userId, ticketId || null, type, title, body]);
  return id;
}

router.get('/ws-token', verifyToken, requireActive, async (req, res) => {
  try {
    const ttl = 24 * 3600;
    const token = await signJwt(req.user.id, {}, ttl, 'MasGamers-movil');
    res.json({ token });
  } catch (err) {
    console.error('WS token error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/:ticketId/messages', verifyToken, requireActive, (req, res) => {
  try {
    const ticket = prepare('SELECT * FROM tickets WHERE id = ?').get([req.params.ticketId]);
    if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });
    if (req.user.role !== 'admin' && ticket.userId !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso' });
    }

    const messages = prepare(
      `SELECT m.*, u.name as userName, u.role as userRole
       FROM ticket_messages m
       JOIN users u ON m.userId = u.id
       WHERE m.ticketId = ?
       ORDER BY m.created_at ASC`
    ).all([req.params.ticketId]);

    res.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/:ticketId/messages', verifyToken, requireActive, (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'El mensaje no puede estar vacio' });
    }

    const ticket = prepare('SELECT * FROM tickets WHERE id = ?').get([req.params.ticketId]);
    if (!ticket) return res.status(404).json({ message: 'Ticket no encontrado' });
    if (req.user.role !== 'admin' && ticket.userId !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso' });
    }
    if (ticket.estado === 'Cerrado') {
      return res.status(400).json({ message: 'No se pueden enviar mensajes a un ticket cerrado' });
    }

    const id = uuidv4();
    prepare(
      'INSERT INTO ticket_messages (id, ticketId, userId, message) VALUES (?, ?, ?, ?)'
    ).run([id, req.params.ticketId, req.user.id, message.trim()]);

    const msg = prepare(
      `SELECT m.*, u.name as userName, u.role as userRole
       FROM ticket_messages m JOIN users u ON m.userId = u.id WHERE m.id = ?`
    ).get([id]);

    const senderName = req.user.name || req.user.email;
    const payload = {
      type: 'NEW_MESSAGE',
      data: {
        id,
        ticketId: req.params.ticketId,
        message: message.trim(),
        userId: req.user.id,
        userName: senderName,
        userRole: req.user.role,
        created_at: msg.created_at,
      },
    };

    if (req.user.role === 'admin') {
      notifyUser(ticket.userId, payload);
      createNotification(ticket.userId, req.params.ticketId, 'new_message',
        'Nuevo mensaje', `${senderName}: ${message.trim().substring(0, 80)}`);
    } else {
      const adminIds = getAdminIds();
      notifyAdmins(payload, adminIds);
      for (const aid of adminIds) {
        createNotification(aid, req.params.ticketId, 'new_message',
          'Nuevo mensaje', `${senderName}: ${message.trim().substring(0, 80)}`);
      }
    }

    res.status(201).json({ message: msg });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/notifications', verifyToken, requireActive, (req, res) => {
  try {
    const notifs = prepare(
      'SELECT * FROM notifications WHERE userId = ? ORDER BY created_at DESC LIMIT 50'
    ).all([req.user.id]);
    const unread = prepare(
      'SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND read = 0'
    ).get([req.user.id]);
    res.json({ notifications: notifs, unreadCount: unread.count });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.put('/notifications/:id/read', verifyToken, requireActive, (req, res) => {
  try {
    prepare('UPDATE notifications SET read = 1 WHERE id = ? AND userId = ?')
      .run([req.params.id, req.user.id]);
    res.json({ message: 'OK' });
  } catch (err) {
    console.error('Mark notification read error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.put('/notifications/read-all', verifyToken, requireActive, (req, res) => {
  try {
    prepare('UPDATE notifications SET read = 1 WHERE userId = ? AND read = 0')
      .run([req.user.id]);
    res.json({ message: 'OK' });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.delete('/notifications/all', verifyToken, requireActive, (req, res) => {
  try {
    prepare('DELETE FROM notifications WHERE userId = ?')
      .run([req.user.id]);
    res.json({ message: 'OK' });
  } catch (err) {
    console.error('Delete all notifications error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.delete('/notifications/:id', verifyToken, requireActive, (req, res) => {
  try {
    prepare('DELETE FROM notifications WHERE id = ? AND userId = ?')
      .run([req.params.id, req.user.id]);
    res.json({ message: 'OK' });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;