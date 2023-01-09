
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')

const doctor_timeslots = Schema({
    dt_id: { type: Number },
    doctor_id: { type: Number },
    ddt_id: { type: Number },
    time_1: { type: String },
    time_2: { type: String },
    real_time_1: { type: String },
    real_time_2: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    deleted_at: { type: String },
    updated_at: { type: String }
});

module.exports = mongoose.model('doctor_timeslots', doctor_timeslots);
