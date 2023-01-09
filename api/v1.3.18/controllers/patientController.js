const UserModel = require("../auth/UserModel");
const specializations_model = require('../model/specializations_model')
const banner_modal = require('../model/banner_modal')
const qualification_model = require('../model/doctor_qualification_model')
const services_model = require('../model/doctor_services_model')
const rating_reviews = require('../model/rating_reviews_model');
const endorsed_modal = require('../model/endorsment_modal')
import chatrooms_model from '../model/chatrooms_model';
import chatroom_sessions_model from '../model/chatroom_sessions_model';
import medication_model from '../model/medications_model';
import medication_details_model from '../model/medication_details_model';
import chatrequest_model from '../model/chatrequests';
import patient_diagnostic_tests_model from '../model/patient_diagnostic_tests_model'
import follow_up_model from '../model/follow_up_model'
const search_filter = require('../model/filter_modal')
const user_subs_plan_model = require('../model/user_subs_plan_model')
const subscription_model = require('../model/subscription_model')
const purchase_video_call = require('../model/purchase_video_call_model')
const video_packages_model = require('../model/video_packages_model');
// Controller - Authentication
var moment = require('moment');
const { body, query, validationResult } = require('express-validator');


exports.prescribed_medicine = async (req, res, next) => {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        console.log('================');
        console.log(req.query);
        // Getting body params
        var chatroom_session_id = req.query.chatroom_session_id ? req.query.chatroom_session_id : "";
        let chatroom_id = req.query.chatroom_id;
        let chatrequest_detail = await chatrequest_model.findOne({ chatroom_id: chatroom_id }).limit(1).sort({ chatRequestId: -1 })
        const last_chief_complain = chatrequest_detail.chiefComplaint[0].des;

        var params = {
            'chatroom_session_id': chatroom_session_id,
        }

        let medication_id = [];

        let chat_ses_detail = await chatroom_sessions_model.findOne({ sessionId: chatroom_session_id });
        let chatroom_detail = await chatrooms_model.findOne({ chatroom_id: chatroom_id });
        console.log('patient_id' + chatroom_detail.patient_id);
        console.log('doctor_id' + chatroom_detail.doctor_id);
        let medication = await medication_model.find({ chatroom_session_id: chatroom_session_id, patient_id: chatroom_detail.patient_id, doctor_id: chatroom_detail.doctor_id });

        if (medication.length > 0) {
            for (let i = 0; i < medication.length; i++) {
                medication_id.push(medication[i].medication_id);
            }
        }
        let medication_detail = await medication_details_model.find({ chatroom_id: chatroom_id, chatroom_session_id: chatroom_session_id });
        let data = {}
        data['prescribe_medicines'] = medication_detail;
        data['diagnosic_tests'] = await patient_diagnostic_tests_model.find({ chatroom_session_id: chatroom_session_id })
        data['follow_ups'] = await follow_up_model.find({ chatroom_session_id: chatroom_session_id });
        data['last_chief_complain'] = last_chief_complain
        data['additional_comments'] = medication
        return res.status(200).json({
            msg: 'success', response: data, total: medication_detail.length,
        });
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
}

exports.patient_home_screen = async (req, res, next) => {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let data = {};
        const top_rated_doctor = await UserModel.find({ is_verified: 1, is_number_verified: 1, is_active: 1 })
        const banner_detail = await banner_modal.find({ screen_id: 12, is_active: 1 })
        const specialization = await specializations_model.find({ is_active: 1 })

        let final_top_rated = []
        let total_rating = 0;
        let all_over_rating = 0;
        for (let i = 0; i < top_rated_doctor.length; i++) {
            let top_rated = await UserModel.find({ role: 2, is_verified: 1, is_active: 1, is_number_verified: 1, user_id: top_rated_doctor[i].user_id })
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
            let doctor_detail = {
                doctor_list: top_rated,
                qualification: qualification_detail,
                services_detail: services_detail,
                rating: all_over_rating.toFixed(1),
                endorsement: endorsement.length,
            }
            final_top_rated.push(doctor_detail)
            total_rating = 0;
            all_over_rating = 0;
        }
        data['banner'] = banner_detail
        data['specialization'] = specialization
        data['top_rated_doctor'] = final_top_rated

        return res.status(200).json({
            msg: 'success', response: data
        });

    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
}

exports.closing_notes_view = async (req, res, next) => {
    try {
        console.log('closing_notes_view is running');
        console.log(req.body);
        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let chatroom_session_id = req.query.chatroom_session_id

        var params = {
            'chatroom_session_id': chatroom_session_id,
        }
        console.log('****************' + chatroom_session_id);
        let medication_id = [];
        let chatroom_session = await chatroom_sessions_model.findOne({ sessionId: chatroom_session_id });

        let medication = await medication_model.find({ chatroom_session_id: chatroom_session_id });
        console.log('================');
        console.log(medication);
        if (medication.length > 0) {
            for (let i = 0; i < medication.length; i++) {
                medication_id.push(medication[i].medication_id);
            }
        }
        let medication_detail = await medication_details_model.find({ medication_id: { $in: medication_id } });
        let data = {}
        data['medications'] = medication;
        data['prescribe_medicines'] = medication_detail;
        data['diagnosic_tests'] = await patient_diagnostic_tests_model.find({ chatroom_session_id: chatroom_session_id })
        data['follow_ups'] = await follow_up_model.find({ chatroom_session_id: chatroom_session_id });
        console.log(data);
        return res.status(200).json({
            msg: 'success', response: data
        });
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
}

exports.search_filter_patient = async (req, res, next) => {
    try {
        const subscribed = req.query.subscribed;
        const video_booking = req.query.video_booking;
        const clinic_booking = req.query.clinic_booking;
        const current_plan = req.query.current_plan;
        const expired_plan = req.query.expired_plan;
        let data = '';
        if (subscribed == 'subscribed') {
            console.log('subscribed condition');
            data = await user_subs_plan_model.find({ doctor_id: req.user.user_id }).distinct('patient_id')
        }

        if (video_booking != '') {

        }

        if (clinic_booking != '') {

        }

        if (current_plan == 'current_plan') {
            data = await user_subs_plan_model.find({ doctor_id: req.user.user_id, is_active: 1 }).distinct('patient_id')
        }

        if (expired_plan == 'expired_plan') {
            data = await user_subs_plan_model.find({ doctor_id: req.user.user_id, is_active: { $nin: 1 } }).distinct('patient_id');
        }

        console.log('data', data);
        const patient = await UserModel.find({ user_id: { $in: data }, is_active: 1 })
        return res.status(200).json({
            msg: 'success', response: patient
        });
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
}

exports.my_patient_filters = async (req, res, next) => {
    try {
        const { page = 1, limit = 5 } = req.query;
        const patient_id = await chatrooms_model.find({ doctor_id: req.user.user_id }).distinct('patient_id');
        const all_over_patient = await UserModel.find({ user_id: { $in: patient_id }, is_active: 1 });
        const all_patients = await UserModel.find({ user_id: { $in: patient_id }, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
        const filters = await search_filter.find({ screen_id: 13 });
        return res.status(200).json({
            msg: 'success', filters: filters, patients: all_patients, total: all_patients.length, all_over_patient: all_over_patient.length
        });
    }
    catch (error) {
        console.log(error);
        res.send(error.message);
    }
}

exports.patient_view_details = async (req, res, next) => {
    try {
        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const over_all_history = [];
        const patient_id = req.query.patient_id;
        console.log('patient_id', patient_id);
        const history_subscription = await user_subs_plan_model.find({ patient_id: patient_id, doctor_id: req.user.user_id, is_active: 1 }).sort({ created_at: -1 });
        const buy_video_call = await purchase_video_call.find({ patient_id: patient_id, doctor_id: req.user.user_id })
        for (let i = 0; i < history_subscription.length; i++) {
            let history_subs_detail = await subscription_model.findOne({ subs_id: history_subscription[i].subs_id, subscription_type: history_subscription[i].subscription_type });
            const history_future_date = moment(history_subscription[i].created_at).add(history_subs_detail.month, 'months');
            const doctor_details = await UserModel.findOne({ user_id: history_subscription[i].doctor_id, role: 2, is_active: 1 })
            const patient_details = await UserModel.findOne({ user_id: history_subscription[i].patient_id, role: 1, is_active: 1 })
            let history_subs = {
                subscription_name: history_subs_detail.details,
                subscription_type: history_subs_detail.subscription_type,
                amount: history_subs_detail.amount,
                doctor_name: doctor_details.name,
                patient_name: patient_details.name,
                history_type: "subscription",
                subs_id: history_subs_detail.subs_id,
                time_period: `${history_subs_detail.month} Month`,
                purchased_on: history_subscription[i].created_at,
                expire_on: history_future_date
            }
            over_all_history.push(history_subs)
        }

        for (let i = 0; i < buy_video_call.length; i++) {
            const video_packages = await video_packages_model.findOne({ vp_id: buy_video_call[i].package_id });
            const doctor_details = await UserModel.findOne({ user_id: buy_video_call[i].doctor_id, role: 2 })
            const patient_details = await UserModel.findOne({ user_id: buy_video_call[i].patient_id, role: 1, is_active: 1 })
            let buy_videocall_history = {
                video_name: video_packages.package_name,
                doctor_name: doctor_details.name,
                patient_name: patient_details.name,
                discount: video_packages.discount,
                created_at: buy_video_call[i].created_at,
                package_id: buy_video_call[i].package_id,
                amount: video_packages.net_amount,
                paid_from: buy_video_call[i].payment_via,
                history_type: 'buy_video_call'
            }
            over_all_history.push(buy_videocall_history)
        }

        const filters = await search_filter.find({ screen_id: 13 });
        return res.status(200).json({
            msg: 'success', over_all_history: over_all_history
        });
    }
    catch (error) {
        console.log(error);
        res.send(error.message);
    }
}

exports.history_by_id = async (req, res, next) => {
    try {
        // validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        console.log('************************');
        console.log(req.query);
        const history_type = req.query.history_type;
        const subscription_type = req.query.subscription_type;
        const history_id = req.query.history_id;
        const patient_id = req.query.patient_id;
        let history_obj = {}
        if (history_type == 'subscription') {
            let user_sub_details = await user_subs_plan_model.findOne({ subs_id: history_id, subscription_type: subscription_type, is_active: 1, patient_id: req.query.patient_id, doctor_id: req.user.user_id })
            let history_subs_detail = await subscription_model.findOne({ subs_id: history_id, subscription_type: subscription_type });
            let history_future_date = moment(user_sub_details.created_at).add(history_subs_detail.month, 'months');
            const user_plan = await user_subs_plan_model.findOne({ doctor_id: req.user.user_id, patient_id: patient_id, subs_id: history_id });
            let doctor_details = await UserModel.findOne({ user_id: user_plan.doctor_id, role: 2 })
            let patient_details = await UserModel.findOne({ user_id: user_plan.patient_id, role: 1 })
            const doclink_commission = 30;
            const deduction_doclink_amount = parseInt(history_subs_detail.final_amount) / 100 * parseInt(doclink_commission);
            const net_amount = parseInt(history_subs_detail.final_amount) - parseInt(deduction_doclink_amount)
            console.log('history_future_date', history_future_date);
            history_obj = {
                subscription_name: `${history_subs_detail.month} Month`,
                subscription_type: history_subs_detail.subscription_type,
                amount: history_subs_detail.final_amount,
                doctor_name: doctor_details.name,
                patient_name: patient_details.name,
                history_type: "subscription",
                time_period: `${history_subs_detail.month} Month`,
                purchased_on: user_sub_details.created_at,
                is_active: history_subs_detail.is_active,
                expire_on: history_future_date,
                doclink_commission: doclink_commission,
                deduction_doclink_amount: Math.floor(deduction_doclink_amount),
                net_amount: net_amount
            }
        }

        if (history_type == 'buy_video_call') {
            const buy_video_call = await purchase_video_call.findOne({ patient_id: patient_id, doctor_id: req.user.user_id, package_id: history_id })
            const video_packages = await video_packages_model.findOne({ vp_id: history_id });
            const doctor_details = await UserModel.findOne({ user_id: buy_video_call.doctor_id, role: 2 })
            const patient_details = await UserModel.findOne({ user_id: buy_video_call.patient_id, role: 1, is_active: 1 })
            const doclink_commission = 30;
            const deduction_doclink_amount = parseInt(video_packages.net_amount) / 100 * parseInt(doclink_commission);
            const net_amount = parseInt(video_packages.net_amount) - parseInt(deduction_doclink_amount)
            history_obj = {
                video_name: video_packages.package_name,
                doctor_name: doctor_details.name,
                patient_name: patient_details.name,
                discount: video_packages.discount,
                created_at: buy_video_call.created_at,
                amount: video_packages.net_amount,
                paid_from: buy_video_call.payment_via,
                history_type: 'buy_video_call',
                doclink_commission: doclink_commission,
                deduction_doclink_amount: Math.floor(deduction_doclink_amount),
                net_amount: net_amount
            }
        }
        return res.status(200).json({ msg: "success", response: history_obj })
    } catch (error) {
        res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}











