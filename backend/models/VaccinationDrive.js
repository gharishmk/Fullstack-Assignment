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
exports.VaccinationDrive = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const vaccinationDriveSchema = new mongoose_1.Schema({
    vaccineName: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: Date,
        required: true,
    },
    availableDoses: {
        type: Number,
        required: true,
        min: 1,
    },
    applicableGrades: [{
            type: String,
            required: true,
            trim: true,
        }],
    applicableClasses: [{
            type: String,
            required: true,
            trim: true,
        }],
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled',
    },
    vaccinatedCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
vaccinationDriveSchema.index({ date: 1 });
vaccinationDriveSchema.index({ status: 1 });
vaccinationDriveSchema.index({ vaccineName: 1 });
vaccinationDriveSchema.pre('save', function (next) {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 15);
    if (this.date < minDate) {
        next(new Error('Vaccination drive must be scheduled at least 15 days in advance'));
    }
    next();
});
vaccinationDriveSchema.pre('save', function (next) {
    if (this.vaccinatedCount > this.availableDoses) {
        next(new Error('Vaccinated count cannot exceed available doses'));
    }
    next();
});
exports.VaccinationDrive = mongoose_1.default.model('VaccinationDrive', vaccinationDriveSchema);
//# sourceMappingURL=VaccinationDrive.js.map