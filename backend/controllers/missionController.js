/**
 * Mission controller
 * Handles mission planning, execution, and monitoring
 */
const Mission = require('../models/Mission');
const Drone = require('../models/Drone');
const Report = require('../models/Report');

// @desc    Get all missions
// @route   GET /api/missions
// @access  Private
exports.getMissions = async (req, res, next) => {
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
    query = Mission.find(JSON.parse(queryStr))
      .populate('drone', 'name model status batteryLevel')
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
    const total = await Mission.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const missions = await query;

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
      count: missions.length,
      pagination,
      data: missions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single mission
// @route   GET /api/missions/:id
// @access  Private
exports.getMission = async (req, res, next) => {
  try {
    const mission = await Mission.findById(req.params.id)
      .populate('drone', 'name model status batteryLevel')
      .populate('createdBy', 'name');

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: `Mission not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: mission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new mission
// @route   POST /api/missions
// @access  Private
exports.createMission = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;
    req.body.organization = req.user.organization;

    // Check if drone exists and is available
    if (req.body.drone) {
      const drone = await Drone.findById(req.body.drone);

      if (!drone) {
        return res.status(404).json({
          success: false,
          message: `No drone found with id of ${req.body.drone}`
        });
      }

      // Check if drone belongs to user's organization
      if (drone.organization.toString() !== req.user.organization && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: `User not authorized to use drone ${req.body.drone}`
        });
      }

      // Check if drone is available
      if (drone.status !== 'available' && req.body.status === 'scheduled') {
        return res.status(400).json({
          success: false,
          message: `Drone ${req.body.drone} is not available for scheduling`
        });
      }
    }

    const mission = await Mission.create(req.body);

    // If mission is scheduled, update drone status
    if (mission.status === 'scheduled' && mission.drone) {
      await Drone.findByIdAndUpdate(mission.drone, { status: 'assigned' });
    }

    // Emit mission created event
    req.io.emit('missionCreated', { mission });

    res.status(201).json({
      success: true,
      data: mission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update mission
// @route   PUT /api/missions/:id
// @access  Private
exports.updateMission = async (req, res, next) => {
  try {
    let mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: `Mission not found with id of ${req.params.id}`
      });
    }

    // Make sure user is mission creator or admin
    if (
      mission.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this mission`
      });
    }

    // Check if drone is being changed
    if (req.body.drone && req.body.drone !== mission.drone.toString()) {
      const newDrone = await Drone.findById(req.body.drone);
      
      if (!newDrone) {
        return res.status(404).json({
          success: false,
          message: `No drone found with id of ${req.body.drone}`
        });
      }

      // Check if new drone belongs to user's organization
      if (newDrone.organization.toString() !== req.user.organization && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: `User not authorized to use drone ${req.body.drone}`
        });
      }

      // Check if new drone is available
      if (newDrone.status !== 'available' && req.body.status === 'scheduled') {
        return res.status(400).json({
          success: false,
          message: `Drone ${req.body.drone} is not available for scheduling`
        });
      }

      // If there was a previous drone, update its status
      if (mission.drone) {
        await Drone.findByIdAndUpdate(mission.drone, { status: 'available' });
      }

      // Update new drone status
      if (req.body.status === 'scheduled') {
        await Drone.findByIdAndUpdate(req.body.drone, { status: 'assigned' });
      }
    }

    // Check for status change
    if (req.body.status && req.body.status !== mission.status) {
      // If starting mission
      if (req.body.status === 'in-progress' && mission.drone) {
        await Drone.findByIdAndUpdate(mission.drone, { status: 'in-mission' });
      }
      
      // If completing or aborting mission
      if (['completed', 'aborted'].includes(req.body.status) && mission.drone) {
        await Drone.findByIdAndUpdate(mission.drone, { status: 'available' });
        
        // If mission completed successfully, generate a report
        if (req.body.status === 'completed') {
          // Calculate mission statistics
          const endTime = req.body.endTime || new Date();
          const duration = (endTime - mission.startTime) / (1000 * 60); // in minutes
          
          // Create a mission report
          await Report.create({
            missionId: mission._id,
            missionName: mission.name,
            droneId: mission.drone,
            startTime: mission.startTime,
            endTime,
            duration,
            surveyType: mission.surveyType,
            coverageArea: mission.coverageArea,
            waypoints: mission.waypoints,
            status: 'completed',
            createdBy: req.user.id
          });
        }
      }
    }

    mission = await Mission.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Emit mission update event
    req.io.emit('missionUpdated', { mission });

    res.status(200).json({
      success: true,
      data: mission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete mission
// @route   DELETE /api/missions/:id
// @access  Private
exports.deleteMission = async (req, res, next) => {
  try {
    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: `Mission not found with id of ${req.params.id}`
      });
    }

    // Make sure user is mission creator or admin
    if (
      mission.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this mission`
      });
    }

    // Can't delete missions in progress
    if (mission.status === 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a mission that is currently in progress'
      });
    }

    // If mission was scheduled, update drone status
    if (mission.status === 'scheduled' && mission.drone) {
      await Drone.findByIdAndUpdate(mission.drone, { status: 'available' });
    }

    await mission.remove();

    // Emit mission deleted event
    req.io.emit('missionDeleted', { missionId: req.params.id });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update mission progress
// @route   PATCH /api/missions/:id/progress
// @access  Private
exports.updateMissionProgress = async (req, res, next) => {
  try {
    const { progress, currentWaypointIndex, currentLocation, altitude } = req.body;

    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: `Mission not found with id of ${req.params.id}`
      });
    }

    // Update mission progress fields
    const updateData = {};
    if (progress !== undefined) updateData.progress = progress;
    if (currentWaypointIndex !== undefined) updateData.currentWaypointIndex = currentWaypointIndex;
    if (currentLocation) updateData.currentLocation = currentLocation;
    if (altitude !== undefined) updateData.currentAltitude = altitude;

    const updatedMission = await Mission.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Emit mission progress update
    req.io.emit('missionProgressUpdate', { 
      missionId: mission._id,
      ...updateData
    });

    // Also update drone location if available
    if (mission.drone && currentLocation) {
      await Drone.findByIdAndUpdate(mission.drone, {
        currentLocation,
        currentAltitude: altitude
      });

      // Emit drone location update
      req.io.emit('droneLocationUpdate', { 
        droneId: mission.drone,
        currentLocation,
        currentAltitude: altitude
      });
    }

    res.status(200).json({
      success: true,
      data: updatedMission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get missions by drone
// @route   GET /api/drones/:droneId/missions
// @access  Private
exports.getDroneMissions = async (req, res, next) => {
  try {
    const missions = await Mission.find({ drone: req.params.droneId })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: missions.length,
      data: missions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start a mission
// @route   POST /api/missions/:id/start
// @access  Private
exports.startMission = async (req, res, next) => {
  try {
    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: `Mission not found with id of ${req.params.id}`
      });
    }

    // Check if mission is in scheduled state
    if (mission.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: `Mission with ID ${req.params.id} is not in scheduled state`
      });
    }

    // Update mission status and start time
    mission.status = 'in-progress';
    mission.startTime = new Date();
    mission.progress = 0;
    mission.currentWaypointIndex = 0;
    await mission.save();

    // Update drone status
    if (mission.drone) {
      await Drone.findByIdAndUpdate(mission.drone, { status: 'in-mission' });
    }

    // Emit mission started event
    req.io.emit('missionStarted', { mission });

    res.status(200).json({
      success: true,
      data: mission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete a mission
// @route   POST /api/missions/:id/complete
// @access  Private
exports.completeMission = async (req, res, next) => {
  try {
    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: `Mission not found with id of ${req.params.id}`
      });
    }

    // Check if mission is in progress
    if (mission.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: `Mission with ID ${req.params.id} is not in progress`
      });
    }

    // Calculate mission statistics
    const endTime = new Date();
    const duration = (endTime - mission.startTime) / (1000 * 60); // in minutes

    // Update mission status and end time
    mission.status = 'completed';
    mission.endTime = endTime;
    mission.progress = 100;
    await mission.save();

    // Update drone status
    if (mission.drone) {
      await Drone.findByIdAndUpdate(mission.drone, { status: 'available' });
    }

    // Create a mission report
    const report = await Report.create({
      missionId: mission._id,
      missionName: mission.name,
      droneId: mission.drone,
      startTime: mission.startTime,
      endTime,
      duration,
      surveyType: mission.surveyType,
      coverageArea: mission.coverageArea,
      waypoints: mission.waypoints,
      status: 'completed',
      createdBy: req.user.id
    });

    // Emit mission completed event
    req.io.emit('missionCompleted', { mission, report });

    res.status(200).json({
      success: true,
      data: { mission, report }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Abort a mission
// @route   POST /api/missions/:id/abort
// @access  Private
exports.abortMission = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: `Mission not found with id of ${req.params.id}`
      });
    }

    // Check if mission can be aborted
    if (!['scheduled', 'in-progress'].includes(mission.status)) {
      return res.status(400).json({
        success: false,
        message: `Mission with ID ${req.params.id} cannot be aborted in its current state`
      });
    }

    // Calculate mission statistics if it was in progress
    let duration = 0;
    let endTime = new Date();
    
    if (mission.status === 'in-progress' && mission.startTime) {
      duration = (endTime - mission.startTime) / (1000 * 60); // in minutes
    }

    // Update mission status and end time
    mission.status = 'aborted';
    mission.endTime = endTime;
    mission.abortReason = reason || 'No reason provided';
    await mission.save();

    // Update drone status
    if (mission.drone) {
      await Drone.findByIdAndUpdate(mission.drone, { status: 'available' });
    }

    // Create a mission report for aborted mission
    if (mission.status === 'in-progress') {
      await Report.create({
        missionId: mission._id,
        missionName: mission.name,
        droneId: mission.drone,
        startTime: mission.startTime,
        endTime,
        duration,
        surveyType: mission.surveyType,
        coverageArea: mission.coverageArea,
        waypoints: mission.waypoints,
        status: 'aborted',
        notes: `Mission aborted. Reason: ${mission.abortReason}`,
        createdBy: req.user.id
      });
    }

    // Emit mission aborted event
    req.io.emit('missionAborted', { mission });

    res.status(200).json({
      success: true,
      data: mission
    });
  } catch (error) {
    next(error);
  }
};