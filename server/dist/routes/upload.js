"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../middleware/auth");
const upload_1 = require("../utils/upload");
const router = (0, express_1.Router)();
// POST /api/upload/foto — Upload foto infrastruktur (admin)
// Mengembalikan URL foto yang bisa langsung dipakai di field fotoUrl
router.post('/foto', auth_1.authMiddleware, upload_1.uploadFoto.single('foto'), (req, res) => {
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
});
// DELETE /api/upload/foto/:filename — Hapus foto (admin)
router.delete('/foto/:filename', auth_1.authMiddleware, (req, res) => {
    const { filename } = req.params;
    // Validasi: hanya izinkan nama file yang aman (cegah path traversal)
    if (!filename || filename.includes('/') || filename.includes('..')) {
        res.status(400).json({ error: 'Nama file tidak valid' });
        return;
    }
    const filePath = path_1.default.join(process.cwd(), 'uploads', 'images', filename);
    if (!fs_1.default.existsSync(filePath)) {
        res.status(404).json({ error: 'File tidak ditemukan' });
        return;
    }
    try {
        fs_1.default.unlinkSync(filePath);
        res.json({ message: 'Foto berhasil dihapus' });
    }
    catch {
        res.status(500).json({ error: 'Gagal menghapus foto' });
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map