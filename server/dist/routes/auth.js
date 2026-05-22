"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// POST /api/auth/login — Login admin, kembalikan JWT
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).json({ error: 'Username dan password wajib diisi' });
        return;
    }
    try {
        const user = await prisma.adminUser.findUnique({ where: { username } });
        if (!user) {
            res.status(401).json({ error: 'Username atau password salah' });
            return;
        }
        const passwordValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!passwordValid) {
            res.status(401).json({ error: 'Username atau password salah' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        res.json({
            token,
            user: { id: user.id, username: user.username },
        });
    }
    catch (error) {
        console.error('Error login:', error);
        res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map