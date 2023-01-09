const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const FetchUsers = require('../middleware/FetchUsers');
const sessionLogout = require('../middleware/sessionLogout')
const subscriptionsController = require('../controllers/subscriptionsController')

router.get('/subscription_list', sessionLogout, subscriptionsController.subscription_list);

router.get('/subscription_by_id', sessionLogout, [
    query('subs_id', 'subs_id is required').exists()], subscriptionsController.subscription_by_id);

router.post('/user_subs_plan', FetchUsers, [
    body('subs_id', 'subs_id is required').exists(),
    body('doctor_id', 'doctor_id is required').exists(),
    body('payment_type', 'payment_type is required').exists(),
], subscriptionsController.user_subs_plan);

router.get('/subscription_by_user_id', sessionLogout, [
    query('user_id', 'user_id is required').exists()], subscriptionsController.subscription_by_user_id)

router.post('/subscription_delete', sessionLogout, [
    body('user_id', 'user_id is required').exists(),
    body('subs_id', 'subs_id is required').exists()], subscriptionsController.subscription_delete)

router.get('/subscription_invoice', sessionLogout, [
    query('subs_id', 'subs_id is required').exists(),
    query('payment_type', 'payment_type is required').exists(),
    query('subscription_type', 'subscription_type is required').exists(),
    query('doctor_id', 'doctor_id is required').exists()], subscriptionsController.subscription_invoice)

router.get('/subscription_current_plan', FetchUsers, subscriptionsController.subscription_current_plan)

router.get('/subscription_expired_plan', FetchUsers, subscriptionsController.subscription_expired_plan)

router.get('/subscription_exist_validation', FetchUsers, [
    query('doctor_id', 'doctor_id is required').exists(),
], subscriptionsController.subscription_exist_validation);

router.get('/doclink_plan_doctors', sessionLogout, subscriptionsController.doclink_plan_doctors);


module.exports = router;