const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const payout = Schema({
  payout_id: { type: Number},
  transaction_id: { type: Number },
  doctor_id: { type: Number},
  payout_mode: { type: String,default:null},
  payout_part: { type: String,default:null},
  debit: { type: Number },
  credit: { type: Number },
  balance: { type: Number},
  transaction_date: { type: String},
  created_at: { type: String },
  updated_at: { type: String },
  deleted_at: { type: String },
  });
  
  module.exports = mongoose.model('payout', payout);
