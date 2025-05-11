/**
 * Reporting and analytics routes
 */
const express = require('express');
const {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  getOrganizationStats
} = require('../controllers/reportController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Organization-level statistics
router.get('/stats', getOrganizationStats);

// Report CRUD routes
router.route('/')
  .get(getReports)
  .post(createReport);

// Single report routes
router.route('/:id')
  .get(getReport)
  .put(updateReport)
  .delete(deleteReport);

module.exports = router;