const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const topup_type = Schema({
    topup_type_id:{ type: Number },
    name: { type: String },
    is_active: { type: Number },
    created_at: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String }, 
  });
  
module.exports = mongoose.model('topup_type', topup_type);
