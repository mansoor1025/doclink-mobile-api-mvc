const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;
const subscription = Schema({
    subs_id: { type: Number },
    name: { type: String },
    month: { type: Number },
    amount: { type: Number },
    discount_per: { type: Number },
    discounted_amount: { type: Number },
    doctor_id: { type: Number },
    specialization_id: { type: Number },
    final_amount: { type: Number },
    details: { type: String },
    subscription_type: { type: String },
    is_active: { type: Number, default: 1 },
    auto_renewal: { type: Number },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String },
    deleted_at: { type: String }
});

module.exports = mongoose.model('subscription', subscription);
