const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;
const store_voice_otp = Schema({ 
    store_voice_otp_id: { type: Number },
    user_id: { type: Number },
    mobile_number: { type: String },
    code: { type: Number },
    raw_response:{ type: String },
    created_at: { type: String},
    updated_at: { type: String},
    deleted_at: { type: String}
  });
  
  module.exports = mongoose.model('store_voice_otp', store_voice_otp);
