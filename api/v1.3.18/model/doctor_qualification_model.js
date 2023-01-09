const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const doctor_qualification = Schema({
    qualification_id: { type: Number },
    doctor_id: { type: Number },
    qualification_name: { type: String },
    university_name: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String },
    deleted_at: { type: String }
});

module.exports = mongoose.model('doctor_qualification', doctor_qualification);