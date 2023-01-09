const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const purchase_video_call = Schema({
    pvc_id: { type: Number },
    package_id: { type: Number },
    chatroom_id: { type: Number },
    doctor_id: { type: Number },
    subs_id: { type: Number },
    subscription_type: { type: String },
    patient_id: { type: Number },
    payment_via: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String },
    deleted_at: { type: String }
});

module.exports = mongoose.model('purchase_video_call', purchase_video_call);
