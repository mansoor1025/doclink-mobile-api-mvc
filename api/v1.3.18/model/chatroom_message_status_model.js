const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const chatroom_message_status = Schema({
    chatroom_message_status_id:{ type: Number },
    user_id: { type: Number },
    message_id: { type: Number },
    chatroom_id: { type: Number },
    chatroom_session_id: { type: Number },
    message_type: { type: String },
    status: { type: String },
    created_at: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String }
  });
  
  module.exports = mongoose.model('chatroom_message_status', chatroom_message_status);
