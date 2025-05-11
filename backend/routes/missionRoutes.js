/**
 * Mission planning and execution routes
 */
const express = require('express');
const {
  getMissions,
  getMission,
  createMission,
  updateMission,
  deleteMission,
  updateMissionProgress,
  startMission,
  completeMission,
  abortMission
} = require('../controllers/missionController');

// Include report controller for mission reports routes
const { getMissionReports } = require('../controllers/reportController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Mission CRUD routes
router.route('/')
  .get(getMissions)
  .post(createMission);

// Single mission routes
router.route('/:id')
  .get(getMission)
  .put(updateMission)
  .delete(deleteMission);

// Mission control routes
router.route('/:id/start')
  .post(startMission);

router.route('/:id/complete')
  .post(completeMission);

router.route('/:id/abort')
  .post(abortMission);

// Mission progress routes
router.route('/:id/progress')
  .patch(updateMissionProgress);

// Mission reports routes
router.route('/:missionId/reports')
  .get(getMissionReports);

module.exports = router;