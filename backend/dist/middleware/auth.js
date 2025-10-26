"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = optionalAuth;
exports.requireAuth = requireAuth;
const jwt_1 = require("../utils/jwt");
function optionalAuth(req, _res, next) {
    var _a;
    const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.auth) || '';
    if (token) {
        const payload = (0, jwt_1.verifyAuthToken)(token);
        if (payload) {
            req.user = { userId: payload.userId, email: payload.email };
        }
    }
    next();
}
function requireAuth(req, res, next) {
    var _a;
    const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.auth) || '';
    const payload = token ? (0, jwt_1.verifyAuthToken)(token) : null;
    if (!payload) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = { userId: payload.userId, email: payload.email };
    next();
}
