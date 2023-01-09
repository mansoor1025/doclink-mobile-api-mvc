const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var moment = require('moment');
const support_team = Schema({
    st_id: { type: Number },
    patient_id: { type: Number },
    doctor_id: { type: Number },
    patient_name: { type: String },
    doctor_name: { type: String },
    default_complain: { type: String, default: "pending" },
    ticket_no: { type: String },
    complain_status_id: { type: Number },
    module_name: { type: String },
    issue_type: { type: String },
    complain_status: { type: String, default: "pending" },
    st_member_id: { type: Number },
    comments: { type: String },
    is_active: { type: String, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String, default: moment().format() },
    deleted_at: { type: String, default: moment().format() }
});

module.exports = mongoose.model('support_team', support_team);
