const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const FetchUsers = require('../middleware/FetchUsers');
const sessionLogout = require('../middleware/sessionLogout')
const videoCallController = require('../controllers/videoCallController')

router.get('/video_call_invoice', sessionLogout, [
    query('video_id', 'video_id is required').exists(),
    query('payment_type', 'payment_type is required').exists()], FetchUsers, videoCallController.video_call_invoice);



module.exports = router;