const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const doctor_disease = Schema({
    dd_id: { type: Number },
    doctor_id: { type: Number },
    disease_id: { type: Number },
    disease_name: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String },
    deleted_at: { type: String }
});

module.exports = mongoose.model('doctor_disease', doctor_disease);