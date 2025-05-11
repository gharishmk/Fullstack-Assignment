"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const dashboardController_1 = require("../controllers/dashboardController");
const router = express_1.default.Router();
router.use(auth_1.auth, auth_1.adminOnly);
router.get('/stats', dashboardController_1.getDashboardStats);
router.get('/report', dashboardController_1.getVaccinationReport);
router.get('/report/export', dashboardController_1.exportVaccinationReport);
exports.default = router;
//# sourceMappingURL=dashboardRoutes.js.map