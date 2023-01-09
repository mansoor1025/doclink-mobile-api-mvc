const { body, query, validationResult } = require('express-validator');
const video_packages_model = require('../model/video_packages_model')
const moment = require('moment')

exports.video_call_invoice = async (req, res, next) => {
    try {
        console.log('video call invoice is running');
        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const video_id = req.query.video_id;
        const payment_type = req.query.payment_type;
        const video_packages_details = await video_packages_model.findOne({ vp_id: video_id, is_active: 1 })

        let video_obj = {
            video_packages_details: video_packages_details,
            payment_type: payment_type,
            created_at: moment().format()
        }
        return res.status(200).json({ msg: "success", response: video_obj })
    } catch (error) {
        // common.error_log(req.header.device_token, req.user.name, 'doclink-mobile-app-backend', 'subscription/subscription_list', error.message, "http://3.248.146.200:3100/")
        return res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}