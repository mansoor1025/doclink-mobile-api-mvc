const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const FetchUsers = require('../middleware/FetchUsers');
const doctorWallerController = require('../controllers/doctorWalletController')

router.get('/earnings', FetchUsers, doctorWallerController.earnings);

router.get('/history_by_id', FetchUsers, [query('history_type').exists(), query('history_id').exists()], doctorWallerController.history_by_id);

router.get('/payout', FetchUsers, doctorWallerController.payout);

router.get('/history_type', doctorWallerController.history_type);




module.exports = router;