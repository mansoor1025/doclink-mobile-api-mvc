const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
//ENV VARIABLE SAVE
const expiresIn = "NeXuS$X321";
const secret = (60000 * 30);
//END ENV
const Schema = mongoose.Schema;
var moment = require('moment');

const UserSchema = Schema({
  title: { type: String, },
  name: { type: String, },
  email: { type: String },
  qualification: { type: String },
  // alt_email: { type: String },//
  phone_number: { type: String },
  // alt_phone:{ type: String },
  avatar: { type: String, default: "dummy.png" },
  gender: { type: String },
  cnic_number: { type: String },
  pmdc_number: { type: String },
  password: { type: String },
  verification_token: { type: String },
  user_id: { type: Number },
  mrn: { type: Number },
  experience: { type: String },
  current_wallet_amount: { type: String, default: 0 },
  role: { type: Number },
  is_verified: { type: Number, default: 3 },
  is_complete: { type: Number, default: 3 },
  is_active: { type: Number, default: 1 },
  incentive_amount: { type: String },
  remember_token: { type: String },
  //bank_name: { type: String},
  //account_title: { type: String},
  //account_number: { type: String},
  ratings: { type: String },
  referral_code: { type: String },
  reference_code_signup: { type: String },
  //free_interaction: {  type: Number,default:0 },
  platform: { type: String, default: null },
  device_brand: { type: String },
  device_model: { type: String },
  device_os: { type: String },
  status_text: { type: String },
  device_name: { type: String },
  app_version: { type: String },
  connectycube_email: { type: String },
  connectycube_full_name: { type: String },
  connectycube_id: { type: String },
  connectycube_login: { type: String },
  connectycube_password: { type: String },
  deleted_at: { type: Date },
  created_at: { type: String },
  emergency_contact: { type: String },
  updated_at: { type: String },
  last_sync_timestamp: { type: Date },
  is_test: { type: Number, default: 0 },
  receptionist_clinic: { type: Number },
  skip_at: { type: Date },
  is_number_verified: { type: Number, default: 3 },
  timezone_offset: { type: String, default: "+05:00" },
  designation: { type: String },
  specialization_id: { type: Number },
  specialization: { type: String },
  device_identifier: { type: String },
  dob: { type: String },
  blood_group: { type: String },
  generated_at: { type: String, default: moment().format('YYYY-MM-DD') },
  device_token: { type: String, default: "null" },
  martial_status: { type: String },
  price: { type: Number, default: 0 },
  access_token: { type: String },
  fcm_token: { type: String },
});



UserSchema.methods.comparePassword = function (candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) callback(err, null);
    callback(null, isMatch);
  });
}

UserSchema.methods.generateJwt = function (user) {
  return jwt.sign(user.toJSON(), secret, {
    expiresIn: expiresIn
  });
};

module.exports = mongoose.model('User', UserSchema);
