const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const FetchUsers = require('../middleware/FetchUsers');
const walletController = require('../controllers/walletController') 

router.get('/history_type', FetchUsers, walletController.history_type);

router.get('/active_subscription', FetchUsers, walletController.active_subscription);

router.get('/history_by_id', FetchUsers, [query('history_type').exists(), query('history_id').exists()], walletController.history_by_id);




module.exports = router;