const express = require('express');
const router = express.Router();
const FetchUsers = require('../middleware/FetchUsers');
const { body, query, validationResult } = require('express-validator');
const doctorScreenController = require('../controllers/doctorScreenController')

router.get('/doctor_home_screen', FetchUsers, doctorScreenController.doctor_home_screen);

module.exports = router;