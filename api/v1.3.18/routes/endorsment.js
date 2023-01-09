const express = require('express');
const router = express.Router();
const FetchUsers = require('../middleware/FetchUsers');
const { body, query, validationResult } = require('express-validator');
const endorsmentController = require('../controllers/endorsmentController')

router.post('/doctor_endored', [
    body('endors_to', 'Endorsed Doctor To is required').exists(),
], FetchUsers, endorsmentController.doctor_endored);

router.get('/doctor_list_with_endorsed', FetchUsers, endorsmentController.doctor_list_with_endorsed);

router.get('/endored_detail_by_id', FetchUsers, endorsmentController.endored_detail_by_id)

router.get('/view_all_endorsment', [query('doctor_id', 'doctor_id is required').exists()], endorsmentController.view_all_endorsment);

router.get('/doctor_endorsment_cards', FetchUsers, endorsmentController.doctor_endorsment_cards);

router.get('/endored_by_details', FetchUsers, endorsmentController.endored_by_details);

router.get('/endored_to_details', FetchUsers, endorsmentController.endored_to_details);



module.exports = router;