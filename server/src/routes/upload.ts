import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { uploadFoto } from '../utils/upload';

const router = Router();

// POST /api/upload/foto — Upload foto infrastruktur (admin)
// Mengembalikan URL foto yang bisa langsung dipakai di field fotoUrl
router.post(
  '/foto',
  authMiddleware,
  uploadFoto.single('foto'),
  (req: AuthRequest, res: Response): void => {
    if (!req.file) {
      res.status(400).json({ error: 'File foto wajib diunggah' });
      return;
    }

    // Bangun URL publik: /uploads/images/<nama-file>
    const fotoUrl = `/uploads/images/${req.file.filename}`;

    res.status(201).json({
      fotoUrl,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      message: 'Foto berhasil diunggah',
    });
  }
);

// DELETE /api/upload/foto/:filename — Hapus foto (admin)
router.delete('/foto/:filename', authMiddleware, (req: AuthRequest, res: Response): void => {
  const { filename } = req.params;

  // Validasi: hanya izinkan nama file yang aman (cegah path traversal)
  if (!filename || filename.includes('/') || filename.includes('..')) {
    res.status(400).json({ error: 'Nama file tidak valid' });
    return;
  }

  const filePath = path.join(process.cwd(), 'uploads', 'images', filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: 'File tidak ditemukan' });
    return;
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ message: 'Foto berhasil dihapus' });
  } catch {
    res.status(500).json({ error: 'Gagal menghapus foto' });
  }
});

export default router;
