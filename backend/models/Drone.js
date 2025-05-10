const mongoose = require('mongoose');

const droneSchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'in-mission', 'maintenance', 'offline'],
    default: 'available'
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  location: {
    site: {
      type: String,
      required: [true, 'Site location is required']
    },
    coordinates: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    }
  },
  capabilities: {
    maxFlightTime: Number, // in minutes
    maxAltitude: Number, // in meters
    maxSpeed: Number, // in m/s
    camera: {
      hasCamera: {
        type: Boolean,
        default: true
      },
      resolution: String
    },
    sensors: [String]
  },
  lastMaintenance: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index location for geospatial queries
droneSchema.index({ 'location.coordinates': '2dsphere' });

const Drone = mongoose.model('Drone', droneSchema);
module.exports = Drone;