// backend/controllers/reportController.js
const Report = require('../models/Report');
const Mission = require('../models/Mission');

// Get all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('mission', 'name status')
      .populate('drone', 'name serialNumber');
    
    res.status(200).json({
      status: 'success',
      results: reports.length,
      data: {
        reports
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get single report
exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('mission', 'name status flightPath site')
      .populate('drone', 'name serialNumber model');
    
    if (!report) {
      return res.status(404).json({
        status: 'fail',
        message: 'No report found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        report
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Create report (usually system generated, but manual option provided)
exports.createReport = async (req, res) => {
  try {
    // Check if mission exists
    const mission = await Mission.findById(req.body.mission);
    
    if (!mission) {
      return res.status(404).json({
        status: 'fail',
        message: 'No mission found with that ID'
      });
    }
    
    // Set drone from mission if not provided
    if (!req.body.drone) {
      req.body.drone = mission.drone;
    }
    
    const newReport = await Report.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        report: newReport
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update report
exports.updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!report) {
      return res.status(404).json({
        status: 'fail',
        message: 'No report found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        report
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    
    if (!report) {
      return res.status(404).json({
        status: 'fail',
        message: 'No report found with that ID'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get reports by mission
exports.getReportsByMission = async (req, res) => {
  try {
    const { missionId } = req.params;
    
    const reports = await Report.find({ mission: missionId })
      .populate('mission', 'name status')
      .populate('drone', 'name serialNumber');
    
    res.status(200).json({
      status: 'success',
      results: reports.length,
      data: {
        reports
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};