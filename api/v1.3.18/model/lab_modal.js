const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')
const labs = Schema({
    labs_id: { type: Number },
    name: { type: String },
    image: { type: String },
    about: { type: String },
    address: { type: String },
    test_type: { type: String },
    general_test_upto: { type: Number },
    subscriber_test_upto: { type: Number },
    home_visit_charges: { type: Number },
    notes: { type: String },
    code: { type: String },
    question: { type: String },
    answer: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String }
});

module.exports = mongoose.model('labs', labs);
