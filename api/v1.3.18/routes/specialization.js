const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const sessionLogout = require('../middleware/sessionLogout')
const specializationController = require('../controllers/specializationController')

router.get('/view_specialization', sessionLogout, specializationController.view_specialization);

router.get('/specliazation_via_doctor', sessionLogout, [
    query('spec_id', 'specialization id is required').exists()], specializationController.specliazation_via_doctor);

module.exports = router;