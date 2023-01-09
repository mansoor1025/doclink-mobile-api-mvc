const express = require('express');
const router = express.Router();
const moment = require('moment');
const FetchUsers = require('../middleware/FetchUsers');
const { body, query, validationResult } = require('express-validator');
const UserModel = require('../auth/UserModel');
const sessionLogout = require('../middleware/sessionLogout')
const referralCodeController = require('../controllers/referralCodeController');

router.get('/check_referral_code',
    sessionLogout, [query('referral_code').exists()],
    referralCodeController.check_referral_code,
);
module.exports = router;