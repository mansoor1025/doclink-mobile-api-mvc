const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const doctor_transaction = Schema({
    dt_id: { type: Number },
    patient_id: { type: Number },
    doctor_id: { type: Number },
    chatroom_id: { type: Number },
    amount: { type: Number },
    payment_via: { type: String },
    transaction_type: { type: String },
    package_id: { type: Number },
    doclink_commission: { type: Number },
    deduction_doclink_amount: { type: Number },
    net_amount: { type: Number },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String },
    deleted_at: { type: String }
});

module.exports = mongoose.model('doctor_transaction', doctor_transaction);