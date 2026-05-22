"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Import semua routes
const auth_1 = __importDefault(require("./routes/auth"));
const kategori_1 = __importDefault(require("./routes/kategori"));
const infrastruktur_1 = __importDefault(require("./routes/infrastruktur"));
const statistik_1 = __importDefault(require("./routes/statistik"));
const wilayah_1 = __importDefault(require("./routes/wilayah"));
const upload_1 = __importDefault(require("./routes/upload"));
const template_1 = __importDefault(require("./routes/template"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Pastikan direktori uploads/images ada saat server start
const uploadsDir = path_1.default.join(process.cwd(), 'uploads', 'images');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// ===== MIDDLEWARE GLOBAL =====
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// ===== STATIC FILES — foto yang diupload admin =====
// Akses: http://localhost:3001/uploads/images/<nama-file>
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// ===== ROUTES =====
app.use('/api/auth', auth_1.default);
app.use('/api/kategori', kategori_1.default);
app.use('/api/infrastruktur', infrastruktur_1.default);
app.use('/api/statistik', statistik_1.default);
app.use('/api/wilayah', wilayah_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/template', template_1.default);
// ===== HEALTH CHECK =====
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ===== 404 HANDLER =====
app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});
// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map