// backend/socket.js
const Mission = require('./models/Mission');
const Drone = require('./models/Drone');

const setupSocket = (io) => {
  // Socket.io connection
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Join mission-specific room for real-time updates
    socket.on('joinMission', (missionId) => {
      socket.join(`mission-${missionId}`);
      console.log(`Socket ${socket.id} joined mission-${missionId}`);
    });
    
    // Leave mission-specific room
    socket.on('leaveMission', (missionId) => {
      socket.leave(`mission-${missionId}`);
      console.log(`Socket ${socket.id} left mission-${missionId}`);
    });
    
    // Join site-specific room for real-time updates
    socket.on('joinSite', (site) => {
      socket.join(`site-${site}`);
      console.log(`Socket ${socket.id} joined site-${site}`);
    });
    
    // Leave site-specific room
    socket.on('leaveSite', (site) => {
      socket.leave(`site-${site}`);
      console.log(`Socket ${socket.id} left site-${site}`);
    });
    
    // Update mission status (from drone/simulator)
    socket.on('updateMissionStatus', async (data) => {
      try {
        const { missionId, status, progress, currentPosition, log } = data;
        
        if (!missionId) {
          return socket.emit('error', { message: 'Mission ID is required' });
        }
        
        const mission = await Mission.findById(missionId);
        
        if (!mission) {
          return socket.emit('error', { message: 'Mission not found' });
        }
        
        // Update mission fields
        if (status) mission.status = status;
        if (progress !== undefined) mission.progress = progress;
        
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
          
          // Update drone status back to available
          await Drone.findByIdAndUpdate(mission.drone, { status: 'available' });
        }
        
        await mission.save();
        
        // Broadcast updates to all clients subscribed to this mission
        io.to(`mission-${missionId}`).emit('missionUpdated', {
          mission: {
            _id: mission._id,
            name: mission.name,
            status: mission.status,
            progress: mission.progress,
            currentPosition: mission.currentPosition,
            logs: mission.logs,
          }
        });
        
        // Broadcast to site subscribers
        io.to(`site-${mission.site}`).emit('siteUpdate', {
          type: 'missionUpdate',
          missionId: mission._id,
          status: mission.status,
          progress: mission.progress
        });
        
      } catch (error) {
        console.error('Error updating mission:', error);
        socket.emit('error', { message: error.message });
      }
    });
    
    // Update drone status (from drone/simulator)
    socket.on('updateDroneStatus', async (data) => {
      try {
        const { droneId, status, batteryLevel, location } = data;
        
        if (!droneId) {
          return socket.emit('error', { message: 'Drone ID is required' });
        }
        
        const drone = await Drone.findById(droneId);
        
        if (!drone) {
          return socket.emit('error', { message: 'Drone not found' });
        }
        
        // Update drone fields
        if (status) drone.status = status;
        if (batteryLevel !== undefined) drone.batteryLevel = batteryLevel;
        if (location) drone.location = location;
        
        await drone.save();
        
        // Broadcast updates to all clients subscribed to this site
        io.to(`site-${drone.location.site}`).emit('droneUpdated', {
          drone: {
            _id: drone._id,
            name: drone.name,
            serialNumber: drone.serialNumber,
            status: drone.status,
            batteryLevel: drone.batteryLevel,
            location: drone.location
          }
        });
        
      } catch (error) {
        console.error('Error updating drone:', error);
        socket.emit('error', { message: error.message });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = setupSocket;