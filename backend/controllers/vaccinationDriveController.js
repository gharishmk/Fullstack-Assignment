"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { VaccinationDrive } = require("../models/VaccinationDrive");

exports.getDriveStats = exports.deleteDrive = exports.updateDrive = exports.getDriveById = exports.getDrives = exports.createDrive = void 0;
const VaccinationDrive_1 = require("../models/VaccinationDrive");
const createDrive = async (req, res) => {
    try {
        const drive = new VaccinationDrive_1.VaccinationDrive(req.body);
        await drive.save();
        res.status(201).json(drive);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createDrive = createDrive;
const getDrives = async (req, res) => {
    try {
        const { status, upcoming } = req.query;
        const query = {};
        if (status) {
            query.status = status;
        }
        if (upcoming === 'true') {
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            query.date = { $gte: new Date(), $lte: thirtyDaysFromNow };
        }
        const drives = await VaccinationDrive_1.VaccinationDrive.find(query).sort({ date: 1 });
        res.json(drives);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getDrives = getDrives;
const getDriveById = async (req, res) => {
    try {
        const drive = await VaccinationDrive_1.VaccinationDrive.findById(req.params.id);
        if (!drive) {
            return res.status(404).json({ message: 'Vaccination drive not found' });
        }
        res.json(drive);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getDriveById = getDriveById;
const updateDrive = async (req, res) => {
    try {
        const drive = await VaccinationDrive_1.VaccinationDrive.findById(req.params.id);
        if (!drive) {
            return res.status(404).json({ message: 'Vaccination drive not found' });
        }
        if (drive.date < new Date()) {
            return res.status(400).json({ message: 'Cannot edit past vaccination drives' });
        }
        if (req.body.availableDoses && req.body.availableDoses < drive.vaccinatedCount) {
            return res.status(400).json({
                message: 'Available doses cannot be less than the number of vaccinated students',
            });
        }
        const updatedDrive = await VaccinationDrive_1.VaccinationDrive.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json(updatedDrive);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateDrive = updateDrive;
const deleteDrive = async (req, res) => {
    try {
        const drive = await VaccinationDrive_1.VaccinationDrive.findById(req.params.id);
        if (!drive) {
            return res.status(404).json({ message: 'Vaccination drive not found' });
        }
        if (drive.vaccinatedCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete drive with vaccinated students',
            });
        }
        await drive.deleteOne();
        res.json({ message: 'Vaccination drive deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteDrive = deleteDrive;
const getDriveStats = async (req, res) => {
    try {
        const stats = await VaccinationDrive_1.VaccinationDrive.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalDoses: { $sum: '$availableDoses' },
                    totalVaccinated: { $sum: '$vaccinatedCount' },
                },
            },
        ]);
        const upcomingDrives = await VaccinationDrive_1.VaccinationDrive.countDocuments({
            date: { $gte: new Date() },
            status: 'scheduled',
        });
        res.json({
            stats,
            upcomingDrives,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.adjustSlots = async (req, res) => {
  const { id }   = req.params;
  const { used } = req.body;        // number of doses consumed

  if (typeof used !== 'number' || used <= 0) {
    return res.status(400).json({ message: 'used must be > 0' });
  }

  try {
    const drive = await VaccinationDrive.findById(id);
    if (!drive) return res.status(404).json({ message: 'Drive not found' });

    if (drive.availableDoses < used) {
      return res.status(400).json({
        message: `Only ${drive.availableDoses} doses left`
      });
    }

    drive.availableDoses  -= used;
    drive.vaccinatedCount = (drive.vaccinatedCount || 0) + used;
    await drive.save();

    res.json(drive);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getDriveStats = getDriveStats;
//# sourceMappingURL=vaccinationDriveController.js.map