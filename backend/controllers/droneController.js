// backend/controllers/droneController.js
const Drone = require('../models/Drone');

// Get all drones
exports.getAllDrones = async (req, res) => {
  try {
    const drones = await Drone.find();
    
    res.status(200).json({
      status: 'success',
      results: drones.length,
      data: {
        drones
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get single drone
exports.getDrone = async (req, res) => {
  try {
    const drone = await Drone.findById(req.params.id);
    
    if (!drone) {
      return res.status(404).json({
        status: 'fail',
        message: 'No drone found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        drone
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Create new drone
exports.createDrone = async (req, res) => {
  try {
    const newDrone = await Drone.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        drone: newDrone
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update drone
exports.updateDrone = async (req, res) => {
  try {
    const drone = await Drone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!drone) {
      return res.status(404).json({
        status: 'fail',
        message: 'No drone found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        drone
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Delete drone
exports.deleteDrone = async (req, res) => {
  try {
    const drone = await Drone.findByIdAndDelete(req.params.id);
    
    if (!drone) {
      return res.status(404).json({
        status: 'fail',
        message: 'No drone found with that ID'
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

// Update drone status
exports.updateDroneStatus = async (req, res) => {
  try {
    const { status, batteryLevel } = req.body;
    
    if (!status) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide status'
      });
    }
    
    const updateData = { status };
    if (batteryLevel !== undefined) {
      updateData.batteryLevel = batteryLevel;
    }
    
    const drone = await Drone.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    
    if (!drone) {
      return res.status(404).json({
        status: 'fail',
        message: 'No drone found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        drone
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get drones by site
exports.getDronesBySite = async (req, res) => {
  try {
    const { site } = req.params;
    
    const drones = await Drone.find({ 'location.site': site });
    
    res.status(200).json({
      status: 'success',
      results: drones.length,
      data: {
        drones
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};
