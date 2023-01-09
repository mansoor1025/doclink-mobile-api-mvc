const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var moment = require('moment');
const type_records = Schema({
    tr_id: { type: Number },
    record_name: { type: String },
    record_image: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String },
    deleted_at: { type: String }
});

module.exports = mongoose.model('type_records', type_records);
