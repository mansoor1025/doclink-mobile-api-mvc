const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const popular_plan = Schema({
    pp_id: { type: Number },
    plan_id: { type: Number },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String, default: moment().format() },
    deleted_at: { type: String, default: moment().format() },
});

module.exports = mongoose.model('popular_plan', popular_plan);
