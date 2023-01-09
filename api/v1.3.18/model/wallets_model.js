const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const wallet_logs = Schema({
    wallet_logs_id:{ type: Number },
    credit:{ type: Number },
    patient_id: { type: Number },
    reference_id: { type: Number }, 
    payment_type: { type: String },
    created_at: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String },
  });
module.exports = mongoose.model('wallet_logs', wallet_logs);
