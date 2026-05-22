"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET /api/kategori — Ambil semua kategori (publik, untuk filter & marker peta)
router.get('/', async (_req, res) => {
    try {
        const kategori = await prisma.kategoriInfra.findMany({
            orderBy: { urutan: 'asc' },
        });
        res.json(kategori);
    }
    catch (error) {
        console.error('Error GET kategori:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});
// GET /api/kategori/:id — Ambil satu kategori (admin)
router.get('/:id', auth_1.authMiddleware, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const kategori = await prisma.kategoriInfra.findUnique({ where: { id } });
        if (!kategori) {
            res.status(404).json({ error: 'Kategori tidak ditemukan' });
            return;
        }
        res.json(kategori);
    }
    catch (error) {
        console.error('Error GET kategori by id:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});
// POST /api/kategori — Tambah kategori baru (admin)
router.post('/', auth_1.authMiddleware, async (req, res) => {
    const { value, label, icon, color, urutan } = req.body;
    // Validasi field wajib
    if (!value || !label || !icon || !color) {
        res.status(400).json({ error: 'Field value, label, icon, dan color wajib diisi' });
        return;
    }
    // Validasi format value: lowercase, huruf dan underscore saja
    if (!/^[a-z_]+$/.test(value)) {
        res.status(400).json({ error: 'Field value hanya boleh huruf kecil dan underscore' });
        return;
    }
    // Validasi format color: hex (#RRGGBB)
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        res.status(400).json({ error: 'Field color harus berformat hex (#RRGGBB)' });
        return;
    }
    try {
        const kategori = await prisma.kategoriInfra.create({
            data: {
                value,
                label,
                icon,
                color,
                urutan: urutan ?? 0,
            },
        });
        res.status(201).json(kategori);
    }
    catch (error) {
        // Unique constraint violation (value sudah ada)
        if (error.code === 'P2002') {
            res.status(409).json({ error: `Kategori dengan value "${value}" sudah ada` });
            return;
        }
        console.error('Error POST kategori:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});
// PUT /api/kategori/:id — Edit kategori (admin)
router.put('/:id', auth_1.authMiddleware, async (req, res) => {
    const id = parseInt(req.params.id);
    const { value, label, icon, color, urutan } = req.body;
    if (!value || !label || !icon || !color) {
        res.status(400).json({ error: 'Field value, label, icon, dan color wajib diisi' });
        return;
    }
    if (!/^[a-z_]+$/.test(value)) {
        res.status(400).json({ error: 'Field value hanya boleh huruf kecil dan underscore' });
        return;
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        res.status(400).json({ error: 'Field color harus berformat hex (#RRGGBB)' });
        return;
    }
    try {
        const kategori = await prisma.kategoriInfra.update({
            where: { id },
            data: { value, label, icon, color, urutan: urutan ?? 0 },
        });
        res.json(kategori);
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ error: 'Kategori tidak ditemukan' });
            return;
        }
        if (error.code === 'P2002') {
            res.status(409).json({ error: `Kategori dengan value "${value}" sudah ada` });
            return;
        }
        console.error('Error PUT kategori:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});
// DELETE /api/kategori/:id — Hapus kategori (admin, gagal jika masih dipakai)
router.delete('/:id', auth_1.authMiddleware, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        // Cek apakah kategori masih dipakai infrastruktur
        const kategori = await prisma.kategoriInfra.findUnique({ where: { id } });
        if (!kategori) {
            res.status(404).json({ error: 'Kategori tidak ditemukan' });
            return;
        }
        const jumlahInfra = await prisma.infrastruktur.count({
            where: { kategori: kategori.value },
        });
        if (jumlahInfra > 0) {
            res.status(400).json({
                error: `Kategori masih digunakan oleh ${jumlahInfra} infrastruktur. Hapus infrastruktur terlebih dahulu.`,
            });
            return;
        }
        await prisma.kategoriInfra.delete({ where: { id } });
        res.json({ message: 'Kategori berhasil dihapus' });
    }
    catch (error) {
        console.error('Error DELETE kategori:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});
exports.default = router;
//# sourceMappingURL=kategori.js.map