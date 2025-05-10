const express = require('express');
const missionController = require('../controllers/missionController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(missionController.getAllMissions)
  .post(missionController.createMission);

router
  .route('/:id')
  .get(missionController.getMission)
  .patch(missionController.updateMission)
  .delete(missionController.deleteMission);

router
  .route('/:id/status')
  .patch(missionController.updateMissionStatus);

router
  .route('/site/:site')
  .get(missionController.getMissionsBySite);

router
  .route('/active')
  .get(missionController.getActiveMissions);

module.exports = router;