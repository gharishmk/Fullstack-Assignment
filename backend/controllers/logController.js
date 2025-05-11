"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogStats = exports.getLogs = void 0;
const ApiLog_1 = require("../models/ApiLog");
const getLogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, method, url, statusCode, startDate, endDate } = req.query;
        const query = {};
        if (method) {
            query.method = method;
        }
        if (url) {
            query.url = { $regex: url, $options: 'i' };
        }
        if (statusCode) {
            query.statusCode = Number(statusCode);
        }
        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const skip = (Number(page) - 1) * Number(limit);
        const logs = await ApiLog_1.ApiLog.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await ApiLog_1.ApiLog.countDocuments(query);
        res.json({
            logs,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalLogs: total
        });
    }
    catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Error fetching logs' });
    }
};
exports.getLogs = getLogs;
const getLogStats = async (req, res) => {
    var _a;
    try {
        const totalRequests = await ApiLog_1.ApiLog.countDocuments();
        const statusCodeStats = await ApiLog_1.ApiLog.aggregate([
            {
                $group: {
                    _id: '$statusCode',
                    count: { $sum: 1 }
                }
            }
        ]);
        const avgResponseTime = await ApiLog_1.ApiLog.aggregate([
            {
                $group: {
                    _id: null,
                    avgDuration: { $avg: '$duration' }
                }
            }
        ]);
        const methodStats = await ApiLog_1.ApiLog.aggregate([
            {
                $group: {
                    _id: '$method',
                    count: { $sum: 1 }
                }
            }
        ]);
        res.json({
            totalRequests,
            statusCodeStats,
            avgResponseTime: ((_a = avgResponseTime[0]) === null || _a === void 0 ? void 0 : _a.avgDuration) || 0,
            methodStats
        });
    }
    catch (error) {
        console.error('Error fetching log stats:', error);
        res.status(500).json({ message: 'Error fetching log statistics' });
    }
};
exports.getLogStats = getLogStats;
//# sourceMappingURL=logController.js.map