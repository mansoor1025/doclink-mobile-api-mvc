const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')
const disease = Schema({
    disease_id: { type: Number },
    name: { type: String },
    disease_image: { type: String },
    is_active: { type: String, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String },
    deleted_at: { type: String }
});

module.exports = mongoose.model('disease', disease);
