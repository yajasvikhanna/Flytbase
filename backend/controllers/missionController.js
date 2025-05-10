// backend/controllers/missionController.js
const Mission = require('../models/Mission');
const Drone = require('../models/Drone');
const Report = require('../models/Report');

// Get all missions
exports.getAllMissions = async (req, res) => {
  try {
    const missions = await Mission.find()
      .populate('drone', 'name serialNumber status batteryLevel')
      .populate('createdBy', 'name email');
    
    res.status(200).json({
      status: 'success',
      results: missions.length,
      data: {
        missions
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get active missions
exports.getActiveMissions = async (req, res) => {
  try {
    const missions = await Mission.find({ 
      status: { $in: ['scheduled', 'in-progress'] } 
    })
      .populate('drone', 'name serialNumber status batteryLevel')
      .populate('createdBy', 'name email');
    
    res.status(200).json({
      status: 'success',
      results: missions.length,
      data: {
        missions
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get single mission
exports.getMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id)
      .populate('drone', 'name serialNumber status batteryLevel')
      .populate('createdBy', 'name email');
    
    if (!mission) {
      return res.status(404).json({
        status: 'fail',
        message: 'No mission found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        mission
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Create new mission
exports.createMission = async (req, res) => {
  try {
    // Add user ID from token
    req.body.createdBy = req.user.id;
    
    // Check if drone is available
    const drone = await Drone.findById(req.body.drone);
    
    if (!drone) {
      return res.status(404).json({
        status: 'fail',
        message: 'No drone found with that ID'
      });
    }
    
    if (drone.status !== 'available') {
      return res.status(400).json({
        status: 'fail',
        message: `Drone is currently ${drone.status} and cannot be assigned to a new mission`
      });
    }
    
    // Create the mission
    const newMission = await Mission.create(req.body);
    
    // Update drone status to 'in-mission'
    await Drone.findByIdAndUpdate(req.body.drone, { status: 'in-mission' });
    
    res.status(201).json({
      status: 'success',
      data: {
        mission: newMission
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update mission
exports.updateMission = async (req, res) => {
  try {
    const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!mission) {
      return res.status(404).json({
        status: 'fail',
        message: 'No mission found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        mission
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Delete mission
exports.deleteMission = async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({
        status: 'fail',
        message: 'No mission found with that ID'
      });
    }
    
    // Only allow deletion of scheduled missions
    if (mission.status !== 'scheduled') {
      return res.status(400).json({
        status: 'fail',
        message: `Cannot delete a mission that is ${mission.status}`
      });
    }
    
    await Mission.findByIdAndDelete(req.params.id);
    
    // Free up the drone if the mission is scheduled
    await Drone.findByIdAndUpdate(mission.drone, { status: 'available' });
    
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

// Update mission status
exports.updateMissionStatus = async (req, res) => {
  try {
    const { status, progress, currentPosition, log } = req.body;
    
    if (!status) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide status'
      });
    }
    
    const mission = await Mission.findById(req.params.id);
    
    if (!mission) {
      return res.status(404).json({
        status: 'fail',
        message: 'No mission found with that ID'
      });
    }
    
    // Update fields
    mission.status = status;
    
    if (progress !== undefined) {
      mission.progress = progress;
    }
    
    if (currentPosition) {
      mission.currentPosition = {
        ...currentPosition,
        timestamp: new Date()
      };
    }
    
    // Add log entry if provided
    if (log) {
      mission.logs.push({
        timestamp: new Date(),
        event: log.event,
        details: log.details || {}
      });
    }
    
    // Handle mission start and completion
    if (status === 'in-progress' && !mission.actualStart) {
      mission.actualStart = new Date();
    } else if (['completed', 'aborted', 'failed'].includes(status) && !mission.actualEnd) {
      mission.actualEnd = new Date();
      
      // Generate report on mission completion
      const report = await Report.create({
        mission: mission._id,
        drone: mission.drone,
        title: `${mission.name} - ${status.toUpperCase()} Report`,
        status: 'complete',
        flightStats: {
          duration: mission.actualStart ? 
            (new Date() - new Date(mission.actualStart)) / (1000 * 60) : 0, // duration in minutes
          // Other stats to be calculated
        },
        summary: `Mission ${mission.name} ${status} at ${new Date().toISOString()}`,
        missionLogs: mission.logs
      });
      
      // Update drone status back to available
      await Drone.findByIdAndUpdate(mission.drone, { status: 'available' });
    }
    
    await mission.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        mission
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get missions by site
exports.getMissionsBySite = async (req, res) => {
  try {
    const { site } = req.params;
    
    const missions = await Mission.find({ site })
      .populate('drone', 'name serialNumber status batteryLevel')
      .populate('createdBy', 'name email');
    
    res.status(200).json({
      status: 'success',
      results: missions.length,
      data: {
        missions
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};
