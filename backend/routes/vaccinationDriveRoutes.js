"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const vaccinationDriveController_1 = require("../controllers/vaccinationDriveController");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
const validateDrive = [
    (0, express_validator_1.body)('vaccineName').notEmpty().withMessage('Vaccine name is required'),
    (0, express_validator_1.body)('date').isISO8601().withMessage('Valid date is required'),
    (0, express_validator_1.body)('availableDoses')
        .isInt({ min: 1 })
        .withMessage('Available doses must be at least 1'),
    (0, express_validator_1.body)('applicableGrades')
        .isArray()
        .withMessage('Applicable grades must be an array')
        .notEmpty()
        .withMessage('At least one grade must be specified'),
    (0, express_validator_1.body)('applicableClasses')
        .isArray()
        .withMessage('Applicable classes must be an array')
        .notEmpty()
        .withMessage('At least one class must be specified'),
];
router.use(auth_1.auth, auth_1.adminOnly);
router.post('/', validateDrive, vaccinationDriveController_1.createDrive);
router.get('/', vaccinationDriveController_1.getDrives);
router.get('/stats', vaccinationDriveController_1.getDriveStats);
router.patch('/:id/adjust-slots', vaccinationDriveController_1.adjustSlots); 
router.get('/:id', vaccinationDriveController_1.getDriveById);
router.put('/:id', validateDrive, vaccinationDriveController_1.updateDrive);
router.delete('/:id', vaccinationDriveController_1.deleteDrive);
exports.default = router;
//# sourceMappingURL=vaccinationDriveRoutes.js.map