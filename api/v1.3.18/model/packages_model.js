
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const packages = Schema({
    packages_id:{ type: Number },
    duration:{ type: Number},  
    name:{ type: String},
    description:{ type: String},
    percentage:{ type: String },
    status: { type: Number },
    is_active: { type: Number },
    created_at: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String }
  });
  
  module.exports = mongoose.model('packages', packages);
