const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const ticketRoutes = require('./routes/tickets.routes');
const userRoutes = require('./routes/users.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const { verifyToken } = require('./middleware/auth');
const { getDb } = require('./db');
const { seed } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage });

app.post('/api/upload', verifyToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se envió ningún archivo' });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

async function start() {
  await getDb();
  await seed();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MasGamers API corriendo en http://0.0.0.0:${PORT}`);
  });
}

start();
