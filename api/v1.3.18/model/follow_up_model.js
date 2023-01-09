const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const follow_up = Schema({
    follow_up_id:{ type: Number },
    chatroom_session_id:{ type: Number},
    is_on:{ type: Number},
    is_active:{ type: Number},
    doctor_id:{ type: Number },
    patient_id: { type: Number },
    follow_up_at: { type: String },
    comment: { type: String },
    year: { type: Number },
    time:{ type: String },
    month: { type: Number },
    date: { type: Number },
    created_at: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String }
  });
  
  module.exports = mongoose.model('follow_up', follow_up);
