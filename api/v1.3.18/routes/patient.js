const express = require('express');
const router = express.Router();
const FetchUsers = require('../middleware/FetchUsers');
const { body, query, validationResult } = require('express-validator');
const sessionLogout = require('../middleware/sessionLogout')
const patientController = require('../controllers/patientController')

router.get('/prescribed_medicine', sessionLogout, [
    query('chatroom_session_id', 'chatroom_session_id is required').exists(),
    query('chatroom_id', 'chatroom_id is required').exists()
], patientController.prescribed_medicine);

router.get('/patient_home_screen', sessionLogout, patientController.patient_home_screen);

router.get('/closing_notes_view', sessionLogout, [
    query('chatroom_session_id', 'chatroom_session_id is required').exists()
], patientController.closing_notes_view);

router.get('/search_filter_patient', FetchUsers, patientController.search_filter_patient);

router.get('/my_patient_filters', FetchUsers, patientController.my_patient_filters);

router.get('/patient_view_details', [
    query('patient_id', 'patient_id is required').exists(),
], FetchUsers, patientController.patient_view_details);

router.get('/history_by_id', FetchUsers, [query('history_type').exists(), query('patient_id').exists(), query('history_id').exists()], patientController.history_by_id);




module.exports = router;