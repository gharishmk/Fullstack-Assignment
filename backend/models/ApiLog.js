"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiLog = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const apiLogSchema = new mongoose_1.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        required: true,
    },
    method: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    headers: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
    },
    body: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    query: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    params: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    statusCode: {
        type: Number,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    responseBody: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    error: {
        type: String,
    },
    ip: {
        type: String,
        required: true,
    },
    userAgent: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
apiLogSchema.index({ timestamp: -1 });
apiLogSchema.index({ method: 1, url: 1 });
apiLogSchema.index({ statusCode: 1 });
exports.ApiLog = mongoose_1.default.model('ApiLog', apiLogSchema);
//# sourceMappingURL=ApiLog.js.map