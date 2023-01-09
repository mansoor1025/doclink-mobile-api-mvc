
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const doctor_packages = Schema({
    doctor_packages_id:{ type: Number },
    user_id:{ type: Number},
    package_id:{ type: Number},
    price:{ type: Number },
    is_active: { type: Number },
    created_at: { type: String },
    deleted_at: { type: String },
    updated_at: { type: String }
  });
  
  module.exports = mongoose.model('doctor_packages', doctor_packages);
