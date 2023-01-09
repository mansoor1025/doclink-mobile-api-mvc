const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const chatroom_messages = Schema({
    chatroom_messages_id:{ type: Number },
    _id: { type: Number },
    body: { type: String },
    sender_id: { type: Number },
    receiver_id: { type: String },
    message_type: { type: String },
    sub_message_type: { type: String },
    chatroom_id: { type: Number },
    chatroom_session_id: { type: Number },
    reply_id: { type: Number },
    created_at: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String },
  });
  
  module.exports = mongoose.model('chatroom_messages', chatroom_messages);
