const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const Message = Schema({
    messageId: { type: Number, required: true },
    delivered: { type: Boolean, required: true },
    recieved: { type: Boolean, required: true },
    seen: { type: Boolean, required: true },
    body: { type: String, required: true },
    sender_id: { type: Number, required: true },
    receiver_id: { type: Number, required: true },
    message_type: { type: String, required: false },
    sub_message_type: { type: String, required: false },
    local_url: { type: String, required: false },
    delivered_upt: { type: String },
    seen_upt: { type: String },
    rec_upt: { type: String },
    chatroom_id: { type: Number, required: true },
    chatroom_session_id: { type: Number },
    app_user: { type: String },
    created_at: { type: String },
    updated_at: { type: String }
  });
  
  module.exports = mongoose.model('Message', Message);
