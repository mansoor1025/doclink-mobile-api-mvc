
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')

const doctor_days_time = Schema({
    ddt_id: { type: Number },
    doctor_id: { type: Number },
    days: { type: String },
    hospital: { type: String },
    address: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    deleted_at: { type: String },
    updated_at: { type: String }
});

module.exports = mongoose.model('doctor_days_time', doctor_days_time);
