const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');
const user_subs_plan = Schema({
    usp_id: { type: Number },
    patient_id: { type: Number },
    doctor_id: { type: Number },
    subs_id: { type: Number },
    payment_via: { type: String },
    plan_name: { type: String },
    email: { type: String },
    plan_expiry_date: { type: String },
    payment_type: { type: String },
    availed_video_call: { type: Number, default: 0 },
    buy_availed_video_call: { type: Number, default: 0 },
    availed_intro_session: { type: Number, default: 0 },
    availed_voice_note: { type: Number, default: 0 },
    availed_session: { type: Number, default: 0 },
    availed_images: { type: Number, default: 0 },
    subscription_type: { type: String },
    is_active: { type: Number, default: 1 },
    generated_at: { type: String, default: moment().format('YYYY-MM-DD') },
    created_at: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String },
});

module.exports = mongoose.model('user_subs_plan', user_subs_plan);
