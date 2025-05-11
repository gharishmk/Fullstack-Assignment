"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const ADMIN_USER = {
    _id: 'admin123',
    email: 'harish@gmail.com',
    role: 'admin'
};
const auth = async (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            throw new Error();
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        if (decoded._id === ADMIN_USER._id) {
            req.user = ADMIN_USER;
            return next();
        }
        const user = await User_1.User.findOne({ _id: decoded._id });
        if (!user) {
            throw new Error();
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};
exports.auth = auth;
const adminOnly = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.adminOnly = adminOnly;
//# sourceMappingURL=auth.js.map