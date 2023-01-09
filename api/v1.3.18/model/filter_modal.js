const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')

const filter_schema = Schema({
    filter_id: { type: Number }, 
    screen_id: { type: Number },
    filter_name: { type: String },
    is_active: { type: Number, default: 1 },
    createdAt: { type: String, default: moment().format() }
});

module.exports = mongoose.model('search_filter', filter_schema);
