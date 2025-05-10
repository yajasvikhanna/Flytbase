const express = require('express');
const droneController = require('../controllers/droneController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(droneController.getAllDrones)
  .post(authController.restrictTo('admin', 'supervisor'), droneController.createDrone);

router
  .route('/:id')
  .get(droneController.getDrone)
  .patch(authController.restrictTo('admin', 'supervisor'), droneController.updateDrone)
  .delete(authController.restrictTo('admin'), droneController.deleteDrone);

router
  .route('/:id/status')
  .patch(droneController.updateDroneStatus);

router
  .route('/site/:site')
  .get(droneController.getDronesBySite);

module.exports = router;
