const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const invited_doctors = Schema({
    invited_doctor_id:{ type: Number },
    patient_id: { type: Number },
    invite_name: { type: String },
    invite_phone: { type: String },
    invite_clinic: { type: String },
    invite_email: { type: String },
    description: { type: String },
    platform: { type: String },
    created_at: { type: String },
    updated_at: { type: String }
  });
  
  module.exports = mongoose.model('invited_doctors', invited_doctors);
