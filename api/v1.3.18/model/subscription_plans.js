const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var moment = require('moment');
const subscription_plans = Schema({
    sp_id: { type: Number },
    subs_id: { type: Number },
    chat_session: { type: String, default: "null" },
    voice_session: { type: String, default: "null" },
    video_session: { type: String, default: "null" },
    chat_session_per_day: { type: String, default: "null" },
    voice_session_per_day: { type: String, default: "null" },
    video_session_per_day: { type: String, default: "null" },
    voice_time_limit: { type: String, default: "null" },
    prescription: { type: String, default: "unlimited" },
    medicine_alarms: { type: String, default: "unlimited" },
    follow_up_early_alarm: { type: String, default: "unlimited" },
    notes: { type: String, default: "unlimited" },
    medical_records: { type: String, default: "unlimited" },
    dr_review_history: { type: String, default: "unlimited" },
    dr_rating: { type: String, default: "unlimited" },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String, default: moment().format() },
    deleted_at: { type: String, default: moment().format() }
});

module.exports = mongoose.model('subscription_plans', subscription_plans);
