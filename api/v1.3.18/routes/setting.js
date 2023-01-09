const express = require('express');
const router = express.Router();
const sessionLogout = require('../middleware/sessionLogout')
const settingController = require('../controllers/settingController')

router.get('/view_terms_conition', sessionLogout, settingController.view_terms_conition);

module.exports = router;