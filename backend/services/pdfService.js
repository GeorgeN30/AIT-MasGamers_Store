const PDFDocument = require('pdfkit');
const { prepare } = require('../db');

const COL_WIDTHS = [60, 120, 110, 90, 90];
const HEADERS = ['ID', 'Equipo', 'Cliente', 'Categoria', 'Estado'];
const TABLE_LEFT = 50;
const ROW_HEIGHT = 18;
const HEADER_HEIGHT = 20;

function drawTable(doc, data, tableTop) {
  const totalWidth = COL_WIDTHS.reduce((a, b) => a + b, 0);
  const headerBottom = tableTop + HEADER_HEIGHT;

  doc.lineWidth(0.5).strokeColor('#333333');

  let x = TABLE_LEFT;
  doc.fontSize(9).font('Helvetica-Bold');
  HEADERS.forEach((h, i) => {
    doc.text(h, x + 4, tableTop + 5, { width: COL_WIDTHS[i] - 8 });
    if (i > 0) {
      doc.moveTo(x, tableTop).lineTo(x, tableTop + ROW_HEIGHT * Math.min(data.length, 1) + HEADER_HEIGHT).stroke();
    }
    x += COL_WIDTHS[i];
  });

  doc.moveTo(TABLE_LEFT, headerBottom).lineTo(TABLE_LEFT + totalWidth, headerBottom).stroke();

  doc.font('Helvetica').fontSize(8);
  data.forEach((row, idx) => {
    const y = headerBottom + idx * ROW_HEIGHT;
    if (y + ROW_HEIGHT > 720) {
      doc.addPage();
      return drawTable(doc, data.slice(idx), 50);
    }

    if (idx % 2 === 0) {
      doc.save().rect(TABLE_LEFT, y, totalWidth, ROW_HEIGHT).fill('#F5F5F5').restore();
      doc.fontSize(8).font('Helvetica');
    }

    doc.fillColor('#000000');
    const vals = [
      (row.id || '').substring(0, 8),
      row.equipo || '',
      row.clientName || '',
      row.categoria || '',
      row.estado || '',
    ];
    let cx = TABLE_LEFT;
    vals.forEach((v, i) => {
      doc.text(v, cx + 4, y + 3, { width: COL_WIDTHS[i] - 8, ellipsis: true });
      cx += COL_WIDTHS[i];
    });

    doc.moveTo(TABLE_LEFT, y + ROW_HEIGHT).lineTo(TABLE_LEFT + totalWidth, y + ROW_HEIGHT).stroke();
  });

  const totalWidth2 = COL_WIDTHS.reduce((a, b) => a + b, 0);
  x = TABLE_LEFT;
  doc.moveTo(TABLE_LEFT, tableTop).lineTo(TABLE_LEFT + totalWidth2, tableTop).stroke();

  return tableTop + HEADER_HEIGHT + data.length * ROW_HEIGHT;
}

function drawGridSection(doc, title, data, adminName) {
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text(title);
  doc.moveDown(0.3);

  if (data.length === 0) {
    doc.fontSize(10).font('Helvetica').text(`No hay ${title.toLowerCase()}.`);
    doc.moveDown(1);
    return;
  }

  drawTable(doc, data, doc.y);
  doc.moveDown(1.5);
}

function generateReport(adminName) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const today = new Date().toISOString().split('T')[0];
    const monthStart = today.substring(0, 7) + '-01';

    const resolvedToday = prepare(
      `SELECT t.id, t.equipo, t.categoria, t.estado, t.updated_at, u.name as clientName
       FROM tickets t LEFT JOIN users u ON t.userId = u.id
       WHERE t.estado = 'Cerrado' AND date(t.updated_at) = date('now')
       ORDER BY t.updated_at DESC`
    ).all();

    const pending = prepare(
      `SELECT t.id, t.equipo, t.categoria, t.estado, t.created_at, u.name as clientName
       FROM tickets t LEFT JOIN users u ON t.userId = u.id
       WHERE t.estado != 'Cerrado'
       ORDER BY t.estado ASC, t.created_at DESC`
    ).all();

    const monthlyStats = prepare(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'Cerrado' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN estado != 'Cerrado' THEN 1 ELSE 0 END) as pending
       FROM tickets
       WHERE created_at >= ?`
    ).get([monthStart]);

    const byCategory = prepare(
      `SELECT categoria, COUNT(*) as count
       FROM tickets WHERE created_at >= ?
       GROUP BY categoria ORDER BY count DESC`
    ).all([monthStart]);

    const byStatus = prepare(
      `SELECT estado, COUNT(*) as count
       FROM tickets WHERE created_at >= ?
       GROUP BY estado ORDER BY count DESC`
    ).all([monthStart]);

    doc.fontSize(20).font('Helvetica-Bold').text('MasGamers', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('Reporte de Tickets', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Fecha: ${today}  |  Generado por: ${adminName}`, { align: 'center' });
    doc.moveDown(1);

    drawGridSection(doc, 'Resueltos Hoy', resolvedToday, adminName);

    drawGridSection(doc, 'Tickets Pendientes', pending, adminName);

    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Resumen Mensual');
    doc.moveDown(0.5);

    doc.fontSize(11).font('Helvetica').text(`Periodo: ${monthStart} al ${today}`);
    doc.moveDown(0.3);
    doc.text(`Total de tickets: ${monthlyStats.total}`);
    doc.text(`Resueltos: ${monthlyStats.resolved}`);
    doc.text(`Pendientes: ${monthlyStats.pending}`);
    doc.moveDown(0.8);

    doc.fontSize(12).font('Helvetica-Bold').text('Por Categoria');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    byCategory.forEach((row) => {
      doc.text(`  ${row.categoria}: ${row.count}`);
    });

    doc.moveDown(0.8);
    doc.fontSize(12).font('Helvetica-Bold').text('Por Estado');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    byStatus.forEach((row) => {
      doc.text(`  ${row.estado}: ${row.count}`);
    });

    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica').fillColor('#999999')
      .text('Este reporte fue generado automaticamente por MasGamers.', { align: 'center' });

    doc.end();
  });
}

module.exports = { generateReport };
