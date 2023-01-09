const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')
const user_fcm_token = Schema({
  ft_id: { type: Number },
  device_token: { type: String },
  user_id: { type: Number },
  fcm_token: { type: String },
  is_active: { type: Number, default: 1 },
  created_at: { type: String, default: moment().format() },
  updated_at: { type: String },
  deleted_at: { type: String },
});
module.exports = mongoose.model('user_fcm_token', user_fcm_token);
