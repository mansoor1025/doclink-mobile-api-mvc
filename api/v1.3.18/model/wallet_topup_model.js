const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const wallet_top_up = Schema({
    wallet_top_up_id:{ type: Number },
    user_id:{ type: Number },
    top_up_id: { type: Number },
    amount: { type: Number }, 
    is_active: { type: Number },
    created_at: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String },
  });
  
module.exports = mongoose.model('wallet_top_up', wallet_top_up);
