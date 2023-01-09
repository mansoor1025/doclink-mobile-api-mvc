const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const reschedule_chat = Schema({
    rc_id: { type: Number },
    patient_id: { type: Number },
    doctor_id: { type: Number },
    patient_name: { type: String },
    five_min_reminder_status: { type: Number, default: 1 },
    doctor_name: { type: String },
    chatroom_id: { type: Number },
    chatroom_session_id: { type: Number },
    chatrequest_id: { type: Number },
    requested_date: { type: String },
    requested_time: { type: String },
    notification_time: { type: String },
    status: { type: String },
    is_active: { type: Number, default: 1 },
    support_team_status: { type: Number },
    reason: { type: String },
    reschedule_status: { type: String, default: "pending" },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String },
    deleted_at: { type: String }
});

module.exports = mongoose.model('reschedule_chat', reschedule_chat);
