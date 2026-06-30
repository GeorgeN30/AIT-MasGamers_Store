const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { prepare } = require('../db');
const { verifyToken, requireActive } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');

const router = express.Router();

router.get('/', verifyToken, requireActive, (req, res) => {
  try {
    const { estado, categoria, q } = req.query;
    const conditions = [];
    const params = [];

    if (req.user.role !== 'admin') {
      conditions.push('t.userId = ?');
      params.push(req.user.id);
    }

    if (estado) {
      conditions.push('t.estado = ?');
      params.push(estado);
    }

    if (categoria) {
      conditions.push('t.categoria = ?');
      params.push(categoria);
    }

    if (q && q.trim()) {
      conditions.push('(t.equipo LIKE ? OR t.descripcion LIKE ?)');
      const like = `%${q.trim()}%`;
      params.push(like, like);
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const sql = `SELECT t.*, u.name as userName FROM tickets t JOIN users u ON t.userId = u.id ${where} ORDER BY t.created_at DESC`;

    const tickets = prepare(sql).all(params);
    res.json({ tickets });
  } catch (err) {
    console.error('Get tickets error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/recent-activity', verifyToken, requireActive, (req, res) => {
  try {
    let sql;
    let params;
    if (req.user.role === 'admin') {
      sql = `SELECT l.*, u.name as changedByName, t.equipo, t.descripcion
             FROM ticket_logs l
             JOIN users u ON l.changedBy = u.id
             JOIN tickets t ON l.ticketId = t.id
             ORDER BY l.created_at DESC LIMIT 5`;
      params = [];
    } else {
      sql = `SELECT l.*, u.name as changedByName, t.equipo, t.descripcion
             FROM ticket_logs l
             JOIN users u ON l.changedBy = u.id
             JOIN tickets t ON l.ticketId = t.id
             WHERE t.userId = ?
             ORDER BY l.created_at DESC LIMIT 5`;
      params = [req.user.id];
    }
    const logs = prepare(sql).all(params);
    res.json({ logs });
  } catch (err) {
    console.error('Recent activity error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/:id', verifyToken, requireActive, (req, res) => {
  try {
    const ticket = prepare(
      'SELECT t.*, u.name as userName FROM tickets t JOIN users u ON t.userId = u.id WHERE t.id = ?'
    ).get([req.params.id]);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    if (req.user.role !== 'admin' && ticket.userId !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para ver este ticket' });
    }

    res.json({ ticket });
  } catch (err) {
    console.error('Get ticket error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/', verifyToken, requireActive, (req, res) => {
  try {
    const { categoria, equipo, descripcion, imageUri, audioUri, latitude, longitude } = req.body;

    if (!equipo || !descripcion) {
      return res.status(400).json({ message: 'Equipo y descripción son obligatorios' });
    }

    const id = uuidv4();

    prepare(
      `INSERT INTO tickets (id, userId, categoria, equipo, descripcion, imageUri, audioUri, latitude, longitude, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run([id, req.user.id, categoria || 'Soporte Técnico', equipo.trim(), descripcion.trim(),
           imageUri || null, audioUri || null, latitude || null, longitude || null, 'Recibido']);

    prepare(
      'INSERT INTO ticket_logs (id, ticketId, estado_nuevo, changedBy, nota) VALUES (?, ?, ?, ?, ?)'
    ).run([uuidv4(), id, 'Recibido', req.user.id, null]);

    const ticket = prepare('SELECT * FROM tickets WHERE id = ?').get([id]);
    res.status(201).json({ message: 'Ticket creado exitosamente', ticket });
  } catch (err) {
    console.error('Create ticket error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.put('/:id/status', verifyToken, requireActive, requireRole('admin'), (req, res) => {
  try {
    const { estado, nota } = req.body;
    const validEstados = ['Recibido', 'En diagnóstico', 'En reparación', 'Esperando repuestos', 'Reparado', 'Enviado al cliente', 'Cerrado'];

    if (!estado || !validEstados.includes(estado)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }

    const ticket = prepare('SELECT * FROM tickets WHERE id = ?').get([req.params.id]);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    const estadoAnterior = ticket.estado;
    prepare("UPDATE tickets SET estado = ?, updated_at = datetime('now') WHERE id = ?")
      .run([estado, req.params.id]);

    prepare(
      'INSERT INTO ticket_logs (id, ticketId, estado_anterior, estado_nuevo, changedBy, nota) VALUES (?, ?, ?, ?, ?, ?)'
    ).run([uuidv4(), req.params.id, estadoAnterior, estado, req.user.id, nota || null]);

    const updated = prepare('SELECT * FROM tickets WHERE id = ?').get([req.params.id]);
    res.json({ message: 'Estado actualizado', ticket: updated });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/:id/logs', verifyToken, requireActive, (req, res) => {
  try {
    const ticket = prepare('SELECT * FROM tickets WHERE id = ?').get([req.params.id]);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    if (req.user.role !== 'admin' && ticket.userId !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para ver este ticket' });
    }

    const logs = prepare(
      'SELECT l.*, u.name as changedByName FROM ticket_logs l LEFT JOIN users u ON l.changedBy = u.id WHERE l.ticketId = ? ORDER BY l.created_at ASC'
    ).all([req.params.id]);

    res.json({ logs });
  } catch (err) {
    console.error('Get logs error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.put('/:id', verifyToken, requireActive, requireRole('admin'), (req, res) => {
  try {
    const { equipo, descripcion, categoria } = req.body;
    const ticket = prepare('SELECT * FROM tickets WHERE id = ?').get([req.params.id]);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    const fields = [];
    const values = [];

    if (equipo !== undefined) {
      if (!equipo.trim()) return res.status(400).json({ message: 'El equipo no puede estar vacio' });
      fields.push('equipo = ?');
      values.push(equipo.trim());
    }
    if (descripcion !== undefined) {
      if (!descripcion.trim()) return res.status(400).json({ message: 'La descripcion no puede estar vacia' });
      fields.push('descripcion = ?');
      values.push(descripcion.trim());
    }
    if (categoria !== undefined) {
      fields.push('categoria = ?');
      values.push(categoria);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    fields.push("updated_at = datetime('now')");
    values.push(req.params.id);
    prepare(`UPDATE tickets SET ${fields.join(', ')} WHERE id = ?`).run(values);

    const updated = prepare('SELECT * FROM tickets WHERE id = ?').get([req.params.id]);
    res.json({ message: 'Ticket actualizado', ticket: updated });
  } catch (err) {
    console.error('Update ticket error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/:id/delete', verifyToken, requireActive, requireRole('admin'), (req, res) => {
  try {
    const ticket = prepare('SELECT * FROM tickets WHERE id = ?').get([req.params.id]);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    prepare('DELETE FROM ticket_logs WHERE ticketId = ?').run([req.params.id]);
    prepare('DELETE FROM tickets WHERE id = ?').run([req.params.id]);

    res.json({ message: 'Ticket eliminado correctamente' });
  } catch (err) {
    console.error('Delete ticket error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
