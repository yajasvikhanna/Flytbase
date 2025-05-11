/**
 * Socket.io configuration for real-time communication
 * Handles drone status updates, mission monitoring, and real-time notifications
 */

const jwt = require('jsonwebtoken');
const Mission = require('./models/Mission');
const Drone = require('./models/Drone');

const configureSocket = (io) => {
  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication token is required'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      return next(new Error('Invalid authentication token'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id} (${socket.user.email})`);
    
    // Join user to their organization room
    if (socket.user.organizationId) {
      socket.join(`org:${socket.user.organizationId}`);
    }
    
    // Handle user subscribing to specific mission updates
    socket.on('subscribe:mission', async (missionId) => {
      try {
        // Verify mission exists and user has access
        const mission = await Mission.findById(missionId);
        if (!mission) {
          socket.emit('error', { message: 'Mission not found' });
          return;
        }
        
        // Check if user has access to this mission
        if (mission.organizationId.toString() !== socket.user.organizationId) {
          socket.emit('error', { message: 'Access denied to this mission' });
          return;
        }
        
        socket.join(`mission:${missionId}`);
        console.log(`User ${socket.user.email} subscribed to mission ${missionId}`);
        
        // Send initial mission status
        socket.emit('mission:status', {
          id: mission._id,
          status: mission.status,
          progress: mission.progress,
          currentWaypoint: mission.currentWaypoint,
          estimatedTimeRemaining: mission.estimatedTimeRemaining
        });
      } catch (error) {
        console.error('Error in subscribe:mission:', error);
        socket.emit('error', { message: 'Failed to subscribe to mission' });
      }
    });
    
    // Handle unsubscribing from mission updates
    socket.on('unsubscribe:mission', (missionId) => {
      socket.leave(`mission:${missionId}`);
      console.log(`User ${socket.user.email} unsubscribed from mission ${missionId}`);
    });
    
    // Handle mission control commands (pause, resume, abort)
    socket.on('mission:command', async ({ missionId, command }) => {
      try {
        // Verify mission exists and user has access
        const mission = await Mission.findById(missionId);
        if (!mission) {
          socket.emit('error', { message: 'Mission not found' });
          return;
        }
        
        // Check if user has access to this mission
        if (mission.organizationId.toString() !== socket.user.organizationId) {
          socket.emit('error', { message: 'Access denied to this mission' });
          return;
        }
        
        let update = {};
        let statusMessage = '';
        
        // Process commands
        switch (command) {
          case 'pause':
            update = { status: 'paused', updatedAt: Date.now() };
            statusMessage = 'Mission paused';
            break;
            
          case 'resume':
            update = { status: 'in-progress', updatedAt: Date.now() };
            statusMessage = 'Mission resumed';  
            break;
            
          case 'abort':
            update = { status: 'aborted', updatedAt: Date.now() };
            statusMessage = 'Mission aborted';
            
            // Update drone status when mission is aborted
            if (mission.droneId) {
              await Drone.findByIdAndUpdate(
                mission.droneId,
                { status: 'available', currentMissionId: null },
                { new: true }
              );
            }
            break;
            
          default:
            socket.emit('error', { message: 'Invalid command' });
            return;
        }
        
        // Update mission
        const updatedMission = await Mission.findByIdAndUpdate(
          missionId,
          update,
          { new: true }
        );
        
        // Broadcast update to all clients subscribed to this mission
        io.to(`mission:${missionId}`).emit('mission:status', {
          id: updatedMission._id,
          status: updatedMission.status,
          progress: updatedMission.progress,
          currentWaypoint: updatedMission.currentWaypoint,
          estimatedTimeRemaining: updatedMission.estimatedTimeRemaining,
          message: statusMessage
        });
        
        console.log(`Mission ${missionId} ${command} by ${socket.user.email}`);
      } catch (error) {
        console.error('Error in mission:command:', error);
        socket.emit('error', { message: 'Failed to execute command' });
      }
    });
    
    // Handle drone status simulation for demo purposes
    socket.on('simulate:drone:update', async ({ droneId, status, batteryLevel, position }) => {
      try {
        // Only allow simulation in development
        if (process.env.NODE_ENV === 'production') {
          socket.emit('error', { message: 'Simulation not allowed in production' });
          return;
        }
        
        // Update drone
        const drone = await Drone.findByIdAndUpdate(
          droneId,
          {
            status: status || 'in-mission',
            batteryLevel: batteryLevel || 80,
            lastKnownPosition: position || { lat: 0, lng: 0, altitude: 100 },
            lastUpdated: Date.now()
          },
          { new: true }
        );
        
        if (!drone) {
          socket.emit('error', { message: 'Drone not found' });
          return;
        }
        
        // Broadcast drone update to organization
        io.to(`org:${drone.organizationId}`).emit('drone:update', {
          id: drone._id,
          status: drone.status,
          batteryLevel: drone.batteryLevel,
          lastKnownPosition: drone.lastKnownPosition,
          lastUpdated: drone.lastUpdated
        });
        
        // If drone is in mission, update mission progress
        if (drone.currentMissionId) {
          const mission = await Mission.findById(drone.currentMissionId);
          if (mission) {
            // Simulate mission progress
            const progress = Math.min(mission.progress + 5, 100);
            let status = mission.status;
            
            // Complete mission if progress reaches 100%
            if (progress === 100 && status === 'in-progress') {
              status = 'completed';
              
              // Update drone status when mission completes
              await Drone.findByIdAndUpdate(
                droneId,
                { status: 'available', currentMissionId: null },
                { new: true }
              );
            }
            
            // Calculate estimated time remaining based on progress
            const estimatedTimeRemaining = status === 'completed' ? 0 : 
              Math.round((100 - progress) / 5) * 30; // 30 seconds per 5% progress
            
            // Update mission
            const updatedMission = await Mission.findByIdAndUpdate(
              drone.currentMissionId,
              { 
                progress, 
                status,
                estimatedTimeRemaining,
                updatedAt: Date.now()
              },
              { new: true }
            );
            
            // Broadcast mission update
            io.to(`mission:${drone.currentMissionId}`).emit('mission:status', {
              id: updatedMission._id,
              status: updatedMission.status,
              progress: updatedMission.progress,
              currentWaypoint: updatedMission.currentWaypoint,
              estimatedTimeRemaining: updatedMission.estimatedTimeRemaining
            });
          }
        }
        
        console.log(`Simulated drone update for ${droneId}`);
      } catch (error) {
        console.error('Error in simulate:drone:update:', error);
        socket.emit('error', { message: 'Failed to simulate drone update' });
      }
    });
    
    // Handle mission progress simulation for demo purposes
    socket.on('simulate:mission:progress', async ({ missionId, increment }) => {
      try {
        // Only allow simulation in development
        if (process.env.NODE_ENV === 'production') {
          socket.emit('error', { message: 'Simulation not allowed in production' });
          return;
        }
        
        const mission = await Mission.findById(missionId);
        if (!mission) {
          socket.emit('error', { message: 'Mission not found' });
          return;
        }
        
        // Simulate mission progress
        const progress = Math.min(mission.progress + (increment || 10), 100);
        let status = mission.status;
        
        // Complete mission if progress reaches 100%
        if (progress === 100 && status === 'in-progress') {
          status = 'completed';
          
          // Update drone status when mission completes
          if (mission.droneId) {
            await Drone.findByIdAndUpdate(
              mission.droneId,
              { status: 'available', currentMissionId: null },
              { new: true }
            );
          }
        }
        
        // Calculate estimated time remaining based on progress
        const estimatedTimeRemaining = status === 'completed' ? 0 : 
          Math.round((100 - progress) / 10) * 60; // 60 seconds per 10% progress
        
        // Update mission
        const updatedMission = await Mission.findByIdAndUpdate(
          missionId,
          { 
            progress, 
            status,
            estimatedTimeRemaining,
            updatedAt: Date.now()
          },
          { new: true }
        );
        
        // Broadcast mission update
        io.to(`mission:${missionId}`).emit('mission:status', {
          id: updatedMission._id,
          status: updatedMission.status,
          progress: updatedMission.progress,
          currentWaypoint: updatedMission.currentWaypoint,
          estimatedTimeRemaining: updatedMission.estimatedTimeRemaining
        });
        
        console.log(`Simulated mission progress for ${missionId}: ${progress}%`);
      } catch (error) {
        console.error('Error in simulate:mission:progress:', error);
        socket.emit('error', { message: 'Failed to simulate mission progress' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id} (${socket.user.email})`);
    });
  });

  return io;
};

module.exports = configureSocket;