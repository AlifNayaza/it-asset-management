// File: backend/src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { initDatabase, isPostgresConnected } from './db.js';
import { seedDatabase } from './seed.js';

// Route Imports
import assetsRouter from './routes/assets.routes.js';
import assignmentsRouter from './routes/assignments.routes.js';
import maintenanceRouter from './routes/maintenance.routes.js';
import reportsRouter from './routes/reports.routes.js';
import categoriesRouter from './routes/categories.routes.js';
import locationsRouter from './routes/locations.routes.js';
import auditRouter from './routes/audit.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware: Set Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Ensure upload directory exists
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Secure Multer setup: File size limit 5MB & MIME-Type whitelist
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize original name and generate unique safe filename
    const safeExt = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'doc-' + uniqueSuffix + safeExt);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung! Hanya JPG, PNG, WEBP, dan PDF (Maks 5MB).'));
    }
  }
});

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '2mb' })); // Strict JSON payload limit
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Serve uploaded files statically with cache headers
app.use('/uploads', express.static(uploadDir, { maxAge: '1d' }));

// Secure File Upload Endpoint
app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({
      success: true,
      message: 'File berhasil diunggah dengan aman',
      filePath: fileUrl,
      filename: req.file.filename,
      size: req.file.size
    });
  });
});

// Register API Routes
app.use('/api/assets', assetsRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/audit-logs', auditRouter);

// Health check endpoint with security & performance info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'IT Asset & Inventory Management System',
    security: 'hardened',
    postgres_connected: isPostgresConnected,
    timestamp: new Date().toISOString()
  });
});

// Seed trigger endpoint
app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database seeded successfully with 20+ realistic devices!' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 IT Asset Management Backend running at http://localhost:${PORT}`);
    console.log(`🔒 Security headers and input sanitization enabled.`);
  });
}

startServer();
