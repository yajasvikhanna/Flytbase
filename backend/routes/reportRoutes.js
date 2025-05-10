const express = require('express');
const reportController = require('../controllers/reportController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(reportController.getAllReports)
  .post(reportController.createReport);

router
  .route('/:id')
  .get(reportController.getReport)
  .patch(reportController.updateReport)
  .delete(authController.restrictTo('admin', 'supervisor'), reportController.deleteReport);

router
  .route('/mission/:missionId')
  .get(reportController.getReportsByMission);

module.exports = router;