"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exceljs_1 = __importDefault(require("exceljs"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * GET /api/template/infrastruktur
 * Download template Excel untuk import infrastruktur
 */
router.get('/infrastruktur', auth_1.authMiddleware, async (_req, res) => {
    try {
        const workbook = new exceljs_1.default.Workbook();
        // Sheet 1: Data template
        const dataSheet = workbook.addWorksheet('Data');
        // Header row dengan styling
        const headerRow = dataSheet.addRow([
            'nama',
            'kategori',
            'alamat',
            'foto_url',
            'lat',
            'lng',
            'idkab',
            'idkec',
            'iddesa',
            'idsls',
        ]);
        // Style header
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        // Set column widths
        dataSheet.columns = [
            { width: 25 }, // nama
            { width: 15 }, // kategori
            { width: 30 }, // alamat
            { width: 35 }, // foto_url
            { width: 12 }, // lat
            { width: 12 }, // lng
            { width: 10 }, // idkab
            { width: 10 }, // idkec
            { width: 12 }, // iddesa
            { width: 12 }, // idsls
        ];
        // Add example row
        const exampleRow = dataSheet.addRow([
            'Restoran Padang Asli',
            'restoran',
            'Jl. Merdeka No. 123, Padang',
            'https://example.com/foto.jpg',
            '-0.5397',
            '100.1187',
            '1306',
            '130601',
            '1306010001',
            '130601000101',
        ]);
        exampleRow.font = { color: { argb: 'FF94A3B8' }, italic: true };
        exampleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        // Freeze header row
        dataSheet.views = [{ state: 'frozen', ySplit: 1 }];
        // Sheet 2: Petunjuk
        const guideSheet = workbook.addWorksheet('Petunjuk');
        guideSheet.columns = [{ width: 100 }];
        const titleRow = guideSheet.addRow(['PETUNJUK PENGISIAN TEMPLATE INFRASTRUKTUR']);
        titleRow.font = { bold: true, size: 14, color: { argb: 'FF0284C7' } };
        titleRow.alignment = { wrapText: true, vertical: 'top' };
        guideSheet.addRow([]);
        const instructions = [
            '1. Kolom dengan tanda * (nama, kategori, lat, lng, idkab, idkec, iddesa) WAJIB diisi',
            '2. Kolom alamat, foto_url, idsls OPSIONAL (boleh kosong)',
            '3. Kategori harus sesuai dengan value yang ada di sistem:',
            '   - restoran',
            '   - rumah_ibadah',
            '   - pasar',
            '   - toko',
            '   - kesehatan',
            '   - lainnya',
            '4. Latitude harus antara -4 sampai 2 (Sumatera Barat)',
            '5. Longitude harus antara 99 sampai 105 (Sumatera Barat)',
            '6. idkab selalu 1306 (Kabupaten Padang Pariaman)',
            '7. idkec harus 6 digit, dimulai dengan 1306 (contoh: 130601, 130602, dll)',
            '8. iddesa harus 10 digit, dimulai dengan idkec (contoh: 1306010001, 1306010002, dll)',
            '9. idsls harus 12 digit, dimulai dengan iddesa (contoh: 130601000101, 130601000102, dll)',
            '10. foto_url bisa dikosongkan - foto bisa diupload via admin panel setelah import',
            '11. Maksimal 5.000 baris data per file',
            '12. Jangan ubah nama kolom header di sheet "Data"',
            '13. Gunakan sheet "Data" untuk mengisi data infrastruktur',
        ];
        instructions.forEach((instruction) => {
            const row = guideSheet.addRow([instruction]);
            row.font = { size: 11, color: { argb: 'FF475569' } };
            row.alignment = { wrapText: true, vertical: 'top' };
        });
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="template_infrastruktur.xlsx"');
        // Write workbook to response
        await workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        console.error('Error generating template:', error);
        res.status(500).json({ error: 'Gagal membuat template' });
    }
});
/**
 * GET /api/template/statistik
 * Download template Excel untuk import statistik
 */
router.get('/statistik', auth_1.authMiddleware, async (_req, res) => {
    try {
        const workbook = new exceljs_1.default.Workbook();
        // Sheet 1: Data template
        const dataSheet = workbook.addWorksheet('Data');
        // Header row dengan styling
        const headerRow = dataSheet.addRow([
            'idkab',
            'idkec',
            'iddesa',
            'idsls',
            'indikator',
            'nilai',
            'satuan',
            'tahun',
        ]);
        // Style header
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        // Set column widths
        dataSheet.columns = [
            { width: 10 }, // idkab
            { width: 10 }, // idkec
            { width: 12 }, // iddesa
            { width: 12 }, // idsls
            { width: 30 }, // indikator
            { width: 15 }, // nilai
            { width: 15 }, // satuan
            { width: 10 }, // tahun
        ];
        // Add example row
        const exampleRow = dataSheet.addRow([
            '1306',
            '130601',
            '1306010001',
            '',
            'Jumlah Penduduk',
            '25000',
            'jiwa',
            '2024',
        ]);
        exampleRow.font = { color: { argb: 'FF94A3B8' }, italic: true };
        exampleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        // Freeze header row
        dataSheet.views = [{ state: 'frozen', ySplit: 1 }];
        // Sheet 2: Petunjuk
        const guideSheet = workbook.addWorksheet('Petunjuk');
        guideSheet.columns = [{ width: 100 }];
        const titleRow = guideSheet.addRow(['PETUNJUK PENGISIAN TEMPLATE STATISTIK']);
        titleRow.font = { bold: true, size: 14, color: { argb: 'FF0284C7' } };
        titleRow.alignment = { wrapText: true, vertical: 'top' };
        guideSheet.addRow([]);
        const instructions = [
            '1. Kolom dengan tanda * (idkab, indikator, nilai, tahun) WAJIB diisi',
            '2. Kolom idkec, iddesa, idsls OPSIONAL (boleh kosong untuk data level kabupaten)',
            '3. idkab selalu 1306 (Kabupaten Padang Pariaman)',
            '4. idkec harus 6 digit, dimulai dengan 1306 (untuk data level kecamatan)',
            '   Contoh: 130601, 130602, 130603, dll',
            '5. iddesa harus 10 digit, dimulai dengan idkec (untuk data level nagari)',
            '   Contoh: 1306010001, 1306010002, dll',
            '6. idsls harus 12 digit, dimulai dengan iddesa (untuk data level korong)',
            '   Contoh: 130601000101, 130601000102, dll',
            '7. indikator adalah nama indikator (contoh: Jumlah Penduduk, Luas Wilayah, Tingkat Kemiskinan, dll)',
            '8. nilai harus angka (bisa desimal, contoh: 25000.5)',
            '9. satuan adalah unit pengukuran (contoh: jiwa, km², unit, persen, %, orang, dll)',
            '10. tahun adalah tahun data (contoh: 2024, 2023, 2022, dll)',
            '11. Maksimal 5.000 baris data per file',
            '12. Jangan ubah nama kolom header di sheet "Data"',
            '13. Gunakan sheet "Data" untuk mengisi data statistik',
        ];
        instructions.forEach((instruction) => {
            const row = guideSheet.addRow([instruction]);
            row.font = { size: 11, color: { argb: 'FF475569' } };
            row.alignment = { wrapText: true, vertical: 'top' };
        });
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="template_statistik.xlsx"');
        // Write workbook to response
        await workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        console.error('Error generating template:', error);
        res.status(500).json({ error: 'Gagal membuat template' });
    }
});
exports.default = router;
//# sourceMappingURL=template.js.map