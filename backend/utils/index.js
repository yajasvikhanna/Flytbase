/**
 * Utility functions for the Drone Survey Management System
 */

// Helper function to calculate distance between two coordinates in meters
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Convert latitude and longitude from degrees to radians
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000; // Earth's radius in meters
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  };
  
  // Helper function to validate mission waypoints
  exports.validateWaypoints = (waypoints) => {
    if (!waypoints || !Array.isArray(waypoints) || waypoints.length < 2) {
      return { valid: false, message: 'Mission must have at least 2 waypoints' };
    }
    
    // Check that all waypoints have required fields
    for (const waypoint of waypoints) {
      if (
        waypoint.lat === undefined || 
        waypoint.lng === undefined || 
        waypoint.altitude === undefined
      ) {
        return { 
          valid: false, 
          message: 'Each waypoint must have latitude, longitude, and altitude' 
        };
      }
      
      // Validate latitude/longitude ranges
      if (waypoint.lat < -90 || waypoint.lat > 90) {
        return { valid: false, message: 'Latitude must be between -90 and 90 degrees' };
      }
      if (waypoint.lng < -180 || waypoint.lng > 180) {
        return { valid: false, message: 'Longitude must be between -180 and 180 degrees' };
      }
      
      // Validate altitude (assuming drone cannot fly below 0m or above 500m)
      if (waypoint.altitude < 0 || waypoint.altitude > 500) {
        return { valid: false, message: 'Altitude must be between 0 and 500 meters' };
      }
    }
    
    return { valid: true };
  };
  
  // Helper function to calculate mission duration based on waypoints
  exports.calculateMissionDuration = (waypoints, droneSpeed = 10) => {
    if (!waypoints || waypoints.length < 2) return 0;
    
    let totalDistance = 0;
    
    // Calculate total distance
    for (let i = 0; i < waypoints.length - 1; i++) {
      const currentPoint = waypoints[i];
      const nextPoint = waypoints[i + 1];
      
      // Calculate horizontal distance
      const horizontalDistance = this.calculateDistance(
        currentPoint.lat, 
        currentPoint.lng, 
        nextPoint.lat, 
        nextPoint.lng
      );
      
      // Calculate vertical distance (altitude change)
      const verticalDistance = Math.abs(nextPoint.altitude - currentPoint.altitude);
      
      // Calculate total 3D distance using Pythagorean theorem
      const total3DDistance = Math.sqrt(
        Math.pow(horizontalDistance, 2) + Math.pow(verticalDistance, 2)
      );
      
      totalDistance += total3DDistance;
    }
    
    // Calculate time in minutes (distance in meters / speed in m/s / 60 seconds)
    // Adding 10% buffer for turns and wind conditions
    const durationMinutes = (totalDistance / droneSpeed / 60) * 1.1;
    
    // Round up to nearest minute
    return Math.ceil(durationMinutes);
  };
  
  // Helper to format error messages
  exports.formatErrorMessage = (error) => {
    if (error.name === 'ValidationError') {
      // Handle mongoose validation errors
      const messages = Object.values(error.errors).map(err => err.message);
      return messages.join(', ');
    }
    
    if (error.name === 'CastError') {
      return `Resource not found with id of ${error.value}`;
    }
    
    return error.message || 'Server Error';
  };
  
  // Generate a unique mission ID
  exports.generateMissionId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7);
    return `MSN-${timestamp}-${randomStr}`.toUpperCase();
  };
  
  // Calculate battery consumption based on mission parameters
  exports.calculateBatteryConsumption = (distance, duration, payload = 0) => {
    // Base consumption per minute (percentage)
    const baseConsumption = 1.2;
    
    // Additional consumption based on payload (percentage per kg per minute)
    const payloadFactor = 0.05;
    
    // Weather factor (assuming moderate conditions)
    const weatherFactor = 1.1;
    
    // Calculate total consumption
    const totalConsumption = 
      (baseConsumption + (payloadFactor * payload)) * duration * weatherFactor;
    
    // Make sure consumption doesn't exceed 100%
    return Math.min(Math.round(totalConsumption), 100);
  };
  
  // Format date for consistent display
  exports.formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };
  
  // Check if drone is within geofence
  exports.isWithinGeofence = (lat, lng, geofence) => {
    if (!geofence || !geofence.coordinates || geofence.coordinates.length === 0) {
      return true; // No geofence defined, so always within bounds
    }
    
    // Implementation of ray casting algorithm for point-in-polygon
    let inside = false;
    for (let i = 0, j = geofence.coordinates.length - 1; i < geofence.coordinates.length; j = i++) {
      const xi = geofence.coordinates[i][0];
      const yi = geofence.coordinates[i][1];
      const xj = geofence.coordinates[j][0];
      const yj = geofence.coordinates[j][1];
      
      const intersect = ((yi > lng) !== (yj > lng)) &&
          (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    
    return inside;
  };