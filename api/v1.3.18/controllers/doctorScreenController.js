const moment = require('moment');
const chatrooms_model = require("../model/chatrooms_model");
const endorsed_model = require("../model/endorsment_modal");
const banner_model = require('../model/banner_modal')
const { body, query, validationResult } = require('express-validator');
const user_subs_plan_model = require('../model/user_subs_plan_model');
const rating_reviews = require("../model/rating_reviews_model");
exports.doctor_home_screen = async (req, res, next) => {
    try {
        const start_lastweek_date = moment().subtract(1, 'weeks').startOf('isoWeek').format('YYYY-MM-DD');
        const end_lastweek_date = moment().format('YYYY-MM-DD');
        const start_month = moment().startOf('month').format('YYYY-MM-DD');
        const end_month = moment().endOf('month').format('YYYY-MM-DD');

        let last_7_patient = await chatrooms_model.find({ is_active: true, doctor_id: req.user.user_id })
        let last_7_endorsed = await endorsed_model.find({ endors_status: 1, endors_to: req.user.user_id })
        let subscription = await user_subs_plan_model.find({ doctor_id: req.user.user_id, is_active: 1 })
        let home_screen_banner = await banner_model.find({ screen_id: 13 })
        const review_rating = await rating_reviews.find({ doctor_id: req.user.user_id, is_active: 1 })

        let home_screen_obj = {
            last_7_patient: last_7_patient.length,
            last_7_endorsed: last_7_endorsed.length,
            subsciprtion_this_month: subscription.length,
            home_screen_banner: home_screen_banner,
            feed_back: review_rating.length
        }
        return res.status(200).json({ msg: "success", response: home_screen_obj })
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}