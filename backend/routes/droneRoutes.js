/**
 * Drone management routes
 */
const express = require('express');
const {
  getDrones,
  getDrone,
  createDrone,
  updateDrone,
  deleteDrone,
  updateDroneStatus,
  getAvailableDrones
} = require('../controllers/droneController');

// Include mission controller for drone-specific mission routes
const { getDroneMissions } = require('../controllers/missionController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Basic drone CRUD routes
router.route('/')
  .get(getDrones)
  .post(authorize('admin', 'manager'), createDrone);

// Available drones route
router.get('/available', getAvailableDrones);

// Single drone routes
router.route('/:id')
  .get(getDrone)
  .put(authorize('admin', 'manager'), updateDrone)
  .delete(authorize('admin', 'manager'), deleteDrone);

// Drone status routes
router.route('/:id/status')
  .patch(updateDroneStatus);

// Drone mission routes
router.route('/:droneId/missions')
  .get(getDroneMissions);

module.exports = router;