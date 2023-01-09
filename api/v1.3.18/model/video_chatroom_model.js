const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');
const video_chatroom = Schema({
    vc_id: { type: Number },
    doctor_id: { type: Number },
    patient_id: { type: Number },
    chatroom_id: { type: Number },
    chatrequest_id: { type: Number },
    status: { type: String, default: "pending" },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String },
    deleted_at: { type: String }
});

module.exports = mongoose.model('video_chatroom', video_chatroom);
