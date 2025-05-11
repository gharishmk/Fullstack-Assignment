"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const ADMIN_USER = {
    _id: 'admin123',
    email: 'harish@gmail.com',
    password: '$2a$10$36uB2f4B2G5L11ojepOC3e5fM9vbuPF6rajUmK0QSi80S7bPtpnsq',
    role: 'admin'
};
const login = async (req, res) => {
    try {
        console.log('Login attempt:', { email: req.body.email });
        const { email, password } = req.body;
        if (!email || !password) {
            console.log('Login failed: Missing credentials');
            return res.status(400).json({ message: 'Email and password are required' });
        }
        if (email !== ADMIN_USER.email) {
            console.log('Login failed: User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, ADMIN_USER.password);
        if (!isValidPassword) {
            console.log('Login failed: Invalid password');
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ _id: ADMIN_USER._id, email: ADMIN_USER.email, role: ADMIN_USER.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '24h' });
        console.log('Login successful:', { email: ADMIN_USER.email });
        res.json({
            token,
            user: {
                _id: ADMIN_USER._id,
                email: ADMIN_USER.email,
                role: ADMIN_USER.role
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = new User_1.User({
            email,
            password,
            role: 'admin',
        });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '24h' });
        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
//# sourceMappingURL=authController.js.map