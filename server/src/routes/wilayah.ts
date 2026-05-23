import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/wilayah/kecamatan?idkab=1306
router.get('/kecamatan', async (req: Request, res: Response): Promise<void> => {
  const { idkab } = req.query;
  if (!idkab) { res.status(400).json({ error: 'Parameter idkab wajib diisi' }); return; }

  try {
    const [fromInfra, fromStat] = await Promise.all([
      prisma.infrastruktur.findMany({
        where: { idkab: String(idkab) },
        select: { idkec: true },
        distinct: ['idkec'],
      }),
      prisma.statistik.findMany({
        where: { idkab: String(idkab), idkec: { not: null } },
        select: { idkec: true },
        distinct: ['idkec'],
      }),
    ]);

    const all = new Set([
      ...fromInfra.map(k => k.idkec),
      ...fromStat.map(k => k.idkec).filter(Boolean),
    ]);

    res.json(
      Array.from(all)
        .sort()
        .map(idkec => ({ kode: idkec, nama: `Kecamatan ${idkec}` }))
    );
  } catch (error) {
    console.error('Error GET kecamatan:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// GET /api/wilayah/nagari?idkec=130601
router.get('/nagari', async (req: Request, res: Response): Promise<void> => {
  const { idkec } = req.query;
  if (!idkec) { res.status(400).json({ error: 'Parameter idkec wajib diisi' }); return; }

  try {
    const [fromInfra, fromStat] = await Promise.all([
      prisma.infrastruktur.findMany({
        where: { idkec: String(idkec) },
        select: { iddesa: true },
        distinct: ['iddesa'],
      }),
      prisma.statistik.findMany({
        where: { idkec: String(idkec), iddesa: { not: null } },
        select: { iddesa: true },
        distinct: ['iddesa'],
      }),
    ]);

    const all = new Set([
      ...fromInfra.map(n => n.iddesa),
      ...fromStat.map(n => n.iddesa).filter(Boolean),
    ]);

    res.json(
      Array.from(all)
        .sort()
        .map(iddesa => ({ kode: iddesa, nama: `Nagari ${iddesa}` }))
    );
  } catch (error) {
    console.error('Error GET nagari:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

// GET /api/wilayah/korong?iddesa=1306010001
router.get('/korong', async (req: Request, res: Response): Promise<void> => {
  const { iddesa } = req.query;
  if (!iddesa) { res.status(400).json({ error: 'Parameter iddesa wajib diisi' }); return; }

  try {
    const rows = await prisma.infrastruktur.findMany({
      where: { iddesa: String(iddesa), idsls: { not: null } },
      select: { idsls: true },
      distinct: ['idsls'],
    });

    res.json(
      rows
        .filter(k => k.idsls !== null)
        .map(k => ({ kode: k.idsls!, nama: `Korong ${k.idsls}` }))
        .sort((a, b) => a.kode.localeCompare(b.kode))
    );
  } catch (error) {
    console.error('Error GET korong:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

export default router;
