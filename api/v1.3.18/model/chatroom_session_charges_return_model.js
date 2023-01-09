const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const chatroom_session_charges_return = Schema({
    cscr_id:{ type: Number },
    chatroom_session_id: { type: Number },
    amount: { type: Number },
    created_at: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String }
  });
  
  module.exports = mongoose.model('chatroom_session_charges_return', chatroom_session_charges_return);
