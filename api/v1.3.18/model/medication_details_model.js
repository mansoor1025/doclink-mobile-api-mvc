const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const medication_details = Schema({
    medication_details_id:{ type: Number },
    medication_id:{ type: Number },
    chatroom_id:{ type: Number },
    chatroom_session_id:{ type: Number },
    medicine_name:{ type: String },
    is_on:{ type: Number },
    days:{ type: Number},
    morning:{ type: String},
    afternoon:{ type: String },
    evening: { type: String },
    is_active: { type: Number },
    comment: { type: String },
    created_at: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String }
  });
  
  module.exports = mongoose.model('medication_details', medication_details);
