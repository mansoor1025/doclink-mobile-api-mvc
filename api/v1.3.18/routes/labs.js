const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const FetchUsers = require('../middleware/FetchUsers');
const labsController = require('../controllers/labsController')

router.get('/view_all_labs', FetchUsers, labsController.view_all_labs);

router.get('/active_test', [query('labs_id').exists()], FetchUsers, labsController.active_test);

router.post('/lab_booking', [body('lab_id').exists(), body('home_visit').exists(), body('lab_visit').exists(), body('total_amount').exists(), body('patient_name').exists(), body('age').exists(), body('phone_number').exists(), body('branch_id').exists(), body('prescription').exists(), body('collection_date').exists()], FetchUsers, labsController.lab_booking);


module.exports = router;