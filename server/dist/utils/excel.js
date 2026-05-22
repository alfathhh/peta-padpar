"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readExcelFile = readExcelFile;
exports.cleanupFile = cleanupFile;
exports.createInfrastrukturExcel = createInfrastrukturExcel;
exports.createStatistikExcel = createStatistikExcel;
const exceljs_1 = __importDefault(require("exceljs"));
const fs_1 = __importDefault(require("fs"));
// Baca file Excel dan kembalikan array rows (dimulai dari baris ke-2, baris 1 adalah header)
async function readExcelFile(filePath) {
    const workbook = new exceljs_1.default.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1); // Sheet pertama
    if (!worksheet)
        throw new Error('Sheet tidak ditemukan dalam file Excel');
    const rows = [];
    const headers = [];
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
            // Baris pertama adalah header
            row.eachCell((cell, colNumber) => {
                headers[colNumber] = String(cell.value ?? '').trim().toLowerCase();
            });
        }
        else {
            // Baris data
            const rowData = {};
            row.eachCell((cell, colNumber) => {
                const header = headers[colNumber];
                if (header) {
                    rowData[header] = cell.value;
                }
            });
            // Hanya tambahkan baris yang tidak kosong semua
            if (Object.values(rowData).some(v => v !== null && v !== undefined && v !== '')) {
                rows.push(rowData);
            }
        }
    });
    return rows;
}
// Bersihkan file setelah diproses
function cleanupFile(filePath) {
    try {
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    }
    catch {
        // Abaikan error cleanup
    }
}
// Buat file Excel untuk export infrastruktur
async function createInfrastrukturExcel(data) {
    const workbook = new exceljs_1.default.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    // Header
    worksheet.addRow(['nama', 'kategori', 'alamat', 'foto_url', 'lat', 'lng', 'idkab', 'idkec', 'iddesa', 'idsls']);
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.commit();
    // Data
    for (const item of data) {
        worksheet.addRow([
            item.nama, item.kategori, item.alamat, item.fotoUrl,
            item.lat, item.lng, item.idkab, item.idkec, item.iddesa, item.idsls
        ]);
    }
    // Atur lebar kolom
    worksheet.columns.forEach(col => { col.width = 20; });
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}
// Buat file Excel untuk export statistik
async function createStatistikExcel(data) {
    const workbook = new exceljs_1.default.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    // Header
    worksheet.addRow(['idkab', 'idkec', 'iddesa', 'idsls', 'indikator', 'nilai', 'satuan', 'tahun']);
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.commit();
    // Data
    for (const item of data) {
        worksheet.addRow([
            item.idkab, item.idkec, item.iddesa, item.idsls,
            item.indikator, item.nilai, item.satuan, item.tahun
        ]);
    }
    worksheet.columns.forEach(col => { col.width = 18; });
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}
//# sourceMappingURL=excel.js.map