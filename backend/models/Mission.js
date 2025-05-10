const mongoose = require('mongoose');

const waypointSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true
  },
  altitude: {
    type: Number,
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  },
  action: {
    type: String,
    enum: ['takePhoto', 'recordVideo', 'hover', 'landingPoint', 'takeoffPoint'],
    default: 'hover'
  },
  duration: Number // in seconds (for hover)
});

const flightPathSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['manual', 'grid', 'perimeter', 'crosshatch'],
    default: 'manual'
  },
  waypoints: [waypointSchema],
  coverageArea: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // GeoJSON format for polygon
      required: function() {
        return ['grid', 'perimeter', 'crosshatch'].includes(this.type);
      }
    }
  },
  altitude: Number, // in meters
  overlapPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 60
  }
});

const missionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Mission name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  drone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drone',
    required: [true, 'Drone is required for mission']
  },
  site: {
    type: String,
    required: [true, 'Site location is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'aborted', 'failed'],
    default: 'scheduled'
  },
  flightPath: flightPathSchema,
  dataCollectionParams: {
    frequency: Number, // in seconds
    sensors: [String],
    captureMode: {
      type: String,
      enum: ['continuous', 'waypoints', 'intervals'],
      default: 'waypoints'
    }
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  scheduledStart: {
    type: Date,
    required: [true, 'Start time is required']
  },
  actualStart: Date,
  actualEnd: Date,
  estimatedDuration: Number, // in minutes
  logs: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    event: String,
    details: mongoose.Schema.Types.Mixed
  }],
  currentPosition: {
    coordinates: [Number], // [longitude, latitude]
    altitude: Number,
    timestamp: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
missionSchema.index({ 'flightPath.coverageArea': '2dsphere' });
missionSchema.index({ 'currentPosition.coordinates': '2dsphere' });

const Mission = mongoose.model('Mission', missionSchema);
module.exports = Mission;
