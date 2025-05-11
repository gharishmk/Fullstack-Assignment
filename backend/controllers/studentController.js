"use strict";
const { Student }            = require("../models/Student");
const { VaccinationDrive }   = require("../models/VaccinationDrive");
const csv                    = require("csv-parser");
const { createReadStream }   = require("fs");
const { unlink }             = require("fs/promises");


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkImportStudents = exports.markVaccinated = exports.deleteStudent = exports.updateStudent = exports.getStudentById = exports.getStudents = exports.createStudent = void 0;
const Student_1 = require("../models/Student");
const VaccinationDrive_1 = require("../models/VaccinationDrive");
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const createStudent = async (req, res) => {
    try {
        const student = new Student_1.Student(req.body);
        await student.save();
        res.status(201).json(student);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createStudent = createStudent;
const getStudents = async (req, res) => {
    try {
        const { search, grade, class: className, vaccinationStatus, vaccineName } = req.query;
        const query = {};
        if (search) {
            const studentById = await Student_1.Student.findOne({ studentId: search });
            if (studentById) {
                return res.json([studentById]);
            }
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } },
                { parentName: { $regex: search, $options: 'i' } },
            ];
        }
        if (grade)
            query.grade = grade;
        if (className)
            query.class = className;
        if (vaccinationStatus === 'vaccinated') {
            query['vaccinationStatus.0'] = { $exists: true };
        }
        else if (vaccinationStatus === 'unvaccinated') {
            query['vaccinationStatus.0'] = { $exists: false };
        }
        if (vaccineName) {
            query['vaccinationStatus.vaccineName'] = vaccineName;
        }
        const students = await Student_1.Student.find(query)
           // .sort({ createdAt: -1 })
            .populate('vaccinationStatus.driveId', 'vaccineName date status');
        res.json(students);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getStudents = getStudents;
const getStudentById = async (req, res) => {
    try {
        const student = await Student_1.Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getStudentById = getStudentById;
const updateStudent = async (req, res) => {
    try {
        const student = await Student_1.Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateStudent = updateStudent;
const deleteStudent = async (req, res) => {
    try {
        const student = await Student_1.Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteStudent = deleteStudent;
const markVaccinated = async (req, res) => {
    try {
        const { studentId, driveId, doseNumber } = req.body;
        const drive = await VaccinationDrive_1.VaccinationDrive.findById(driveId);
        if (!drive) {
            return res.status(404).json({ message: 'Vaccination drive not found' });
        }
        if (drive.status !== 'scheduled') {
            return res.status(400).json({ message: 'Vaccination drive is not active' });
        }
        if (drive.vaccinatedCount >= drive.availableDoses) {
            return res.status(400).json({ message: 'No doses available' });
        }
        const student = await Student_1.Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const alreadyVaccinated = student.vaccinationStatus.some((status) => status.vaccineName === drive.vaccineName);
        if (alreadyVaccinated) {
            return res.status(400).json({ message: 'Student already vaccinated with this vaccine' });
        }
        student.vaccinationStatus.push({
            vaccineName: drive.vaccineName,
            date: new Date(),
            doseNumber,
            driveId: drive._id,
        });
        await student.save();
        drive.vaccinatedCount += 1;
        await drive.save();
        res.json(student);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.markVaccinated = markVaccinated;
const bulkImportStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const results = [];
        const errors = [];
        const requiredFields = [
            'studentId',
            'firstName',
            'lastName',
            'dateOfBirth',
            'grade',
            'class',
            'gender',
            'parentName',
            'contactNumber',
            'address'
        ];
        (0, fs_1.createReadStream)(req.file.path)
            .pipe((0, csv_parser_1.default)())
            .on('data', (data) => {
            const missingFields = requiredFields.filter(field => !data[field]);
            if (missingFields.length > 0) {
                errors.push({
                    data,
                    error: `Missing required fields: ${missingFields.join(', ')}`
                });
                return;
            }
            if (!Date.parse(data.dateOfBirth)) {
                errors.push({
                    data,
                    error: 'Invalid date format for dateOfBirth'
                });
                return;
            }
            if (!['male', 'female', 'other'].includes(data.gender.toLowerCase())) {
                errors.push({
                    data,
                    error: 'Invalid gender value'
                });
                return;
            }
            results.push(data);
        })
            .on('end', async () => {
            let successCount = 0;
            for (const studentData of results) {
                try {
                    const student = new Student_1.Student({
                        ...studentData,
                        dateOfBirth: new Date(studentData.dateOfBirth)
                    });
                    await student.save();
                    successCount++;
                }
                catch (error) {
                    errors.push({
                        data: studentData,
                        error: error.message,
                    });
                }
            }
            if (req.file) {
                try {
                    await (0, promises_1.unlink)(req.file.path);
                }
                catch (error) {
                    console.error('Error deleting uploaded file:', error);
                }
            }
            res.json({
                message: 'Bulk import completed',
                totalProcessed: results.length,
                successCount,
                errorCount: errors.length,
                errors,
            });
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.bulkVaccinate = async (req, res) => {
  const { driveId, studentIds } = req.body;

  if (!driveId || !Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ message: 'driveId and studentIds[] required' });
  }

  try {
    const drive = await VaccinationDrive.findById(driveId);
    if (!drive) return res.status(404).json({ message: 'Drive not found' });

    if (drive.availableDoses < studentIds.length) {
      return res.status(400).json({
        message: `Only ${drive.availableDoses} doses left`
      });
    }

    const vaccinationRecord = {
      vaccineName: drive.vaccineName,
      date:        new Date(),
      doseNumber:  1,
      driveId:     drive._id
    };

    /* add vaccination record to every listed student
       (skip students who already have this vaccine) */
    const result = await Student.updateMany(
      {
        _id: { $in: studentIds },
        'vaccinationStatus.vaccineName': { $ne: drive.vaccineName }
      },
      { $push: { vaccinationStatus: vaccinationRecord } }
    );

    res.json({ modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.bulkImportStudents = bulkImportStudents;
//# sourceMappingURL=studentController.js.map