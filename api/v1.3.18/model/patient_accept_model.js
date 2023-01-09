const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')
const patient_accept_model = Schema({
    pa_id: { type: Number },
    chatrequest_id: { type: Number },
    chatroom_id: { type: Number },
    chatroom_session_id: { type: Number },
    reschedule_id: { type: Number },
    doctor_id: { type: Number },
    patient_id: { type: Number },
    requested_date: { type: String },
    requested_time: { type: String },
    notification_time: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    accept_notification_time: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String }
});

module.exports = mongoose.model('patient_accept_model', patient_accept_model);
