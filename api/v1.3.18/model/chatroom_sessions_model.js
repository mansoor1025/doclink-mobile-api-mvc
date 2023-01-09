const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var moment = require('moment');
const chatsessions = Schema({
  sessionId: { type: Number, require: true },
  chatroom_id: { type: Number, require: true },
  startedBy: { type: Number, require: true },
  sessionType: { type: String, require: true },
  status: { type: String, require: true },
  requestId: { type: Number },
  startedAt: { type: Number },
  endedAt: { type: Number },
  endedBy: { type: Number },
  doctorClosingNotes: { type: String },
  patientRating: { type: Number },
  createdAt: { type: String },
  updatedAt: { type: String },
});

module.exports = mongoose.model('chatsessions', chatsessions);
