"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
exports.configureGoogleStrategy = configureGoogleStrategy;
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const client_1 = require("../generated/prisma/client");
const jwt_1 = require("../utils/jwt");
const auth_1 = require("../middleware/auth");
const historyService_1 = require("../services/historyService");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
exports.authRouter = router;
function configureGoogleStrategy() {
    const clientID = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';
    if (!clientID || !clientSecret)
        return;
    passport_1.default.use(new passport_google_oauth20_1.Strategy({ clientID, clientSecret, callbackURL }, (_accessToken, _refreshToken, profile, done) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        try {
            const email = (_c = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) === null || _c === void 0 ? void 0 : _c.toLowerCase();
            if (!email)
                return done(null, false);
            let user = yield prisma.user.findUnique({ where: { email } });
            if (!user) {
                user = yield prisma.user.create({ data: { email, name: profile.displayName || null, imageUrl: ((_e = (_d = profile.photos) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.value) || null } });
            }
            return done(null, { id: user.id, email: user.email });
        }
        catch (e) {
            return done(e);
        }
    })));
}
router.get('/me', auth_1.optionalAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user)
        return res.json({ user: null });
    const user = yield prisma.user.findUnique({ where: { id: req.user.userId }, select: { id: true, email: true, name: true, imageUrl: true } });
    res.json({ user });
}));
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password required' });
        const emailNorm = String(email).toLowerCase();
        const existing = yield prisma.user.findUnique({ where: { email: emailNorm } });
        if (existing)
            return res.status(409).json({ error: 'Email already in use' });
        const passwordHash = yield bcryptjs_1.default.hash(password, 10);
        const user = yield prisma.user.create({ data: { email: emailNorm, passwordHash, name: name || null } });
        const token = (0, jwt_1.signAuthToken)({ userId: user.id, email: user.email });
        res.cookie('auth', token, (0, jwt_1.getCookieOptions)());
        const clientId = req.headers['x-client-id'] || '';
        if (clientId) {
            try {
                yield (0, historyService_1.attachGuestHistoryToUser)(user.id, clientId);
            }
            catch (_a) { }
        }
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
    }
    catch (e) {
        console.error('Register error', e);
        res.status(500).json({ error: 'Registration failed' });
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const emailNorm = String(email || '').toLowerCase();
        const user = yield prisma.user.findUnique({ where: { email: emailNorm } });
        if (!user || !user.passwordHash)
            return res.status(401).json({ error: 'Invalid credentials' });
        const ok = yield bcryptjs_1.default.compare(password, user.passwordHash);
        if (!ok)
            return res.status(401).json({ error: 'Invalid credentials' });
        const token = (0, jwt_1.signAuthToken)({ userId: user.id, email: user.email });
        res.cookie('auth', token, (0, jwt_1.getCookieOptions)());
        const clientId = req.headers['x-client-id'] || '';
        if (clientId) {
            try {
                yield (0, historyService_1.attachGuestHistoryToUser)(user.id, clientId);
            }
            catch (_a) { }
        }
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
    }
    catch (e) {
        console.error('Login error', e);
        res.status(500).json({ error: 'Login failed' });
    }
}));
router.post('/logout', (_req, res) => {
    res.clearCookie('auth', Object.assign(Object.assign({}, (0, jwt_1.getCookieOptions)()), { maxAge: undefined }));
    res.json({ ok: true });
});
router.get('/google', (req, res, next) => {
    const clientId = req.query.clientId || undefined;
    return (passport_1.default.authenticate('google', { scope: ['profile', 'email'], state: clientId }))(req, res, next);
});
router.get('/google/callback', (req, res, next) => {
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
    return (passport_1.default.authenticate('google', { session: false, failureRedirect: `${frontendUrl}/login` }))(req, res, next);
}, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const token = (0, jwt_1.signAuthToken)({ userId: user.id, email: user.email });
    res.cookie('auth', token, (0, jwt_1.getCookieOptions)());
    const clientId = req.query.state || '';
    if (clientId) {
        try {
            yield (0, historyService_1.attachGuestHistoryToUser)(user.id, clientId);
        }
        catch (_a) { }
    }
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
    res.redirect(frontendUrl);
}));
