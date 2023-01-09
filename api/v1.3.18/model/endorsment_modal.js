const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const endorsment = Schema({
    endorsment_id: { type: Number },
    endors_by_name: { type: String },
    endors_by_image: { type: String },
    endors_to_name: { type: String },
    endors_by: { type: Number },
    endors_to: { type: Number },
    comments: { type: String },
    generated_at: { type: String, default: moment().format('YYYY-MM-DD') },
    endors_status: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String },
    deleted_at: { type: String }
});

module.exports = mongoose.model('endorsment', endorsment);