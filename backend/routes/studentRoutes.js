"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const studentController_1 = require("../controllers/studentController");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
const validateStudent = [
    (0, express_validator_1.body)('studentId').notEmpty().withMessage('Student ID is required'),
    (0, express_validator_1.body)('firstName').notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
    (0, express_validator_1.body)('grade').notEmpty().withMessage('Grade is required'),
    (0, express_validator_1.body)('class').notEmpty().withMessage('Class is required'),
    (0, express_validator_1.body)('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
    (0, express_validator_1.body)('parentName').notEmpty().withMessage('Parent name is required'),
    (0, express_validator_1.body)('contactNumber').notEmpty().withMessage('Contact number is required'),
    (0, express_validator_1.body)('address').notEmpty().withMessage('Address is required'),
];
router.use(auth_1.auth, auth_1.adminOnly);
router.post('/', validateStudent, studentController_1.createStudent);
router.get('/', studentController_1.getStudents);
router.get('/:id', studentController_1.getStudentById);
router.put('/:id', validateStudent, studentController_1.updateStudent);
router.delete('/:id', studentController_1.deleteStudent);
router.post('/vaccinate', studentController_1.markVaccinated);
router.post('/bulk-import', upload.single('file'), studentController_1.bulkImportStudents);
router.patch('/bulk-vaccinate', studentController_1.bulkVaccinate); 
exports.default = router;
//# sourceMappingURL=studentRoutes.js.map