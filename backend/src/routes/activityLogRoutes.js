const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('developer', 'administrator'), activityLogController.getAll);

module.exports = router;
