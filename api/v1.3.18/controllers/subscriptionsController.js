const moment = require('moment');
const { body, query, validationResult } = require('express-validator');
const subscription_model = require('../model/subscription_model')
const subs_features_model = require('../model/subs_features_model')
const user_subs_plan_model = require('../model/user_subs_plan_model')
const user_model = require('../auth/UserModel')
const common = require('../../../helpers/common')
const UserModel = require('../auth/UserModel');
const doctor_transaction_model = require('../model/doctor_transaction_model')
const qualification_model = require('../model/doctor_qualification_model');
const services_model = require('../model/doctor_services_model');
const rating_reviews = require('../model/rating_reviews_model');
const endorsed_modal = require('../model/endorsment_modal')

exports.subscription_list = async (req, res, next) => {
    try {
        let doctor_id = req.query.doctor_id;
        console.log('doctor_id', doctor_id);
        if (typeof (doctor_id) == 'undefined') {
            doctor_id = 0;
        }
        const custom_plan_exists = await subscription_model.find({ subscription_type: "custom plan", doctor_id: doctor_id, is_active: 1 }).sort({ month: 1 })
        console.log('length', custom_plan_exists.length);
        const plan_type = custom_plan_exists.length > 0 ? "custom plan" : "basic plan";
        let subscription_details = '';
        const subscription_type = req.query.subscription_type
        console.log('plan_type', plan_type);
        if (plan_type == 'custom plan') {
            subscription_details = await subscription_model.find({ is_active: 1, subscription_type: "custom plan", doctor_id: doctor_id }).sort({ month: 1 })
        }
        else {
            if (subscription_type == 'custom plan') {
                subscription_details = [];
            }
            else {
                subscription_details = await subscription_model.find({ is_active: 1, subscription_type: subscription_type }).sort({ month: 1 })
            }
        }

        return res.status(200).json({ msg: "success", response: subscription_details })
    } catch (error) {
        common.error_log(req.header.device_token, req.user.name, 'doclink-mobile-app-backend', 'subscription/subscription_list', error.message, "http://3.248.146.200:3100/")
        return res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.subscription_by_id = async (req, res, next) => {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let subs_id = req.query.subs_id;
        let subscription_type = req.query.subscription_type

        let subs_id_exists = await subscription_model.find({ is_active: 1, subs_id: subs_id })

        if (subs_id_exists.length == 0) {
            res.status(400).json({ msg: "error", response: "subscription did not exists" })
        }

        let subscription = await subscription_model.find({ is_active: 1, subs_id: subs_id, subscription_type: subscription_type })
        let subs_features = await subs_features_model.find({ is_active: 1, subs_id: subs_id, subscription_type: subscription_type })
        let subs_data = {
            subscription: subscription,
            subscription_features: subs_features
        }
        return res.status(200).json({ msg: "success", response: subs_data })
    } catch (error) {
        // common.error_log(req.header.device_token, req.user.name, 'doclink-mobile-app-backend', 'subscription/subscription_by_id', error.message, "http://3.248.146.200:3100/")
        res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.user_subs_plan = async (req, res, next) => {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let patient_id = req.user.user_id
        let doctor_id = req.body.doctor_id
        let subs_id = req.body.subs_id
        let usp_final_id = 0;
        let subscription_type = req.body.subscription_type
        let video_calls = 0;
        let payment_type = req.body.payment_type;
        let doctor_exists = await UserModel.find({ user_id: doctor_id })
        let subs_plan_exists_with_user = await user_subs_plan_model.find({ patient_id: patient_id, doctor_id: doctor_id, is_active: 1 }).limit(1).sort({ usp_id: -1 })


        // console.log('subs_plan_exists_with_user====');
        // console.log(subs_plan_exists_with_user);

        console.log('patient_id', patient_id);
        console.log('doctor_id', doctor_id);
        if (doctor_exists.length == 0) {
            return res.status(409).json({ msg: "error", response: "Doctor Did Not Exists" })
        }

        if (subs_plan_exists_with_user.length > 0) {
            let subscription_details = await subscription_model.findOne({ subs_id: subs_plan_exists_with_user[0].subs_id, subscription_type: subs_plan_exists_with_user[0].subscription_type })
            let subs_features_detail = await subs_features_model.findOne({ subs_id: subscription_details.subs_id, subscription_type: subscription_details.subscription_type, feature_name: "*Chat & voice notes" })
            if (subs_plan_exists_with_user[0].availed_session >= subs_features_detail.limit) {
                await user_subs_plan_model.updateOne(
                    {
                        usp_id: subs_plan_exists_with_user[0].usp_id
                    },
                    { $set: { is_active: 0 } })

            }
            else {
                console.log('error in condition');

                return res.status(409).json({ msg: "error", response: `Already subscribed with Dr ${doctor_exists[0].name}` })
            }

        }

        let usp_count = await user_subs_plan_model.findOne({}).sort({ usp_id: -1 });
        if (usp_count == null) {
            usp_final_id = 1;
        } else {
            usp_final_id = parseInt(usp_count.usp_id) + 1;
        }

        let subs_plan_detail = await subscription_model.find({ subs_id: subs_id, subscription_type: subscription_type })
        let user_detail = await user_model.find({ user_id: patient_id, role: 1, is_active: 1 })
        let current_date = moment().format('DD.MM.YYYY');
        let total_days = parseInt(subs_plan_detail[0].month) * 30;
        let startDate = current_date;
        let plan_expiry_date = moment(startDate, "DD-MM-YYYY").add(total_days, 'days');
        let format_plan_expiry_date = moment(plan_expiry_date).format('DD-MM-YYYY');

        let subs_obj = {
            usp_id: usp_final_id,
            patient_id: patient_id,
            doctor_id: doctor_id,
            subscription_type: subscription_type,
            subs_id: subs_id,
            plan_name: subs_plan_detail[0].name,
            email: user_detail[0].email,
            plan_expiry_date: format_plan_expiry_date,
            payment_type: payment_type,
            created_at: moment().format()
        }

        await new user_subs_plan_model(subs_obj).save();
        let dt_final_id = 0;
        let dt_count = await doctor_transaction_model.findOne({}).sort({ dt_id: -1 });
        if (dt_count == null) {
            dt_final_id = 1;
        } else {
            dt_final_id = parseInt(dt_count.dt_id) + 1;
        }

        let deduction_doclink_amount = parseInt(subs_plan_detail[0].final_amount) / 100 * 30;
        let net_amount = parseInt(subs_plan_detail[0].final_amount) - parseInt(deduction_doclink_amount);
        let transaction_obj = {
            dt_id: dt_final_id,
            patient_id: patient_id,
            doctor_id: doctor_id,
            amount: subs_plan_detail[0].final_amount,
            package_id: subs_plan_detail[0].subs_id,
            payment_via: payment_type,
            transaction_type: "subscription",
            doclink_commision: 30,
            deduction_doclink_amount: deduction_doclink_amount,
            net_amount: Math.floor(net_amount)
        }

        const mySentence = subs_plan_detail[0].subscription_type;
        const words = mySentence.split(" ");

        for (let i = 0; i < words.length; i++) {
            words[i] = words[i][0].toUpperCase() + words[i].substr(1);
        }


        await new doctor_transaction_model(transaction_obj).save();
        var message = `You are now subscribed with ${user_detail[0].name}`
        var bodyParams = {
            user_id: doctor_id,
            flavor: 'doctor',
            notificaiton_data: {
                "title": `${subs_plan_detail[0].month} Months - ${words.join(" ")}`,
                "body": message,
                "sound": "default",
                "icon": "stock_ticker_update",
                "color": "#ffffff",
                "channel_id": "doclink_patient_channel",
                "default_sound": "false",
                "personal_data": { "doctor_id": doctor_id, "patient_id": patient_id },
            },
        }
        common.send_notification_for_rest_api(bodyParams)
        return res.status(200).json({ msg: "success", response: "user plan add successfully", already_exists: subs_plan_exists_with_user.length })
    } catch (error) {
        // common.error_log(req.header.device_token, req.user.name, 'doclink-mobile-app-backend', 'subscription/subscription_by_id', error.message, "http://3.248.146.200:3100/")
        // res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.subscription_by_user_id = async (req, res, next) => {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let subscription_data = []
        let user_id = req.query.user_id
        let user_subscription_details = await user_subs_plan_model.find({ user_id: user_id, is_active: 1 })

        for (let i = 0; i < user_subscription_details.length; i++) {
            let subscription_detail = await subscription_model.findOne({ subs_id: user_subscription_details[i].subs_id, is_active: 1 })
            let subscription_features = await subs_features_model.findOne({ subs_id: user_subscription_details[i].subs_id, is_active: 1 })
            let user_detail = await user_model.findOne({ user_id: user_id })
            let subs_obj = {
                username: user_detail.name,
                user_id: user_detail.user_id,
                is_active: subscription_detail.is_active,
                created_at: subscription_detail.created_at,
                _id: subscription_detail._id,
                subs_id: subscription_detail.subs_id,
                name: subscription_detail.name,
                month: subscription_detail.month,
                amount: subscription_detail.amount,
                discount_per: subscription_detail.discount_per,
                discounted_amount: subscription_detail.discounted_amount,
                popular: subscription_detail.popular,
                subs_features: subscription_features
            }
            subscription_data.push(subs_obj)
        }
        console.log('======================');
        console.log(subscription_data);

        return res.status(200).json({ msg: "success", response: subscription_data })
    } catch (error) {
        common.error_log(req.header.device_token, req.user.name, 'doclink-mobile-app-backend', 'subscription/subscription_by_id', error.message, "http://3.248.146.200:3100/")
        res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.subscription_delete = async (req, res, next) => {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let user_id = req.body.user_id
        let subs_id = req.body.subs_id
        await user_subs_plan_model.deleteOne({ user_id: user_id, subs_id: subs_id })

        return res.status(200).json({ msg: "success", response: "Subscription Delete Successfully" })
    } catch (error) {
        common.error_log(req.header.device_token, req.user.name, 'doclink-mobile-app-backend', 'subscription/subscription_by_id', error.message, "http://3.248.146.200:3100/")
        res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.subscription_invoice = async (req, res, next) => {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let subs_id = req.query.subs_id
        let subscription_type = req.query.subscription_type
        let doctor_id = req.query.doctor_id
        let payment_type = req.query.payment_type
        let subscription_detail = await subscription_model.findOne({ subs_id: subs_id, subscription_type: subscription_type, is_active: 1 })
        let doctor_detail = await UserModel.findOne({ user_id: doctor_id, role: 2, is_active: 1 })
        let created_at = moment().format();
        let expire_on = moment(created_at).add(subscription_detail.month, 'months');
        let invoice_object = {
            plan_name: `${subscription_detail.subscription_type} - ${subscription_detail.month} Month`,
            doctor_name: doctor_detail.name,
            time_period: `${subscription_detail.month} Month`,
            purchased_on: created_at,
            expire_on: expire_on,
            paid_from: payment_type,
            total: subscription_detail.final_amount
        }
        return res.status(200).json({ msg: "success", response: invoice_object })
    } catch (error) {
        common.error_log(req.header.device_token, req.user.name, 'doclink-mobile-app-backend', 'subscription/subscription_by_id', error.message, "http://3.248.146.200:3100/")
        res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.subscription_current_plan = async (req, res, next) => {
    try {
        console.log('*********************');
        console.log(req.user.user_id);
        let current_plans = [];
        let user_subs_plan = await user_subs_plan_model.find({ doctor_id: req.user.user_id, is_active: 1 });
        for (let i = 0; i < user_subs_plan.length; i++) {
            const patient_detail = await UserModel.findOne({ user_id: user_subs_plan[i].patient_id })
            const subscription_detail = await subscription_model.findOne({ subs_id: user_subs_plan[i].subs_id, subscription_type: user_subs_plan[i].subscription_type })
            const expire_on = moment(user_subs_plan[i].created_at).add(subscription_detail.month, 'months');
            let subscription_data = {
                name: patient_detail.name,
                image: patient_detail.avatar,
                plan_type: subscription_detail.subscription_type,
                time_period: `${subscription_detail.month} Month`,
                purchased_on: user_subs_plan[i].created_at,
                expire_on: expire_on,
                subs_id: subscription_detail.subs_id,
                is_active: user_subs_plan[i].is_active
            }
            current_plans.push(subscription_data);
        }

        return res.status(200).json({ msg: "success", response: current_plans })
    } catch (error) {
        res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.subscription_expired_plan = async (req, res, next) => {
    try {
        console.log('*********************');
        console.log(req.user.user_id);
        let current_plans = [];
        let user_subs_plan = await user_subs_plan_model.find({ doctor_id: req.user.user_id, is_active: 0 });
        for (let i = 0; i < user_subs_plan.length; i++) {
            const patient_detail = await UserModel.findOne({ user_id: user_subs_plan[i].patient_id })
            const subscription_detail = await subscription_model.findOne({ subs_id: user_subs_plan[i].subs_id, subscription_type: user_subs_plan[i].subscription_type })
            const expire_on = moment(user_subs_plan[i].created_at).add(subscription_detail.month, 'months');
            let subscription_data = {
                name: patient_detail.name,
                image: patient_detail.avatar,
                plan_type: subscription_detail.subscription_type,
                time_period: `${subscription_detail.month} Month`,
                purchased_on: user_subs_plan[i].created_at,
                expire_on: expire_on,
                subs_id: subscription_detail.subs_id,
                expired: "expired",
                is_active: user_subs_plan[i].is_active
            }
            current_plans.push(subscription_data);
        }

        return res.status(200).json({ msg: "success", response: current_plans })
    } catch (error) {
        res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.subscription_exist_validation = async (req, res, next) => {
    try {

        let patient_id = req.user.user_id
        let doctor_id = req.query.doctor_id
        let doctor_exists = await UserModel.find({ user_id: doctor_id })
        let subs_plan_exists_with_user = await user_subs_plan_model.find({ patient_id: patient_id, doctor_id: doctor_id, is_active: 1 }).limit(1).sort({ usp_id: -1 })

        if (doctor_exists.length == 0) {
            return res.status(409).json({ msg: "error", response: "Doctor Did Not Exists" })
        }

        if (subs_plan_exists_with_user.length > 0) {
            let subscription_details = await subscription_model.findOne({ subs_id: subs_plan_exists_with_user[0].subs_id, subscription_type: subs_plan_exists_with_user[0].subscription_type })
            let subs_features_detail = await subs_features_model.findOne({ subs_id: subscription_details.subs_id, subscription_type: subscription_details.subscription_type, feature_name: "Chats and voice notes*" })
            if (subs_plan_exists_with_user[0].availed_session >= subs_features_detail.limit) {
                await user_subs_plan_model.updateOne(
                    {
                        usp_id: subs_plan_exists_with_user[0].usp_id
                    },
                    { $set: { is_active: 0 } })
                return res.status(200).json({ msg: "success", response: `ready to buy` })
            }
            else {
                console.log('error in condition');
                return res.status(409).json({ msg: "error", response: `Already subscribed with Dr ${doctor_exists[0].name} ` })
            }

        }
        else {
            return res.status(200).json({ msg: "success", response: `ready to buy` })
        }

    } catch (error) {
        // common.error_log(req.header.device_token, req.user.name, 'doclink-mobile-app-backend', 'subscription/subscription_by_id', error.message, "http://3.248.146.200:3100/")
        // res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.doclink_plan_doctors = async (req, res, next) => {
    try {
        const { page = 1, limit = 15 } = req.query;
        const name = req.query.name
        const customized_doctors = await subscription_model.find({ subscription_type: "custom plan", doctor_id: { $ne: null } }).distinct('doctor_id')

        let top_rated_doctor = ''
        if (name) {
            top_rated_doctor = await UserModel.find({ name: { $regex: name, $options: 'i' }, role: 2, is_verified: 1, is_number_verified: 1, user_id: { $nin: customized_doctors } }).limit(limit * 1).skip((page - 1) * limit).sort({ user_id: -1 });
        }
        else {
            top_rated_doctor = await UserModel.find({ role: 2, is_verified: 1, is_active: 1, is_number_verified: 1, user_id: { $nin: customized_doctors } }).limit(limit * 1).skip((page - 1) * limit).sort({ user_id: -1 });
        }

        let all_over_doctor = await UserModel.find({ role: 2, is_verified: 1, is_number_verified: 1, user_id: { $nin: customized_doctors } });
        let final_top_rated = []
        let total_rating = 0;
        let all_over_rating = 0;
        for (let i = 0; i < top_rated_doctor.length; i++) {
            let top_rated = await UserModel.find({ role: 2, is_verified: 1, is_active: 1, is_number_verified: 1, user_id: top_rated_doctor[i].user_id });
            if (top_rated.length > 0) {
                let qualification_detail = await qualification_model.find({ doctor_id: top_rated_doctor[i].user_id })
                let services_detail = await services_model.find({ doctor_id: top_rated_doctor[i].user_id })
                let all_over_ratings = await rating_reviews.find({ doctor_id: top_rated_doctor[i].user_id, status: 1 }).sort({ rr_id: -1 });
                for (let i = 0; i < all_over_ratings.length; i++) {
                    total_rating += all_over_ratings[i].stars
                }

                if (all_over_ratings.length > 0) {
                    all_over_rating = parseInt(total_rating) / parseInt(all_over_ratings.length)
                }
                let endorsement = await endorsed_modal.find({ endors_to: top_rated_doctor[i].user_id })
                const subscription_detail = await subscription_model.find({ doctor_id: top_rated_doctor[i].user_id, subscription_type: "custom plan" })
                let doctor_detail = {
                    doctor_list: top_rated,
                    qualification: qualification_detail,
                    services_detail: services_detail,
                    rating: all_over_rating.toFixed(1),
                    endorsement: endorsement.length,
                    subscription_type: subscription_detail.length > 0 ? "custom plan" : "doclink plan"
                }
                final_top_rated.push(doctor_detail)
                total_rating = 0
                all_over_rating = 0
            }

        }
        res.status(200).json({ msg: "success", response: final_top_rated, total: final_top_rated.length, all_over_doctor: all_over_doctor.length })
    } catch (error) {
        console.log(error);
    }
}












