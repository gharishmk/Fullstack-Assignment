"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const ApiLog_1 = require("../models/ApiLog");
const requestLogger = (req, res, next) => {
    const start = Date.now();
    console.log('\n=== API Request ===');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    if (req.query && Object.keys(req.query).length > 0) {
        console.log('Query:', JSON.stringify(req.query, null, 2));
    }
    if (req.params && Object.keys(req.params).length > 0) {
        console.log('Params:', JSON.stringify(req.params, null, 2));
    }
    const originalJson = res.json;
    let responseBody;
    res.json = function (body) {
        responseBody = body;
        return originalJson.call(this, body);
    };
    res.on('finish', async () => {
        const duration = Date.now() - start;
        console.log('\n=== API Response ===');
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
        console.log('========================\n');
        try {
            const logEntry = new ApiLog_1.ApiLog({
                timestamp: new Date(),
                method: req.method,
                url: req.originalUrl,
                headers: req.headers,
                body: req.body,
                query: req.query,
                params: req.params,
                statusCode: res.statusCode,
                duration,
                responseBody,
                ip: req.ip,
                userAgent: req.get('user-agent') || 'unknown',
            });
            await logEntry.save();
        }
        catch (error) {
            console.error('Error saving API log:', error);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=logger.js.map