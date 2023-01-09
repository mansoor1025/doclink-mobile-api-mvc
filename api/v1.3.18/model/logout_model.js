const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')
const medical_record_files = Schema({
    medical_record_files_id: { type: Number },
    file_url: { type: String },
    file_type: { type: String },
    medical_record_id: { type: Number },
    created_at: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String }
});

module.exports = mongoose.model('medical_record_files', medical_record_files);
