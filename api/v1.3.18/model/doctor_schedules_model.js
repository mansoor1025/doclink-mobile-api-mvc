
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const doctor_schedules = Schema({
    doctor_schedules_id:{ type: Number },
    doctor_id:{ type: Number},
    place_name:{ type: String},
    days:{ type: String },  
    start_time: { type: String },
    end_time: { type: String },
    created_at: { type: String },
    updated_at: { type: String },
    deleted_at: { type: String },
  });
  
  module.exports = mongoose.model('doctor_schedules', doctor_schedules);
