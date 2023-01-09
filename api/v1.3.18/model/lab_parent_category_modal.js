const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const lab_parent_category = Schema({
    lpc_id: { type: Number },
    parent_name: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String }
});

module.exports = mongoose.model('lab_parent_category', lab_parent_category);

