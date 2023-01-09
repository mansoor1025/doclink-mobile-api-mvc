const express = require('express');
const router = express.Router();
const moment = require('moment');
const { body, query, validationResult } = require('express-validator');
import { parsePhoneNumberFromString } from 'libphonenumber-js';
const jwt_secret = 'doclink-mobile-api';

router.get('/invite_by_name', [
    body('name', 'name is required').exists()
], async function (req, res, next) {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        
    } catch (error) {
        console.log(error);
        res.send(error);
    }

});

module.exports = router;