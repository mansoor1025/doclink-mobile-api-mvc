const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const sessionLogout = require('../middleware/sessionLogout')
const diseaseController = require('../controllers/diseaseController')

router.get('/view_all_disease', sessionLogout, diseaseController.view_all_disease);

router.get('/disease_via_name', sessionLogout, [
    query('name', 'disease name is required').exists(),
], diseaseController.disease_via_name);

router.get('/disease_by_doctor', sessionLogout, [
    query('disease_id', 'disease_id is required').exists(),
], diseaseController.disease_by_doctor);

module.exports = router;