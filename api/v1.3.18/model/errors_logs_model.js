const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const errors_logs = Schema({
    error_id:{ type: Number },
    platform:{ type: String},
    endpoint:{ type: String},
    error:{ type: String},
    server:{ type: String },
    created_at: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String }
  });
  
  module.exports = mongoose.model('errors_logs', errors_logs);
