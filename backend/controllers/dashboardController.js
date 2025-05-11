"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportVaccinationReport = exports.getVaccinationReport = exports.getDashboardStats = void 0;
const Student_1 = require("../models/Student");
const VaccinationDrive_1 = require("../models/VaccinationDrive");
const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await Student_1.Student.countDocuments();
        const vaccinatedStudents = await Student_1.Student.countDocuments({
            'vaccinationStatus.0': { $exists: true }
        });
        const vaccinationPercentage = totalStudents > 0
            ? (vaccinatedStudents / totalStudents) * 100
            : 0;
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const upcomingDrives = await VaccinationDrive_1.VaccinationDrive.find({
            date: {
                $gte: new Date(),
                $lte: thirtyDaysFromNow
            },
            status: 'scheduled'
        }).sort({ date: 1 });
        res.json({
            totalStudents,
            vaccinatedStudents,
            vaccinationPercentage: Math.round(vaccinationPercentage * 100) / 100,
            upcomingDrives
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard statistics', error });
    }
};
exports.getDashboardStats = getDashboardStats;
const getVaccinationReport = async (req, res) => {
    try {
        const { page = 1, limit = 10, vaccineName, grade, class: className, startDate, endDate } = req.query;
        const query = {};
        if (vaccineName) {
            query['vaccinationStatus.vaccineName'] = vaccineName;
        }
        if (grade) {
            query.grade = grade;
        }
        if (className) {
            query.class = className;
        }
        if (startDate && endDate) {
            query['vaccinationStatus.date'] = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const skip = (Number(page) - 1) * Number(limit);
        const students = await Student_1.Student.find(query)
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = await Student_1.Student.countDocuments(query);
        res.json({
            students,
            currentPage: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            totalStudents: total
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error generating vaccination report', error });
    }
};
exports.getVaccinationReport = getVaccinationReport;
const exportVaccinationReport = async (req, res) => {
    try {
        const { format = 'csv' } = req.query;
        const { vaccineName, grade, class: className, startDate, endDate } = req.query;
        const query = {};
        if (vaccineName) {
            query['vaccinationStatus.vaccineName'] = vaccineName;
        }
        if (grade) {
            query.grade = grade;
        }
        if (className) {
            query.class = className;
        }
        if (startDate && endDate) {
            query['vaccinationStatus.date'] = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        const students = await Student_1.Student.find(query);
        if (format === 'csv') {
            const csvData = students.map(student => {
                var _a, _b, _c;
                return ({
                    'Student ID': student.studentId,
                    'Name': `${student.firstName} ${student.lastName}`,
                    'Grade': student.grade,
                    'Class': student.class,
                    'Vaccination Status': student.vaccinationStatus.length > 0 ? 'Vaccinated' : 'Not Vaccinated',
                    'Vaccine Name': ((_a = student.vaccinationStatus[0]) === null || _a === void 0 ? void 0 : _a.vaccineName) || 'N/A',
                    'Vaccination Date': ((_b = student.vaccinationStatus[0]) === null || _b === void 0 ? void 0 : _b.date) || 'N/A',
                    'Dose Number': ((_c = student.vaccinationStatus[0]) === null || _c === void 0 ? void 0 : _c.doseNumber) || 'N/A'
                });
            });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=vaccination-report.csv');
            const csvString = [
                Object.keys(csvData[0]).join(','),
                ...csvData.map(row => Object.values(row).join(','))
            ].join('\n');
            res.send(csvString);
        }
        else {
            res.status(400).json({ message: 'Unsupported export format' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error exporting vaccination report', error });
    }
};
exports.exportVaccinationReport = exportVaccinationReport;
//# sourceMappingURL=dashboardController.js.map