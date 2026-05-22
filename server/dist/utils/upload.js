"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFoto = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
// ============================================================
// MULTER UNTUK IMPORT EXCEL (.xlsx) — simpan ke temp OS
// ============================================================
const excelStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, os_1.default.tmpdir());
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'import-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const excelFileFilter = (_req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.originalname.endsWith('.xlsx')) {
        cb(null, true);
    }
    else {
        cb(new Error('Hanya file .xlsx yang diperbolehkan'));
    }
};
exports.upload = (0, multer_1.default)({
    storage: excelStorage,
    fileFilter: excelFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // maksimal 10MB
});
// ============================================================
// MULTER UNTUK UPLOAD FOTO — simpan ke uploads/images/
// ============================================================
// Pastikan direktori uploads/images ada
const UPLOAD_DIR = path_1.default.join(process.cwd(), 'uploads', 'images');
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const fotoStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        // Format: foto-<timestamp>-<random>.<ext>
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, 'foto-' + uniqueSuffix + ext);
    },
});
// Filter: hanya terima gambar jpg, jpeg, png, webp
const fotoFileFilter = (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error('Hanya file gambar (jpg, jpeg, png, webp) yang diperbolehkan'));
    }
};
exports.uploadFoto = (0, multer_1.default)({
    storage: fotoStorage,
    fileFilter: fotoFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // maksimal 5MB per foto
});
//# sourceMappingURL=upload.js.map