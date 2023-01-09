const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;
const specializations = Schema({ 
    is_active: { type: Number },
    name: { type: String },
    short_name: { type: String },
    id: { type: Number },
    created_at: { type: String},
    updated_at: { type: String},
    deleted_at: { type: String}
  });
  
  module.exports = mongoose.model('specializations', specializations);
