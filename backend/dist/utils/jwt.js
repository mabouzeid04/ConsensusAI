"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAuthToken = signAuthToken;
exports.verifyAuthToken = verifyAuthToken;
exports.getCookieOptions = getCookieOptions;
const jsonwebtoken_1 = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
function signAuthToken(payload, expiresInSeconds = 7 * 24 * 60 * 60) {
    const opts = { expiresIn: expiresInSeconds };
    return (0, jsonwebtoken_1.sign)(payload, JWT_SECRET, opts);
}
function verifyAuthToken(token) {
    try {
        const decoded = (0, jsonwebtoken_1.verify)(token, JWT_SECRET);
        if (typeof decoded === 'string')
            return null;
        return { userId: String(decoded.userId), email: String(decoded.email) };
    }
    catch (_a) {
        return null;
    }
}
function getCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    const domain = process.env.COOKIE_DOMAIN || undefined;
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        domain,
        // 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
    };
}
