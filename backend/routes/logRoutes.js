"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const logController_1 = require("../controllers/logController");
const router = express_1.default.Router();
router.use(auth_1.auth, auth_1.adminOnly);
router.get('/', logController_1.getLogs);
router.get('/stats', logController_1.getLogStats);
exports.default = router;
//# sourceMappingURL=logRoutes.js.map