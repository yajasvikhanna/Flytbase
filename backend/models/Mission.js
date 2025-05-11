const mongoose = require('mongoose');

const WaypointSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  altitude: {
    type: Number,
    required: true
  },
  action: {
    type: String,
    enum: ['navigate', 'hover', 'capture', 'return'],
    default: 'navigate'
  },
  hoverTime: {
    type: Number, // in seconds
    default: 0
  },
  captureSettings: {
    sensorType: {
      type: String,
      enum: ['RGB camera', 'thermal camera', 'LiDAR', 'multispectral', 'infrared', 'gas sensor', 'other'],
      default: 'RGB camera'
    },
    captureMode: {
      type: String,
      enum: ['single', 'burst', 'interval', 'video'],
      default: 'single'
    },
    captureCount: {
      type: Number,
      default: 1
    },
    intervalTime: {
      type: Number, // in seconds
      default: 0
    }
  }
});

const MissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a mission name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  missionType: {
    type: String,
    enum: ['inspection', 'mapping', 'surveillance', 'delivery', 'custom'],
    required: [true, 'Please specify mission type']
  },
  status: {
    type: String,
    enum: ['planned', 'queued', 'in-progress', 'paused', 'completed', 'aborted', 'failed'],
    default: 'planned'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  surveyAreaName: {
    type: String,
    required: [true, 'Please provide a survey area name']
  },
  surveyArea: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]], // GeoJSON Polygon format
      required: true
    }
  },
  flightPattern: {
    type: String,
    enum: ['grid', 'crosshatch', 'spiral', 'perimeter', 'custom'],
    default: 'grid'
  },
  patternParameters: {
    overlap: {
      type: Number, // percentage
      default: 70
    },
    sideOverlap: {
      type: Number, // percentage
      default: 60
    },
    altitude: {
      type: Number, // meters
      required: [true, 'Please specify flight altitude']
    },
    speed: {
      type: Number, // m/s
      required: [true, 'Please specify flight speed']
    },
    spacing: {
      type: Number, // meters between flight lines
      default: 50
    }
  },
  waypoints: [WaypointSchema],
  currentWaypoint: {
    type: Number,
    default: 0
  },
  droneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drone',
    default: null
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Please provide an organization ID']
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Please provide estimated mission duration']
  },
  estimatedDistance: {
    type: Number, // in kilometers
    required: [true, 'Please provide estimated mission distance']
  },
  estimatedTimeRemaining: {
    type: Number, // in seconds
    default: 0
  },
  scheduledTime: {
    type: Date,
    default: null
  },
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  missionParameters: {
    captureInterval: {
      type: Number, // in seconds
      default: 5
    },
    sensors: [{
      type: String,
      enum: ['RGB camera', 'thermal camera', 'LiDAR', 'multispectral', 'infrared', 'gas sensor', 'other']
    }],
    returnToHome: {
      type: Boolean,
      default: true
    },
    avoidanceEnabled: {
      type: Boolean,
      default: true
    }
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
  }
});

// Update timestamps when updating a document
MissionSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Add a 2dsphere index for geo queries
MissionSchema.index({ surveyArea: '2dsphere' });

module.exports = mongoose.model('Mission', MissionSchema);