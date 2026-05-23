import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

// Lapisan yang diizinkan — cegah path traversal
const ALLOWED_LAYERS = new Set(['kabupaten', 'kecamatan', 'nagari', 'korong']);

const DATA_DIR = path.join(process.cwd(), 'data', 'geojson');

/**
 * GET /api/geojson/:layer
 * Serve file GeoJSON dari server/data/geojson/.
 * Hanya bisa diakses dari origin yang didaftarkan di CORS_ORIGIN.
 * Layer yang tersedia: kabupaten | kecamatan | nagari | korong
 */
router.get('/:layer', (req: Request, res: Response): void => {
  const { layer } = req.params;

  if (!ALLOWED_LAYERS.has(layer)) {
    res.status(404).json({ error: 'Layer tidak ditemukan' });
    return;
  }

  const filePath = path.join(DATA_DIR, `${layer}.geojson`);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: `File GeoJSON '${layer}' belum tersedia di server` });
    return;
  }

  // Cache 1 jam di browser, revalidate dari server
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.sendFile(filePath);
});

export default router;
