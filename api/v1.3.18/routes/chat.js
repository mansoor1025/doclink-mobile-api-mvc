const express = require('express');
const router = express.Router(); import common from '../../../helpers/common'
const { body, query, validationResult } = require('express-validator');
const sessionLogout = require('../middleware/sessionLogout')
const chatController = require('../controllers/chatController')
router.post('/add_closing_notes', [
    body('chatroom_session_id', 'chatroom_session_id is required').exists(),
    body('doctor_id', 'doctor_id is required').exists(),
    body('return_session_charges', 'Return session charges is required field').exists()
], sessionLogout, chatController.add_closing_notes);

module.exports = router;