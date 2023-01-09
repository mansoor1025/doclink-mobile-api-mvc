const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const lab_child_category = Schema({
    lcc_id: { type: Number },
    parent_id: { type: Number },
    child_name: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String }
});

module.exports = mongoose.model('lab_child_category', lab_child_category);
