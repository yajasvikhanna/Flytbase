/**
 * Drone controller
 * Handles all drone-related operations including CRUD and status updates
 */
const Drone = require('../models/Drone');
const Mission = require('../models/Mission');

// @desc    Get all drones
// @route   GET /api/drones
// @access  Private
exports.getDrones = async (req, res, next) => {
  try {
    // Allow filtering by status, location, etc.
    const query = { ...req.query };
    
    // Find all drones matching the query
    const drones = await Drone.find(query);

    res.status(200).json({
      success: true,
      count: drones.length,
      data: drones
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single drone
// @route   GET /api/drones/:id
// @access  Private
exports.getDrone = async (req, res, next) => {
  try {
    const drone = await Drone.findById(req.params.id);

    if (!drone) {
      return res.status(404).json({
        success: false,
        message: `Drone not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: drone
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new drone
// @route   POST /api/drones
// @access  Private
exports.createDrone = async (req, res, next) => {
  try {
    // Add organization of the logged-in user
    req.body.organization = req.user.organization;
    
    const drone = await Drone.create(req.body);

    res.status(201).json({
      success: true,
      data: drone
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update drone
// @route   PUT /api/drones/:id
// @access  Private
exports.updateDrone = async (req, res, next) => {
  try {
    let drone = await Drone.findById(req.params.id);

    if (!drone) {
      return res.status(404).json({
        success: false,
        message: `Drone not found with id of ${req.params.id}`
      });
    }

    // Ensure user has permission to update this drone
    if (drone.organization.toString() !== req.user.organization && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this drone`
      });
    }

    drone = await Drone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: drone
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete drone
// @route   DELETE /api/drones/:id
// @access  Private
exports.deleteDrone = async (req, res, next) => {
  try {
    const drone = await Drone.findById(req.params.id);

    if (!drone) {
      return res.status(404).json({
        success: false,
        message: `Drone not found with id of ${req.params.id}`
      });
    }

    // Ensure user has permission to delete this drone
    if (drone.organization.toString() !== req.user.organization && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this drone`
      });
    }

    // Check if drone is currently assigned to any active missions
    const activeMission = await Mission.findOne({
      drone: drone._id,
      status: { $in: ['scheduled', 'in-progress'] }
    });

    if (activeMission) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete drone as it is currently assigned to active mission: ${activeMission._id}`
      });
    }

    await drone.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update drone status (battery, location, etc.)
// @route   PATCH /api/drones/:id/status
// @access  Private
exports.updateDroneStatus = async (req, res, next) => {
  try {
    const { batteryLevel, lat, lng, altitude, status } = req.body;
    
    const updateData = {};
    
    // Only update provided fields
    if (batteryLevel !== undefined) updateData.batteryLevel = batteryLevel;
    if (lat !== undefined && lng !== undefined) {
      updateData.currentLocation = { lat, lng };
    }
    if (altitude !== undefined) updateData.currentAltitude = altitude;
    if (status !== undefined) updateData.status = status;
    
    const drone = await Drone.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!drone) {
      return res.status(404).json({
        success: false,
        message: `Drone not found with id of ${req.params.id}`
      });
    }

    // Emit drone status update via Socket.io
    req.io.emit('droneStatusUpdate', { droneId: drone._id, ...updateData });

    res.status(200).json({
      success: true,
      data: drone
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available drones
// @route   GET /api/drones/available
// @access  Private
exports.getAvailableDrones = async (req, res, next) => {
  try {
    const drones = await Drone.find({ 
      status: 'available',
      organization: req.user.organization
    });

    res.status(200).json({
      success: true,
      count: drones.length,
      data: drones
    });
  } catch (error) {
    next(error);
  }
};