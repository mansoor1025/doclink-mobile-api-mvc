const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const medications = Schema({
  medication_id: { type: Number },
  doctor_id: { type: Number },
  patient_id: { type: Number },
  chatroom_session_id: { type: Number },
  chatroom_id: { type: Number },
  additional_comments: { type: String },
  is_active: { type: Number },
  push_notification_date: { type: String },
  created_at: { type: String },
  updated_at: { type: String },
  deleted_at: { type: String },
});

module.exports = mongoose.model('medications', medications);
