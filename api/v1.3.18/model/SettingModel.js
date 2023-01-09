const mongoose = require('mongoose');
//END ENV
const Schema = mongoose.Schema;

const SettingModelSchema = Schema({
    name: { type: String },
    data:{type: String},
    is_active: { type: Number , default : 1 },
  }, { timestamps: true });


  module.exports = mongoose.model('Setting', SettingModelSchema);