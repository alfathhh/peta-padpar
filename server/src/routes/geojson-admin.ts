import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const ALLOWED_LAYERS = ['kabupaten', 'kecamatan', 'nagari', 'korong'] as const;
type Layer = typeof ALLOWED_LAYERS[number];

const DATA_DIR = path.join(process.cwd(), 'data', 'geojson');

// Pastikan folder ada
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Multer — simpan ke /tmp dulu, lalu pindah setelah validasi
const upload = multer({
  dest: path.join(process.cwd(), 'tmp'),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter(_req, file, cb) {
    const ok =
      file.mimetype === 'application/json' ||
      file.mimetype === 'application/geo+json' ||
      file.originalname.endsWith('.geojson') ||
      file.originalname.endsWith('.json');
    if (!ok) cb(new Error('Hanya file .geojson atau .json yang diizinkan'));
    else cb(null, true);
  },
});

function isValidLayer(layer: string): layer is Layer {
  return ALLOWED_LAYERS.includes(layer as Layer);
}

function getFileInfo(layer: Layer) {
  const filePath = path.join(DATA_DIR, `${layer}.geojson`);
  if (!fs.existsSync(filePath)) return null;
  const stat = fs.statSync(filePath);
  // Baca sekilas untuk hitung jumlah feature
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    const featureCount: number = parsed?.features?.length ?? 0;
    return {
      layer,
      size: stat.size,
      updatedAt: stat.mtime.toISOString(),
      featureCount,
    };
  } catch {
    return {
      layer,
      size: stat.size,
      updatedAt: stat.mtime.toISOString(),
      featureCount: null,
    };
  }
}

// ── GET /api/geojson-admin/info ─────────────────────────────────────
// Kembalikan info semua layer (ukuran, jumlah feature, last modified)
router.get('/info', authMiddleware, (_req: AuthRequest, res: Response): void => {
  const info = ALLOWED_LAYERS.map(layer => {
    const fileInfo = getFileInfo(layer);
    return fileInfo ?? { layer, size: null, updatedAt: null, featureCount: null };
  });
  res.json(info);
});

// ── GET /api/geojson-admin/info/:layer ──────────────────────────────
router.get('/info/:layer', authMiddleware, (req: AuthRequest, res: Response): void => {
  const { layer } = req.params;
  if (!isValidLayer(layer)) {
    res.status(404).json({ error: 'Layer tidak ditemukan' });
    return;
  }
  const info = getFileInfo(layer);
  if (!info) {
    res.json({ layer, size: null, updatedAt: null, featureCount: null });
    return;
  }
  res.json(info);
});

// ── PUT /api/geojson-admin/:layer ────────────────────────────────────
// Upload & replace file GeoJSON untuk layer tertentu
router.put(
  '/:layer',
  authMiddleware,
  upload.single('file'),
  (req: AuthRequest, res: Response): void => {
    const { layer } = req.params;

    if (!isValidLayer(layer)) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(404).json({ error: 'Layer tidak ditemukan' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'File wajib diunggah' });
      return;
    }

    // Validasi JSON
    let parsed: any;
    try {
      const raw = fs.readFileSync(req.file.path, 'utf8');
      parsed = JSON.parse(raw);
    } catch {
      fs.unlinkSync(req.file.path);
      res.status(400).json({ error: 'File bukan JSON yang valid' });
      return;
    }

    // Validasi minimal: harus FeatureCollection
    if (parsed.type !== 'FeatureCollection' || !Array.isArray(parsed.features)) {
      fs.unlinkSync(req.file.path);
      res.status(400).json({ error: 'File harus berupa GeoJSON FeatureCollection' });
      return;
    }

    const featureCount: number = parsed.features.length;

    // Backup file lama sebelum overwrite
    const destPath = path.join(DATA_DIR, `${layer}.geojson`);
    const backupPath = path.join(DATA_DIR, `${layer}.geojson.bak`);
    if (fs.existsSync(destPath)) {
      fs.copyFileSync(destPath, backupPath);
    }

    // Pindah dari tmp ke data/geojson
    try {
      fs.renameSync(req.file.path, destPath);
    } catch {
      // rename lintas device — fallback ke copy+delete
      fs.copyFileSync(req.file.path, destPath);
      fs.unlinkSync(req.file.path);
    }

    res.json({
      message: `GeoJSON layer '${layer}' berhasil diperbarui`,
      layer,
      featureCount,
      size: fs.statSync(destPath).size,
      updatedAt: new Date().toISOString(),
    });
  }
);

// ── DELETE /api/geojson-admin/:layer ────────────────────────────────
// Hapus file GeoJSON (layer akan kosong / tidak tampil di peta)
router.delete('/:layer', authMiddleware, (req: AuthRequest, res: Response): void => {
  const { layer } = req.params;

  if (!isValidLayer(layer)) {
    res.status(404).json({ error: 'Layer tidak ditemukan' });
    return;
  }

  const filePath = path.join(DATA_DIR, `${layer}.geojson`);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'File tidak ditemukan' });
    return;
  }

  fs.unlinkSync(filePath);
  res.json({ message: `GeoJSON layer '${layer}' berhasil dihapus` });
});

export default router;
