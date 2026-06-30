require('dotenv').config();

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDb, prepare, saveDb } = require('./db');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@masgamers.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_SECURITY_WORD = process.env.ADMIN_SECURITY_WORD || 'masgamers';

async function seed() {
  await getDb();

  const existingAdmin = prepare('SELECT id FROM users WHERE email = ?').get([ADMIN_EMAIL]);
  if (existingAdmin) {
    console.log('La base de datos ya tiene datos. Elimina masgamers.db para resetear.');
    return;
  }

  const adminId = uuidv4();
  const userId = uuidv4();

  const adminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const adminSecurity = await bcrypt.hash(ADMIN_SECURITY_WORD, 10);
  const userPassword = await bcrypt.hash('george123', 10);
  const userSecurity = await bcrypt.hash('dragon', 10);

  prepare(
    'INSERT INTO users (id, name, email, password, securityWord, role, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run([adminId, 'Admin MasGamers', ADMIN_EMAIL, adminPassword, adminSecurity, 'admin', null]);

  prepare(
    'INSERT INTO users (id, name, email, password, securityWord, role, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run([userId, 'George Lopez', 'george@gmail.com', userPassword, userSecurity, 'user',
         'https://i.pinimg.com/736x/a9/78/e4/a978e4c72b435fd4d7abb4840b0e049f.jpg']);

  console.log('Usuarios creados:');
  console.log(`  Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log('  User:  george@gmail.com / george123');

  const tickets = [
    { userId, categoria: 'Soporte Técnico', equipo: 'Teclado Mecánico RGB', descripcion: 'Las teclas WASD no responden después de derrame de líquido', estado: 'En diagnóstico' },
    { userId, categoria: 'Soporte Técnico', equipo: 'GPU RTX 4060', descripcion: 'La tarjeta gráfica alcanza 90°C en reposo y el ventilador hace ruido extraño', estado: 'En reparación' },
    { userId, categoria: 'Ventas', equipo: 'Pedido #4521', descripcion: 'Recibí el monitor con un píxel muerto en la esquina superior derecha', estado: 'Recibido' },
    { userId: adminId, categoria: 'Soporte Técnico', equipo: 'Auriculares HyperX', descripcion: 'El audio se escucha distorsionado en el canal izquierdo', estado: 'Cerrado' },
  ];

  const now = new Date();
  for (let i = 0; i < tickets.length; i++) {
    const t = tickets[i];
    const ticketId = uuidv4();
    const date = new Date(now);
    date.setDate(date.getDate() - (tickets.length - i) * 2);

    prepare(
      'INSERT INTO tickets (id, userId, categoria, equipo, descripcion, estado, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run([ticketId, t.userId, t.categoria, t.equipo, t.descripcion, t.estado, date.toISOString()]);

    prepare(
      'INSERT INTO ticket_logs (id, ticketId, estado_anterior, estado_nuevo, changedBy, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run([uuidv4(), ticketId, null, 'Recibido', t.userId, date.toISOString()]);

    if (t.estado === 'En diagnóstico') {
      const d2 = new Date(date);
      d2.setDate(d2.getDate() + 1);
      prepare(
        'INSERT INTO ticket_logs (id, ticketId, estado_anterior, estado_nuevo, changedBy, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).run([uuidv4(), ticketId, 'Recibido', 'En diagnóstico', adminId, d2.toISOString()]);
    }
    if (t.estado === 'En reparación') {
      const d2 = new Date(date);
      d2.setDate(d2.getDate() + 1);
      prepare(
        'INSERT INTO ticket_logs (id, ticketId, estado_anterior, estado_nuevo, changedBy, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).run([uuidv4(), ticketId, 'Recibido', 'En diagnóstico', adminId, d2.toISOString()]);
      const d3 = new Date(date);
      d3.setDate(d3.getDate() + 2);
      prepare(
        'INSERT INTO ticket_logs (id, ticketId, estado_anterior, estado_nuevo, changedBy, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).run([uuidv4(), ticketId, 'En diagnóstico', 'En reparación', adminId, d3.toISOString()]);
    }
    if (t.estado === 'Cerrado') {
      const estados = ['Recibido', 'En diagnóstico', 'En reparación', 'Reparado', 'Enviado al cliente', 'Cerrado'];
      for (let j = 1; j < estados.length; j++) {
        const d = new Date(date);
        d.setDate(d.getDate() + j);
        prepare(
          'INSERT INTO ticket_logs (id, ticketId, estado_anterior, estado_nuevo, changedBy, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).run([uuidv4(), ticketId, estados[j - 1], estados[j], j < 4 ? adminId : userId, d.toISOString()]);
      }
    }
  }

  console.log(`\n${tickets.length} tickets demo creados con sus historiales.`);
  console.log('\nSeed completado exitosamente');
}

if (require.main === module) {
  seed().catch(console.error);
}

module.exports = { seed };
