const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const doctor_services = Schema({
    service_id: { type: Number },
    doctor_id: { type: Number },
    service_name: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String },
    deleted_at: { type: String }
});

module.exports = mongoose.model('doctor_services', doctor_services);