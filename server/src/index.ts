import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// Import semua routes
import authRouter from './routes/auth';
import kategoriRouter from './routes/kategori';
import infrastrukturRouter from './routes/infrastruktur';
import statistikRouter from './routes/statistik';
import wilayahRouter from './routes/wilayah';
import uploadRouter from './routes/upload';
import templateRouter from './routes/template';

const app = express();
const PORT = process.env.PORT || 3001;

// Pastikan direktori uploads/images ada saat server start
const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ===== MIDDLEWARE GLOBAL =====
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ===== STATIC FILES — foto yang diupload admin =====
// Akses: http://localhost:3001/uploads/images/<nama-file>
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ===== ROUTES =====
app.use('/api/auth', authRouter);
app.use('/api/kategori', kategoriRouter);
app.use('/api/infrastruktur', infrastrukturRouter);
app.use('/api/statistik', statistikRouter);
app.use('/api/wilayah', wilayahRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/template', templateRouter);

// ===== HEALTH CHECK =====
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== 404 HANDLER =====
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
