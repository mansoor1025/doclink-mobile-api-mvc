const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const transactions_consumer = Schema({
    transaction_id:{ type: Number },
    chat_session_id:{ type: Number },
    patient_id: { type: Number },
    doctor_id: { type: Number },
    payment_gateway: { type: String },
    payment_method_id: { type: Number },
    payment_method: { type: String },
    transaction_uuid: { type: String },
    payment_type_id: { type: Number },
    amount:{ type: Number },
    payment_status: { type: String, default:"credit"},
    status_code:{ type: String},
    parent_id: { type: Number },
    raw_response:{ type: Number },
    response_generated_signature:{ type: String},
    date:{ type: String},
    created_at: { type: String},
    updated_at:{ type: String}
  });
  
  module.exports = mongoose.model('transactions_consumer', transactions_consumer);
