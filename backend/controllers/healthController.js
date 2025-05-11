"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const os_1 = __importDefault(require("os"));
const healthCheck = async (req, res) => {
    try {
        const healthData = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            system: {
                memory: {
                    total: os_1.default.totalmem(),
                    free: os_1.default.freemem(),
                    used: os_1.default.totalmem() - os_1.default.freemem(),
                    usagePercentage: ((os_1.default.totalmem() - os_1.default.freemem()) / os_1.default.totalmem() * 100).toFixed(2)
                },
                cpu: {
                    cores: os_1.default.cpus().length,
                    loadAverage: os_1.default.loadavg()
                },
                platform: os_1.default.platform(),
                hostname: os_1.default.hostname()
            },
            database: {
                status: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
                host: mongoose_1.default.connection.host,
                name: mongoose_1.default.connection.name
            },
            api: {
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development'
            }
        };
        if (mongoose_1.default.connection.readyState !== 1) {
            healthData.status = 'degraded';
            healthData.database.status = 'disconnected';
        }
        const memoryUsagePercentage = parseFloat(healthData.system.memory.usagePercentage);
        if (memoryUsagePercentage > 90) {
            healthData.status = 'warning';
        }
        res.json(healthData);
    }
    catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
};
exports.healthCheck = healthCheck;
//# sourceMappingURL=healthController.js.map