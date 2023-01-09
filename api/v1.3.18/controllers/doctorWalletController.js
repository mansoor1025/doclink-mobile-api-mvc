const moment = require('moment');
const { body, query, validationResult } = require('express-validator');
const subscription_model = require('../model/subscription_model')
const user_subs_plan_model = require('../model/user_subs_plan_model')
const purchase_video_call = require('../model/purchase_video_call_model')
const video_packages_model = require('../model/video_packages_model');
const UserModel = require('../auth/UserModel');
const doctor_transaction_model = require('../model/doctor_transaction_model')

exports.earnings = async (req, res, next) => {
    try {
        const available_credit = await doctor_transaction_model.aggregate([
            { $match: { doctor_id: req.user.user_id } },
            {
                $group: {
                    _id: "$doctor_id",
                    total: { $sum: "$net_amount" }
                }
            }
        ])
        const over_all_history = [];
        const buy_video_call = await purchase_video_call.find({ doctor_id: req.user.user_id })
        const history_subscription = await user_subs_plan_model.find({ doctor_id: req.user.user_id }).sort({ created_at: -1 });

        for (let i = 0; i < history_subscription.length; i++) {
            let history_subs_detail = await subscription_model.findOne({ subs_id: history_subscription[i].subs_id, subscription_type: history_subscription[i].subscription_type, is_active: 1 });
            console.log('******************');
            console.log(history_subs_detail);
            console.log('&&&&&&&&&&&& amount', history_subs_detail.final_amount);
            const history_future_date = moment(history_subscription[i].created_at).add(history_subs_detail.month, 'months');
            const doctor_details = await UserModel.findOne({ user_id: history_subscription[i].doctor_id, role: 2 })
            let history_subs = {
                subscription_name: `${history_subs_detail.month} Month`,
                subscription_type: history_subs_detail.subscription_type,
                amount: history_subs_detail.final_amount,
                doctor_name: doctor_details.name,
                patient_id: history_subscription[i].patient_id,
                history_type: "subscription",
                subs_id: history_subs_detail.subs_id,
                time_period: `${history_subs_detail.month} Month`,
                purchased_on: history_subscription[i].created_at,
                is_active: history_subs_detail.is_active,
                expire_on: history_future_date
            }
            over_all_history.push(history_subs)
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
                discount: video_packages.discount,
                created_at: buy_video_call[i].created_at,
                amount: video_packages.net_amount,
                paid_from: buy_video_call[i].payment_via,
                history_type: 'buy_video_call'
            }
            over_all_history.push(buy_videocall_history)
        }
        console.log('**************');
        console.log(over_all_history);
        let data = {
            over_all_history: over_all_history,
            available_credit: available_credit
        }
        return res.status(200).json({ msg: "success", response: data })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: error, response: error.message })

    }
}

exports.history_by_id = async (req, res, next) => {
    try {
        // validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const history_type = req.query.history_type;
        const history_id = req.query.history_id;
        const subscription_type = req.query.subscription_type;
        let history_obj = {}
        if (history_type == 'subscription') {
            const user_plan = await user_subs_plan_model.findOne({ doctor_id: req.user.user_id, subs_id: history_id, patient_id: req.query.patient_id });
            let history_subs_detail = await subscription_model.findOne({ subs_id: history_id, subscription_type: subscription_type });
            console.log('history_subs_detail.month', history_subs_detail.month);
            let history_future_date = moment(user_plan.created_at).add(history_subs_detail.month, 'months');
            console.log('history_future_date', history_future_date);
            let doctor_details = await UserModel.findOne({ user_id: user_plan.doctor_id, role: 2 })
            let patient_details = await UserModel.findOne({ user_id: req.query.patient_id, role: 1 })
            const doclink_commission = 30;
            const deduction_doclink_amount = parseInt(history_subs_detail.final_amount) / 100 * parseInt(doclink_commission);
            const net_amount = parseInt(history_subs_detail.final_amount) - parseInt(deduction_doclink_amount)
            history_obj = {
                subscription_name: `${history_subs_detail.month} Month`,
                subscription_type: history_subs_detail.subscription_type,
                amount: history_subs_detail.final_amount,
                doctor_name: doctor_details.name,
                patient_name: patient_details.name,
                history_type: "subscription",
                payment_type: user_plan.payment_type,
                is_active: history_subs_detail.is_active,
                time_period: `${history_subs_detail.month} Month`,
                purchased_on: user_plan.created_at,
                expire_on: history_future_date,
                doclink_commission: doclink_commission,
                deduction_doclink_amount: Math.floor(deduction_doclink_amount),
                net_amount: net_amount
            }
        }

        if (history_type == 'buy_video_call') {
            const buy_video_call = await purchase_video_call.findOne({ doctor_id: req.user.user_id, package_id: history_id })
            const video_packages = await video_packages_model.findOne({ vp_id: history_id });
            const doctor_details = await UserModel.findOne({ user_id: buy_video_call.doctor_id, role: 2 })
            const patient_details = await UserModel.findOne({ user_id: buy_video_call.patient_id, role: 1, is_active: 1 })
            const doclink_commission = 30;
            const deduction_doclink_amount = parseInt(video_packages.net_amount) / 100 * parseInt(doclink_commission);
            const net_amount = parseInt(video_packages.net_amount) - parseInt(deduction_doclink_amount)
            history_obj = {
                video_name: video_packages.package_name,
                package_id: video_packages.vp_id,
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


exports.payout = async (req, res, next) => {
    try {
        const available_credit = await doctor_transaction_model.aggregate([
            { $match: { doctor_id: req.user.user_id } },
            {
                $group: {
                    _id: "$doctor_id",
                    total: { $sum: "$net_amount" }
                }
            }
        ])
        return res.status(200).json({ msg: "success", response: available_credit })
    } catch (error) {
        return res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.history_type = async (req, res, next) => {
    try {
        const type = ['subscription', 'buy_video_call'];
        return res.status(200).json({ msg: "success", response: type })
    } catch (error) {
        return res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}


