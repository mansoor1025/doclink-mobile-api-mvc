const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var moment = require('moment');
const subs_features = Schema({
    id: { type: Number },
    subs_id: { type: Number },
    feature_id: { type: Number },
    feature_name: { type: String },
    subscription_type: { type: String },
    limit: { type: Number },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
});

module.exports = mongoose.model('subs_features', subs_features);
