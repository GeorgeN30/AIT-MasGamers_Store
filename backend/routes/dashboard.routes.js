const express = require('express');
const { prepare } = require('../db');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/requireRole');
const { generateReport } = require('../services/pdfService');

const router = express.Router();

router.get('/stats', verifyToken, requireRole('admin'), (req, res) => {
  try {
    const totalTickets = prepare('SELECT COUNT(*) as count FROM tickets').get();
    const ticketsPorEstado = prepare(
      'SELECT estado, COUNT(*) as count FROM tickets GROUP BY estado ORDER BY count DESC'
    ).all();
    const totalUsers = prepare('SELECT COUNT(*) as count FROM users').get();
    const ticketsHoy = prepare(
      "SELECT COUNT(*) as count FROM tickets WHERE date(created_at) = date('now')"
    ).get();

    const ticketsPorDia = prepare(
      "SELECT date(created_at) as fecha, COUNT(*) as count FROM tickets WHERE created_at >= date('now', '-7 days') GROUP BY date(created_at) ORDER BY fecha ASC"
    ).all();

    res.json({
      totalTickets: totalTickets.count,
      ticketsPorEstado,
      totalUsers: totalUsers.count,
      ticketsHoy: ticketsHoy.count,
      ticketsPorDia,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get('/report', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const adminName = req.user.name || req.user.email;
    const pdfBuffer = await generateReport(adminName);
    const today = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="masgamers-report-${today}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF report error:', err);
    res.status(500).json({ message: 'Error al generar el reporte' });
  }
});

module.exports = router;
