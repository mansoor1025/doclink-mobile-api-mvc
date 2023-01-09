const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')
const medical_records = Schema({
    mr_id: { type: Number },
    user_id: { type: Number },
    tr_id: { type: Number },
    record_for: { type: String },
    record_name: { type: String },
    record_date: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: Number, default: 0 },
    deleted_at: { type: String }
});

module.exports = mongoose.model('medical_records', medical_records);
