const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const notification_settings = Schema({
    notification_settings_id:{ type: Number },
    user_id:{ type: Number },
    notification_key:{ type: String },
    patient_id:{ type: Number },
    doctor_id:{ type: Number},
    created_at: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String }
  });
  
  module.exports = mongoose.model('notification_settings', notification_settings);
