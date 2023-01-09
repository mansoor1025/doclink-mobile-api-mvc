const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const branch_lab = Schema({
    branch_id: { type: Number },
    lab_id: { type: Number },
    name: { type: String },
    lng: { type: String },
    lat: { type: String },
    address: { type: String },
    opening_hours: { type: String },
    closing_hours: { type: String },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String }
});

module.exports = mongoose.model('branch_lab', branch_lab);
