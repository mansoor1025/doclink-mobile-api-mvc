const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');
 
const roles = Schema({
    roles_id: { type: Number, require: true },
    name: { type: String, require: true },
    status: { type: Number, require: true, default: 1 },
    createdAt: { type: String, default: moment().format() },
    updatedAt: { type: String, default: moment().format() },
});

module.exports = mongoose.model('roles', roles);
