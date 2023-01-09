const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')
const lab_test_booking = Schema({
    ltb_id: { type: Number },
    lab_id: { type: Number },
    total_amount: { type: Number },
    user_id: { type: Number },
    patient_name: { type: String },
    age: { type: Number },
    phone_number: { type: String },
    prescription: { type: String },
    branch_id: { type: Number },
    branch_name: { type: String },
    collection_date: { type: String },
    lab_visit: { type: Number },
    home_visit: { type: Number },
    home_visit_charges: { type: Number },
    address: { type: String },
    description: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String }
});

module.exports = mongoose.model('lab_test_booking', lab_test_booking);
