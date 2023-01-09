const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const user_notification_settings = Schema({
    id:{ type: Number },
    user_id: { type: Number },
    reference_key: { type: String },
    reference_id: { type: String },
    reference_value: { type: String },
    parent_id: { type: Number },
    created_at: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String }, 
  });
  
module.exports = mongoose.model('user_notification_settings', user_notification_settings);
