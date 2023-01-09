const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')

const screen_schema = Schema({
    screen_id: { type: Number },
    screen_name: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
}, { timestamps: true });


module.exports = mongoose.model('screens', screen_schema);