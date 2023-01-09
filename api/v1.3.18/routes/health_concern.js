const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const sessionLogout = require('../middleware/sessionLogout')
const healthConcernController = require('../controllers/healthConcernController')

router.get('/view_all_heath_concern', sessionLogout, healthConcernController.view_all_heath_concern);

router.get('/health_via_name', sessionLogout, [
    query('name', 'health name is required').exists(),
], healthConcernController.health_via_name);

router.get('/health_by_doctor', sessionLogout, [
    query('health_id', 'health_id is required').exists(),
], healthConcernController.health_by_doctor);

module.exports = router;