"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const logger_1 = require("./middleware/logger");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const vaccinationDriveRoutes_1 = __importDefault(require("./routes/vaccinationDriveRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const logRoutes_1 = __importDefault(require("./routes/logRoutes"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const uploadsDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
app.use(logger_1.requestLogger);
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/api/auth', rateLimiter_1.authLimiter);
app.use('/api/students/bulk-import', rateLimiter_1.uploadLimiter);
app.use('/api', rateLimiter_1.apiLimiter);
const swaggerDocument = yamljs_1.default.load('./swagger.yaml');
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
app.use('/api/auth', authRoutes_1.default);
app.use('/api/students', studentRoutes_1.default);
app.use('/api/drives', vaccinationDriveRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/logs', logRoutes_1.default);
app.use('/health', healthRoutes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.use((err, req, res, next) => {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Something went wrong!',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});
const MONGODB_URI = 'mongodb://admin:admin123@localhost:27017/school-vaccination?authSource=admin';
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5500;
    app.listen(PORT, () => {
        console.log(`backend Server is running on port ${PORT}...`);
    });
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map