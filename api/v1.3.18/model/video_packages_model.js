


const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')
const video_packages = Schema({
    vp_id: { type: Number },
    package_name: { type: String },
    package_amount: { type: Number },
    limit: { type: Number },
    discount: { type: Number },
    description: { type: String },
    title: { type: String },
    net_amount: { type: Number },
    is_active: { type: Number, default: 1 },
    popular: { type: Number },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String },
    deleted_at: { type: String }
});

module.exports = mongoose.model('video_packages', video_packages);

