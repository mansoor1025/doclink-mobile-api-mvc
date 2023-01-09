const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')
const lab_test_details = Schema({
    ltd_id: { type: Number },
    lbt_id: { type: Number },
    test_id: { type: Number },
    user_id: { type: Number },
    lab_id: { type: Number },
    lab_child_name: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String }
});

module.exports = mongoose.model('lab_test_details', lab_test_details);
