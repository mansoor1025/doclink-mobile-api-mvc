const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const patient_diagnostic_tests = Schema({
    patient_diagnostic_tests_id:{ type: Number },
    chatroom_session_id: { type: Number },
    doctor_id: { type: Number },
    patient_id: { type: Number },
    short_code: { type: String },
    test_name: { type: String },
    lab_test_id: { type: Number },
    comment: { type: String },
    created_at: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String }
  });
  
  module.exports = mongoose.model('patient_diagnostic_tests', patient_diagnostic_tests);
