const PDFDocument = require('pdfkit');
const { prepare } = require('../db');

const COL_WIDTHS = [60, 120, 110, 90, 92];
const HEADERS = ['ID', 'Equipo', 'Cliente', 'Categoria', 'Estado'];
const TABLE_LEFT = 50;
const ROW_HEIGHT = 20;
const HEADER_HEIGHT = 22;
const PAGE_BOTTOM_MARGIN = 60;

const COLORS = {
  headerBg: '#2C3E50',
  headerText: '#FFFFFF',
  rowAlt: '#F5F6F8',
  border: '#D0D3D8',
  text: '#1C1C1C',
  accent: '#2C3E50',
  muted: '#6B7280',
};

function pageBottomLimit(doc) {
  return doc.page.height - doc.page.margins.bottom - PAGE_BOTTOM_MARGIN;
}

function drawTableHeader(doc, tableTop) {
  const totalWidth = COL_WIDTHS.reduce((a, b) => a + b, 0);

  doc.save();
  doc.rect(TABLE_LEFT, tableTop, totalWidth, HEADER_HEIGHT).fill(COLORS.headerBg);
  doc.restore();

  let x = TABLE_LEFT;
  doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.headerText);
  HEADERS.forEach((h, i) => {
    doc.text(h, x + 6, tableTop + 6, { width: COL_WIDTHS[i] - 10 });
    x += COL_WIDTHS[i];
  });

  return tableTop + HEADER_HEIGHT;
}

function drawGridLines(doc, top, bottom) {
  const totalWidth = COL_WIDTHS.reduce((a, b) => a + b, 0);
  doc.lineWidth(0.5).strokeColor(COLORS.border);

  let x = TABLE_LEFT;
  doc.moveTo(x, top).lineTo(x, bottom).stroke();
  COL_WIDTHS.forEach((w) => {
    x += w;
    doc.moveTo(x, top).lineTo(x, bottom).stroke();
  });

  doc.moveTo(TABLE_LEFT, top).lineTo(TABLE_LEFT + totalWidth, top).stroke();
  doc.moveTo(TABLE_LEFT, bottom).lineTo(TABLE_LEFT + totalWidth, bottom).stroke();
}

function drawTable(doc, data, tableTop) {
  const totalWidth = COL_WIDTHS.reduce((a, b) => a + b, 0);
  let y = drawTableHeader(doc, tableTop);
  let sectionTop = tableTop;

  for (let idx = 0; idx < data.length; idx++) {
    const row = data[idx];

    if (y + ROW_HEIGHT > pageBottomLimit(doc)) {
      drawGridLines(doc, sectionTop, y);
      doc.addPage();
      sectionTop = doc.page.margins.top;
      y = drawTableHeader(doc, sectionTop);
    }

    if (idx % 2 === 0) {
      doc.save().rect(TABLE_LEFT, y, totalWidth, ROW_HEIGHT).fill(COLORS.rowAlt).restore();
    }

    doc.fontSize(8).font('Helvetica').fillColor(COLORS.text);
    const vals = [
      (row.id || '').toString().substring(0, 8),
      row.equipo || '',
      row.clientName || '',
      row.categoria || '',
      row.estado || '',
    ];

    let cx = TABLE_LEFT;
    vals.forEach((v, i) => {
      doc.text(v, cx + 6, y + 5, { width: COL_WIDTHS[i] - 10, ellipsis: true });
      cx += COL_WIDTHS[i];
    });

    doc.lineWidth(0.5).strokeColor(COLORS.border);
    doc.moveTo(TABLE_LEFT, y + ROW_HEIGHT).lineTo(TABLE_LEFT + totalWidth, y + ROW_HEIGHT).stroke();

    y += ROW_HEIGHT;
  }

  drawGridLines(doc, sectionTop, y);
  doc.y = y;
  return y;
}

function drawGridSection(doc, title, data) {
  if (doc.y + 60 > pageBottomLimit(doc)) {
    doc.addPage();
  }

  doc.fontSize(13).font('Helvetica-Bold').fillColor(COLORS.accent).text(title);
  doc.moveDown(0.2);
  doc
    .moveTo(TABLE_LEFT, doc.y)
    .lineTo(TABLE_LEFT + 60, doc.y)
    .lineWidth(2)
    .strokeColor(COLORS.accent)
    .stroke();
  doc.moveDown(0.5);

  if (data.length === 0) {
    doc.fontSize(9).font('Helvetica-Oblique').fillColor(COLORS.muted).text('No hay ' + title.toLowerCase() + '.');
    doc.moveDown(1.2);
    return;
  }

  drawTable(doc, data, doc.y);
  doc.moveDown(1.4);
}

function drawSummaryCards(doc, stats) {
  const cardWidth = 150;
  const gap = 16;
  const top = doc.y;
  const cards = [
    { label: 'Total del mes', value: stats.total || 0 },
    { label: 'Resueltos', value: stats.resolved || 0 },
    { label: 'Pendientes', value: stats.pending || 0 },
  ];

  cards.forEach((card, i) => {
    const x = TABLE_LEFT + i * (cardWidth + gap);
    doc.save();
    doc.roundedRect(x, top, cardWidth, 60, 4).fillAndStroke('#F5F6F8', COLORS.border);
    doc.restore();
    doc.fontSize(20).font('Helvetica-Bold').fillColor(COLORS.accent).text(String(card.value), x + 12, top + 10);
    doc.fontSize(9).font('Helvetica').fillColor(COLORS.muted).text(card.label, x + 12, top + 38);
  });

  doc.y = top + 60;
  doc.moveDown(1.2);
}

function drawBreakdownTable(doc, title, rows, keyLabel) {
  if (doc.y + 60 > pageBottomLimit(doc)) doc.addPage();

  doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.accent).text(title);
  doc.moveDown(0.4);

  if (!rows.length) {
    doc.fontSize(9).font('Helvetica-Oblique').fillColor(COLORS.muted).text('Sin datos para este periodo.');
    doc.moveDown(1);
    return;
  }

  const colA = 220;
  const colB = 100;
  let y = doc.y;

  doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.text);
  doc.text(keyLabel, TABLE_LEFT + 6, y + 4, { width: colA - 10 });
  doc.text('Cantidad', TABLE_LEFT + colA + 6, y + 4, { width: colB - 10 });
  doc.save().rect(TABLE_LEFT, y, colA + colB, 20).fillOpacity(0).stroke(COLORS.border).restore();
  y += 20;

  doc.font('Helvetica').fontSize(9);
  rows.forEach((r, i) => {
    if (i % 2 === 0) {
      doc.save().rect(TABLE_LEFT, y, colA + colB, 18).fill(COLORS.rowAlt).restore();
    }
    doc.fillColor(COLORS.text);
    doc.text(r.categoria || r.estado || '-', TABLE_LEFT + 6, y + 4, { width: colA - 10 });
    doc.text(String(r.count), TABLE_LEFT + colA + 6, y + 4, { width: colB - 10 });
    doc
      .lineWidth(0.5)
      .strokeColor(COLORS.border)
      .moveTo(TABLE_LEFT, y + 18)
      .lineTo(TABLE_LEFT + colA + colB, y + 18)
      .stroke();
    y += 18;
  });

  doc.y = y;
  doc.moveDown(1.2);
}

function drawFooter(doc) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const bottom = doc.page.height - doc.page.margins.bottom + 15;
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(COLORS.muted)
      .text('Pagina ' + (i + 1) + ' de ' + range.count, TABLE_LEFT, bottom, {
        width: doc.page.width - TABLE_LEFT * 2,
        align: 'center',
      });
  }
}

function generateReport(adminName) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, bufferPages: true });
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

    doc.fontSize(20).font('Helvetica-Bold').fillColor(COLORS.accent).text('MasGamers', { align: 'center' });
    doc.fontSize(13).font('Helvetica').fillColor(COLORS.text).text('Reporte de Tickets', { align: 'center' });
    doc.moveDown(0.4);
    doc
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text('Fecha: ' + today + '   |   Generado por: ' + adminName, { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(13).font('Helvetica-Bold').fillColor(COLORS.accent).text('Resumen del mes');
    doc.moveDown(0.4);
    drawSummaryCards(doc, monthlyStats || {});

    drawBreakdownTable(doc, 'Tickets por categoria', byCategory, 'Categoria');
    drawBreakdownTable(doc, 'Tickets por estado', byStatus, 'Estado');

    if (doc.y + 120 > pageBottomLimit(doc)) {
      doc.addPage();
    }

    drawGridSection(doc, 'Resueltos Hoy', resolvedToday);
    drawGridSection(doc, 'Tickets Pendientes', pending);

    drawFooter(doc);
    doc.end();
  });
}

module.exports = { generateReport };
