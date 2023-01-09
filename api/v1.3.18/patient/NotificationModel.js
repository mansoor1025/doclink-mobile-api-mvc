const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationModelSchema = Schema({
    user_id: { type: Number },
    fcm_token: { type: String },
    is_active: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('notifications', NotificationModelSchema);