const express = require('express');
const router = express.Router();
const UserModel = require("../auth/UserModel");
const { body, query, validationResult } = require('express-validator');
const user_fcm_token_model = require('../model/user_fcm_token_model')
const authController = require('../controllers/authController')

router.post('/mobile', [
    body('mobile', 'mobile is required').exists(),
    body('platform', 'platform is required').exists(),
    body('device_brand', 'device_brand is required').exists(),
    body('device_model', 'device_model is required').exists(),
    body('device_name', 'device_name is required').exists(),
    body('app_version', 'app_version is required').exists(),
    body('device_os', 'device_os is required').exists(),
    body('device_identifier', 'device_identifier is required').exists(),
    body('role_id', 'role_id is required').exists()
], authController.mobile);

router.post('/public_patient_fcm_token', [
    body('device_token', 'device_token is required').exists(),
    body('fcm_token', 'fcm_token is required').exists()
], authController.public_patient_fcm_token);

router.post('/update_connecty_cube', [
    body('connectycube_email', 'connectycube_email is required').exists(),
    body('connectycube_full_name', 'connectycube_full_name is required').exists(),
    body('connectycube_id', 'connectycube_id is required').exists(),
    body('connectycube_login', 'connectycube_login is required').exists(),
    body('connectycube_password', 'connectycube_password is required').exists(),
    body('user_id', 'user_id is required').exists()
], authController.update_connecty_cube);

router.post('/logout', [
    body('user_id', 'user_id is required').exists(),
], authController.logout);

module.exports = router;