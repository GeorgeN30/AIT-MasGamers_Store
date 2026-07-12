const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: __dirname + '/.env' });

const authRoutes = require('./routes/auth.routes');
const ticketRoutes = require('./routes/tickets.routes');
const userRoutes = require('./routes/users.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const chatRoutes = require('./routes/chat.routes');
const { verifyToken } = require('./middleware/auth');
const { getDb } = require('./db');
const { seed } = require('./seed');
const { isImage, compressImage } = require('./services/imageService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '30d',
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  },
}));

const storage = multer.diskStorage({
  destination: path.join(__dirname, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage });

app.post('/api/upload', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se envio ningun archivo' });
  }

  const originalPath = req.file.path;
  const imageType = req.body.type || 'evidence';

  if (isImage(req.file.originalname)) {
    try {
      const fileBuffer = fs.readFileSync(originalPath);
      const result = await compressImage(fileBuffer, req.file.originalname, imageType);

      const baseName = path.basename(originalPath, path.extname(originalPath));
      const newFilename = `${baseName}${result.newExtension}`;
      const newPath = path.join(path.dirname(originalPath), newFilename);

      fs.writeFileSync(newPath, result.buffer);
      fs.unlinkSync(originalPath);

      console.log(`Image compressed: ${result.originalSize} -> ${result.compressedSize} bytes (${result.compressionRatio})`);

      const url = `/uploads/${newFilename}`;
      return res.json({ url, filename: newFilename, compressed: true });
    } catch (err) {
      console.error('Image compression failed, keeping original:', err.message);
      const url = `/uploads/${req.file.filename}`;
      return res.json({ url, filename: req.file.filename, compressed: false });
    }
  }

  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename, compressed: false });
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);

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
