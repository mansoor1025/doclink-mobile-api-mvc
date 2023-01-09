const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const chatrooms = Schema({
    doctor_id:{ type: Number },
    patient_id: { type: Number },
    is_active: { type: Boolean },
    chatroom_id: { type: Number },
    created_at: { type: String },
    updated_at: { type: String }
  });
  
  module.exports = mongoose.model('chatrooms', chatrooms);
