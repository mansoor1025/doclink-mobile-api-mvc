const moment = require('moment');
const { body, query, validationResult } = require('express-validator');
const subscription_model = require('../model/subscription_model')
const user_subs_plan_model = require('../model/user_subs_plan_model')
const purchase_video_call = require('../model/purchase_video_call_model')
const video_packages_model = require('../model/video_packages_model');
const UserModel = require('../auth/UserModel');


exports.history_type = async (req, res, next) => {
    try {
        const type = ['subscription', 'buy_video_call'];
        return res.status(200).json({ msg: "success", response: type })
    } catch (error) {
        return res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.active_subscription = async (req, res, next) => {
    try {
        const over_all_history = [];
        const active_subs = [];
        const user_plan = await user_subs_plan_model.find({ patient_id: req.user.user_id, is_active: 1 });
        const history_subscription = await user_subs_plan_model.find({ patient_id: req.user.user_id }).sort({ created_at: -1 });
        const buy_video_call = await purchase_video_call.find({ patient_id: req.user.user_id })
        for (let i = 0; i < history_subscription.length; i++) {
            let history_subs_detail = await subscription_model.findOne({ subs_id: history_subscription[i].subs_id, subscription_type: history_subscription[i].subscription_type });
            const history_future_date = moment(history_subscription[i].created_at).add(history_subs_detail.month, 'months');
            console.log('doctor_id', history_subscription[i].doctor_id);
            const doctor_details = await UserModel.findOne({ user_id: history_subscription[i].doctor_id, role: 2 })
            console.log('history_subs_detail.final_amount', history_subs_detail.final_amount);
            console.log('doctor_details', doctor_details);
            console.log('doctor_details typeof', typeof (doctor_details));
            if (doctor_details !== null) {
                let history_subs = {
                    subscription_name: `${history_subs_detail.month} Month`,
                    subscription_type: history_subs_detail.subscription_type,
                    amount: history_subs_detail.final_amount,
                    doctor_name: doctor_details.name,
                    doctor_id: doctor_details.user_id,
                    history_type: "subscription",
                    subs_id: history_subs_detail.subs_id,
                    time_period: `${history_subs_detail.month} Month`,
                    purchased_on: history_subscription[i].created_at,
                    is_active: history_subs_detail.is_active,
                    expire_on: history_future_date
                }
                over_all_history.push(history_subs)
            }
        }

        for (let i = 0; i < user_plan.length; i++) {
            const subscription_detail = await subscription_model.findOne({ subs_id: user_plan[i].subs_id, subscription_type: user_plan[i].subscription_type });
            const future_date = moment(user_plan[i].created_at).add(subscription_detail.month, 'months');
            const doctor_details = await UserModel.findOne({ user_id: user_plan[i].doctor_id, role: 2 })
            if (doctor_details !== null) {
                let active_subscription = {
                    subscription_name: `${subscription_detail.month} Month`,
                    subscription_type: subscription_detail.subscription_type,
                    amount: subscription_detail.final_amount,
                    doctor_name: doctor_details.name,
                    doctor_id: user_plan[i].doctor_id,
                    history_type: "subscription",
                    subs_id: subscription_detail.subs_id,
                    time_period: `${subscription_detail.month} Month`,
                    purchased_on: user_plan[i].created_at,
                    is_active: subscription_detail.is_active,
                    expire_on: future_date
                }
                active_subs.push(active_subscription)
            }

        }

        for (let i = 0; i < buy_video_call.length; i++) {
            const video_packages = await video_packages_model.findOne({ vp_id: buy_video_call[i].package_id });
            const doctor_details = await UserModel.findOne({ user_id: buy_video_call[i].doctor_id, role: 2, is_active: 1 })
            const patient_details = await UserModel.findOne({ user_id: buy_video_call[i].patient_id, role: 1, is_active: 1 })
            let buy_videocall_history = {
                video_name: video_packages.package_name,
                package_id: buy_video_call[i].package_id,
                patient_name: patient_details.name,
                doctor_name: doctor_details.name,
                doctor_id: doctor_details.user_id,
                discount: video_packages.discount,
                created_at: buy_video_call[i].created_at,
                amount: video_packages.net_amount,
                paid_from: buy_video_call[i].payment_via,
                history_type: 'buy_video_call'
            }
            over_all_history.push(buy_videocall_history)
        }
        return res.status(200).json({ msg: "success", active_subscription: active_subs, history: over_all_history })
    } catch (error) {
        res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.history_by_id = async (req, res, next) => {
    try {
        // validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        console.log('patient wallet hsitory by id');
        console.log(req.query);
        const history_type = req.query.history_type;
        const history_id = req.query.history_id;
        const subscription_type = req.query.subscription_type;
        let history_obj = {}
        if (history_type == 'subscription') {
            const user_plan = await user_subs_plan_model.findOne({ patient_id: req.user.user_id, subs_id: history_id, subscription_type: subscription_type, doctor_id: req.query.doctor_id });
            let history_subs_detail = await subscription_model.findOne({ subs_id: history_id, subscription_type: subscription_type, is_active: 1 });
            let history_future_date = moment(user_plan.created_at).add(history_subs_detail.month, 'months');
            let doctor_details = await UserModel.findOne({ user_id: user_plan.doctor_id, role: 2 })
            console.log('history_future_date', history_future_date);
            history_obj = {
                subscription_name: `${history_subs_detail.month} Month`,
                subscription_type: history_subs_detail.subscription_type,
                amount: history_subs_detail.final_amount,
                doctor_name: doctor_details.name,
                history_type: "subscription",
                payment_type: user_plan.payment_type,
                is_active: history_subs_detail.is_active,
                time_period: `${history_subs_detail.month} Month`,
                purchased_on: user_plan.created_at,
                expire_on: history_future_date
            }
        }

        if (history_type == 'buy_video_call') {
            const buy_video_call = await purchase_video_call.findOne({ patient_id: req.user.user_id, package_id: history_id, doctor_id: req.query.doctor_id })
            const video_packages = await video_packages_model.findOne({ vp_id: history_id });
            const doctor_details = await UserModel.findOne({ user_id: buy_video_call.doctor_id, role: 2 })
            const patient_details = await UserModel.findOne({ user_id: buy_video_call.patient_id, role: 1, is_active: 1 })
            history_obj = {
                video_name: video_packages.package_name,
                package_id: video_packages.vp_id,
                doctor_name: doctor_details.name,
                patient_name: patient_details.name,
                discount: video_packages.discount,
                created_at: buy_video_call.created_at,
                amount: video_packages.net_amount,
                paid_from: buy_video_call.payment_via,
                history_type: 'buy_video_call'
            }
        }
        return res.status(200).json({ msg: "success", response: history_obj })
    } catch (error) {
        res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}


