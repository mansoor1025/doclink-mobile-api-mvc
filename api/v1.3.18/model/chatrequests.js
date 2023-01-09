const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatrequests = Schema({
  patientId: { type: Number, require: true },
  doctorId: { type: Number, require: true },
  status: { type: String, require: true },
  chiefComplaint: { type: Object },
  paymentStatus: { type: String },
  amount: { type: Number },
  chatroom_id: { type: Number, require: true },
  is_active: { type: Number, default: 1 },
  chatRequestId: { type: Number, require: true },
  support_team_status: { type: Number },
  request_time: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
  user: { type: Object }
});

module.exports = mongoose.model('chatrequests', chatrequests);
