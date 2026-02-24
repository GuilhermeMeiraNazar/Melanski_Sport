const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const { authenticate, authorize } = require('../middleware/auth');
const { checkFeature } = require('../middleware/featureCheck');

router.get('/', authenticate, authorize('developer', 'administrator'), checkFeature('feature_logs'), activityLogController.getAll);

module.exports = router;
