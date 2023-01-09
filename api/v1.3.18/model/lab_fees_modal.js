const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const lab_fees = Schema({
    lf_id: { type: Number },
    lab_id: { type: Number },
    branch_id: { type: Number },
    subscription_type: { type: String },
    parent_id: { type: Number },
    child_id: { type: Number },
    parent_name: { type: String },
    child_name: { type: String },
    amount: { type: Number },
    discounted_amount: { type: Number },
    is_active: { type: Number, default: 1 },
    discount_per: { type: Number },
    commision_percentage: { type: Number },
    doclink_commision: { type: Number },
    after_discounted_amount: { type: Number },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String }
});

module.exports = mongoose.model('lab_fees', lab_fees);
