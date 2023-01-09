const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')

const banner_schema = Schema({
    banner_id: { type: Number }, 
    screen_id: { type: Number },
    banner_image: { type: String },
    is_active: { type: Number, default: 1 },
    createdAt: { type: String, default: moment().format() }
});

module.exports = mongoose.model('banner', banner_schema);
