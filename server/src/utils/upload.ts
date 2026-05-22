import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';

// ============================================================
// MULTER UNTUK IMPORT EXCEL (.xlsx) — simpan ke temp OS
// ============================================================
const excelStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const excelFileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.originalname.endsWith('.xlsx')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file .xlsx yang diperbolehkan'));
  }
};

export const upload = multer({
  storage: excelStorage,
  fileFilter: excelFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // maksimal 10MB
});

// ============================================================
// MULTER UNTUK UPLOAD FOTO — simpan ke uploads/images/
// ============================================================

// Pastikan direktori uploads/images ada
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'images');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const fotoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Format: foto-<timestamp>-<random>.<ext>
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'foto-' + uniqueSuffix + ext);
  },
});

// Filter: hanya terima gambar jpg, jpeg, png, webp
const fotoFileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedExts  = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (jpg, jpeg, png, webp) yang diperbolehkan'));
  }
};

export const uploadFoto = multer({
  storage: fotoStorage,
  fileFilter: fotoFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // maksimal 5MB per foto
});
