const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    required: [true, 'Mission reference is required']
  },
  drone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drone',
    required: [true, 'Drone reference is required']
  },
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'complete'],
    default: 'pending'
  },
  flightStats: {
    distance: Number, // in meters
    duration: Number, // in minutes
    maxAltitude: Number, // in meters
    avgSpeed: Number, // in m/s
    batteryConsumed: Number, // percentage
    areaCovered: Number, // in square meters
  },
  summary: {
    type: String,
    trim: true
  },
  missionLogs: [{
    timestamp: Date,
    event: String,
    details: mongoose.Schema.Types.Mixed
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;