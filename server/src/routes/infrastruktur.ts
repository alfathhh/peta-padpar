import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { upload } from '../utils/upload';
import { readExcelFile, cleanupFile, createInfrastrukturExcel, ImportError } from '../utils/excel';
import { IDKAB_PADANG_PARIAMAN, MAX_IMPORT_ROWS } from '../constants';

const router = Router();
const prisma = new PrismaClient();

// GET /api/infrastruktur
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { kategori, idkab, idkec, iddesa, idsls, search, page, limit } = req.query;

  try {
    const where: Record<string, unknown> = {};

    if (kategori) {
      const katList = String(kategori).split(',').map(k => k.trim()).filter(Boolean);
      if (katList.length === 1) where.kategori = katList[0];
      else if (katList.length > 1) where.kategori = { in: katList };
    }

    if (idkab)  where.idkab  = String(idkab);
    if (idkec)  where.idkec  = String(idkec);
    if (iddesa) where.iddesa = String(iddesa);
    if (idsls)  where.idsls  = String(idsls);

    if (search) where.nama = { contains: String(search), mode: 'insensitive' };

    const pageNum  = page  ? parseInt(String(page))  : 1;
    const limitNum = limit ? parseInt(String(limit)) : undefined;
    const skip = limitNum ? (pageNum - 1) * limitNum : undefined;

    const [data, total] = await Promise.all([
      prisma.infrastruktur.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limitNum }),
      prisma.infrastruktur.count({ where }),
    ]);

    if (limitNum) {
      res.json({ data, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
    } else {
      res.json({ data, total });
    }
  } catch (error) {
    console.error('Error GET infrastruktur:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// GET /api/infrastruktur/export
router.get('/export', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { idkec, iddesa, kategori } = req.query;

  try {
    const where: Record<string, unknown> = {};
    if (idkec)    where.idkec    = String(idkec);
    if (iddesa)   where.iddesa   = String(iddesa);
    if (kategori) where.kategori = String(kategori);

    const data = await prisma.infrastruktur.findMany({ where, orderBy: { nama: 'asc' } });
    const buffer = await createInfrastrukturExcel(data as Record<string, unknown>[]);
    const tanggal = new Date().toISOString().split('T')[0].replace(/-/g, '');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="infrastruktur_export_${tanggal}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error export infrastruktur:', error);
    res.status(500).json({ error: 'Gagal export data' });
  }
});

// GET /api/infrastruktur/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  try {
    const infra = await prisma.infrastruktur.findUnique({ where: { id } });
    if (!infra) { res.status(404).json({ error: 'Infrastruktur tidak ditemukan' }); return; }
    res.json(infra);
  } catch (error) {
    console.error('Error GET infrastruktur by id:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// POST /api/infrastruktur
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { nama, kategori, alamat, fotoUrl, lat, lng, idkab, idkec, iddesa, idsls } = req.body;

  if (!nama || !kategori || lat === undefined || lng === undefined || !idkab || !idkec || !iddesa) {
    res.status(400).json({ error: 'Field nama, kategori, lat, lng, idkab, idkec, iddesa wajib diisi' });
    return;
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || latNum < -90 || latNum > 90) { res.status(400).json({ error: 'Latitude tidak valid' }); return; }
  if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) { res.status(400).json({ error: 'Longitude tidak valid' }); return; }

  try {
    const infra = await prisma.infrastruktur.create({
      data: { nama, kategori, alamat, fotoUrl, lat: latNum, lng: lngNum, idkab, idkec, iddesa, idsls: idsls || null },
    });
    res.status(201).json(infra);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2003') { res.status(400).json({ error: 'Kategori tidak valid' }); return; }
    console.error('Error POST infrastruktur:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// POST /api/infrastruktur/import
router.post('/import', authMiddleware, upload.single('file'), async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) { res.status(400).json({ error: 'File Excel (.xlsx) wajib diunggah' }); return; }

  const filePath = req.file.path;
  try {
    const rows = await readExcelFile(filePath);
    if (rows.length > MAX_IMPORT_ROWS) {
      res.status(400).json({ error: `Jumlah baris melebihi batas maksimum ${MAX_IMPORT_ROWS} baris` }); return;
    }

    const kategoriValid = await prisma.kategoriInfra.findMany({ select: { value: true } });
    const kategoriSet = new Set(kategoriValid.map(k => k.value));

    let berhasil = 0;
    const errors: ImportError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nomorBaris = i + 2;
      try {
        const nama    = String(row['nama']    ?? '').trim();
        const kategori = String(row['kategori'] ?? '').trim();
        const alamat  = row['alamat']   ? String(row['alamat']).trim()   : null;
        const fotoUrl = row['foto_url'] ? String(row['foto_url']).trim() : null;
        const lat     = parseFloat(String(row['lat'] ?? ''));
        const lng     = parseFloat(String(row['lng'] ?? ''));
        const idkab   = String(row['idkab']  ?? '').trim();
        const idkec   = String(row['idkec']  ?? '').trim();
        const iddesa  = String(row['iddesa'] ?? '').trim();
        const idsls   = row['idsls'] ? String(row['idsls']).trim() : null;

        if (!nama)    { errors.push({ baris: nomorBaris, pesan: 'Kolom nama tidak boleh kosong' }); continue; }
        if (!kategori || !kategoriSet.has(kategori)) { errors.push({ baris: nomorBaris, pesan: `Kategori "${kategori}" tidak valid` }); continue; }
        if (isNaN(lat) || lat < -90 || lat > 90)   { errors.push({ baris: nomorBaris, pesan: 'Latitude tidak valid' }); continue; }
        if (isNaN(lng) || lng < -180 || lng > 180) { errors.push({ baris: nomorBaris, pesan: 'Longitude tidak valid' }); continue; }
        if (idkab !== IDKAB_PADANG_PARIAMAN) { errors.push({ baris: nomorBaris, pesan: `idkab harus "${IDKAB_PADANG_PARIAMAN}"` }); continue; }
        if (idkec.length !== 6 || !idkec.startsWith(IDKAB_PADANG_PARIAMAN)) { errors.push({ baris: nomorBaris, pesan: 'idkec tidak valid (harus 6 digit, dimulai dengan 1306)' }); continue; }
        if (iddesa.length !== 10 || !iddesa.startsWith(idkec)) { errors.push({ baris: nomorBaris, pesan: 'iddesa tidak valid (harus 10 digit)' }); continue; }
        if (idsls && (idsls.length !== 12 || !idsls.startsWith(iddesa))) { errors.push({ baris: nomorBaris, pesan: 'idsls tidak valid (harus 12 digit)' }); continue; }
        if (fotoUrl && !fotoUrl.startsWith('http://') && !fotoUrl.startsWith('https://') && !fotoUrl.startsWith('/uploads/')) {
          errors.push({ baris: nomorBaris, pesan: 'foto_url harus berupa URL valid' }); continue;
        }

        await prisma.infrastruktur.create({ data: { nama, kategori, alamat, fotoUrl, lat, lng, idkab, idkec, iddesa, idsls } });
        berhasil++;
      } catch {
        errors.push({ baris: nomorBaris, pesan: 'Gagal menyimpan baris ini' });
      }
    }

    res.json({ berhasil, gagal: errors.length, errors });
  } catch (error) {
    console.error('Error import infrastruktur:', error);
    res.status(500).json({ error: 'Gagal memproses file Excel' });
  } finally {
    cleanupFile(filePath);
  }
});

// PUT /api/infrastruktur/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  const { nama, kategori, alamat, fotoUrl, lat, lng, idkab, idkec, iddesa, idsls } = req.body;

  if (!nama || !kategori || lat === undefined || lng === undefined || !idkab || !idkec || !iddesa) {
    res.status(400).json({ error: 'Field nama, kategori, lat, lng, idkab, idkec, iddesa wajib diisi' }); return;
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || latNum < -90 || latNum > 90)   { res.status(400).json({ error: 'Latitude tidak valid' }); return; }
  if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) { res.status(400).json({ error: 'Longitude tidak valid' }); return; }

  try {
    const infra = await prisma.infrastruktur.update({
      where: { id },
      data: { nama, kategori, alamat, fotoUrl, lat: latNum, lng: lngNum, idkab, idkec, iddesa, idsls: idsls || null },
    });
    res.json(infra);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') { res.status(404).json({ error: 'Infrastruktur tidak ditemukan' }); return; }
    console.error('Error PUT infrastruktur:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// DELETE /api/infrastruktur/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  try {
    await prisma.infrastruktur.delete({ where: { id } });
    res.json({ message: 'Infrastruktur berhasil dihapus' });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'P2025') { res.status(404).json({ error: 'Infrastruktur tidak ditemukan' }); return; }
    console.error('Error DELETE infrastruktur:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

export default router;
