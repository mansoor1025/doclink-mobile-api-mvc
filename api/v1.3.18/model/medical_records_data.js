const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')
const medical_records_data = Schema({
    mrd_id: { type: Number },
    mr_id: { type: Number },
    user_id: { type: Number },
    file_path: { type: String },
    file_type: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String },
    deleted_at: { type: String }
});

module.exports = mongoose.model('medical_records_data', medical_records_data);
