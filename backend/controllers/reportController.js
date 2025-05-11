/**
 * Report controller
 * Handles survey reporting and analytics
 */
const Report = require('../models/Report');
const Mission = require('../models/Mission');

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private
exports.getReports = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from matching
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Report.find(JSON.parse(queryStr))
      .populate('droneId', 'name model')
      .populate('createdBy', 'name');

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Report.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const reports = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: reports.length,
      pagination,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('droneId', 'name model')
      .populate('createdBy', 'name');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new report
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Validate mission ID
    if (req.body.missionId) {
      const mission = await Mission.findById(req.body.missionId);
      
      if (!mission) {
        return res.status(404).json({
          success: false,
          message: `No mission found with id of ${req.body.missionId}`
        });
      }

      // Check if report for this mission already exists
      const existingReport = await Report.findOne({ missionId: req.body.missionId });
      if (existingReport) {
        return res.status(400).json({
          success: false,
          message: `A report already exists for mission ${req.body.missionId}`
        });
      }
      
      // Auto-fill mission data if not provided
      if (!req.body.missionName) req.body.missionName = mission.name;
      if (!req.body.droneId) req.body.droneId = mission.drone;
      if (!req.body.startTime) req.body.startTime = mission.startTime;
      if (!req.body.endTime) req.body.endTime = mission.endTime;
      if (!req.body.surveyType) req.body.surveyType = mission.surveyType;
      if (!req.body.waypoints) req.body.waypoints = mission.waypoints;
      if (!req.body.coverageArea) req.body.coverageArea = mission.coverageArea;
      
      // Calculate duration if not provided
      if (!req.body.duration && req.body.startTime && req.body.endTime) {
        req.body.duration = (new Date(req.body.endTime) - new Date(req.body.startTime)) / (1000 * 60);
      }
    }

    const report = await Report.create(req.body);

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private
exports.updateReport = async (req, res, next) => {
  try {
    let report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`
      });
    }

    // Make sure user is report creator or admin
    if (
      report.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this report`
      });
    }

    report = await Report.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: `Report not found with id of ${req.params.id}`
      });
    }

    // Make sure user is report creator or admin
    if (
      report.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this report`
      });
    }

    await report.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports by mission
// @route   GET /api/missions/:missionId/reports
// @access  Private
exports.getMissionReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ missionId: req.params.missionId });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization stats
// @route   GET /api/reports/stats
// @access  Private
exports.getOrganizationStats = async (req, res, next) => {
  try {
    // Get reports for user's organization
    const reports = await Report.find({});
    
    // Overall statistics
    const totalMissions = reports.length;
    let totalDuration = 0;
    let totalDistance = 0;
    let completedMissions = 0;
    let abortedMissions = 0;
    
    // Calculate statistics
    reports.forEach(report => {
      totalDuration += report.duration || 0;
      totalDistance += report.distanceCovered || 0;
      
      if (report.status === 'completed') {
        completedMissions++;
      } else if (report.status === 'aborted') {
        abortedMissions++;
      }
    });
    
    // Group by survey type
    const surveyTypeCounts = {};
    reports.forEach(report => {
      const type = report.surveyType || 'unknown';
      surveyTypeCounts[type] = (surveyTypeCounts[type] || 0) + 1;
    });
    
    // Monthly statistics
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const lastMonthReports = reports.filter(report => {
      const reportDate = new Date(report.createdAt);
      return reportDate >= lastMonth && reportDate < thisMonth;
    });
    
    const thisMonthReports = reports.filter(report => {
      const reportDate = new Date(report.createdAt);
      return reportDate >= thisMonth;
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalMissions,
        completedMissions,
        abortedMissions,
        completionRate: totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0,
        totalDuration,
        totalDistance,
        averageDuration: totalMissions > 0 ? totalDuration / totalMissions : 0,
        averageDistance: totalMissions > 0 ? totalDistance / totalMissions : 0,
        surveyTypeCounts,
        lastMonthCount: lastMonthReports.length,
        thisMonthCount: thisMonthReports.length,
        monthlyGrowth: lastMonthReports.length > 0 
          ? ((thisMonthReports.length - lastMonthReports.length) / lastMonthReports.length) * 100 
          : (thisMonthReports.length > 0 ? 100 : 0)
      }
    });
  } catch (error) {
    next(error);
  }
};