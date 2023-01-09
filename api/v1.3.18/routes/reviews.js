const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const sessionLogout = require('../middleware/sessionLogout')
const reviewController = require('../controllers/reviewController')

router.get('/view_all_reviews', sessionLogout, [
    query('patient_id', 'patient_id is required').exists(),
    query('doctor_id', 'doctor_id is required').exists(),
], reviewController.view_all_reviews);

module.exports = router;