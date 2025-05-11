const mongoose = require('mongoose');

const DroneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the drone'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  serialNumber: {
    type: String,
    required: [true, 'Please provide a serial number'],
    unique: true,
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Please provide a drone model']
  },
  manufacturer: {
    type: String,
    required: [true, 'Please provide a drone manufacturer']
  },
  status: {
    type: String,
    enum: ['available', 'in-mission', 'maintenance', 'offline', 'charging'],
    default: 'available'
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  maxFlightTime: {
    type: Number, // in minutes
    required: [true, 'Please provide maximum flight time']
  },
  maxSpeed: {
    type: Number, // in km/h
    required: [true, 'Please provide maximum speed']
  },
  maxAltitude: {
    type: Number, // in meters
    required: [true, 'Please provide maximum altitude']
  },
  maxRange: {
    type: Number, // in kilometers
    required: [true, 'Please provide maximum range']
  },
  sensors: [{
    type: String,
    enum: ['RGB camera', 'thermal camera', 'LiDAR', 'multispectral', 'infrared', 'gas sensor', 'other']
  }],
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Please provide an organization ID']
  },
  currentMissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    default: null
  },
  baseLocationName: {
    type: String,
    required: [true, 'Please provide a base location name']
  },
  baseLocation: {
    type: {
      lat: Number,
      lng: Number
    },
    required: [true, 'Please provide a base location']
  },
  lastKnownPosition: {
    type: {
      lat: Number,
      lng: Number,
      altitude: Number
    },
    default: null
  },
  maintenanceStatus: {
    lastMaintenance: {
      type: Date,
      default: Date.now
    },
    nextMaintenance: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    maintenanceNotes: {
      type: String,
      default: ''
    }
  },
  flightStats: {
    totalFlights: {
      type: Number,
      default: 0
    },
    totalFlightTime: {
      type: Number, // in minutes
      default: 0
    },
    totalDistance: {
      type: Number, // in kilometers
      default: 0
    }
  },
  notes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps when updating a document
DroneSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

module.exports = mongoose.model('Drone', DroneSchema);