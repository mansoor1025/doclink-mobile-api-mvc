const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const medication_notifications = Schema({
    mn_id: { type: Number, required: true },
    medication_id: { type: Number, required: true },
    patient_id: { type: Number, required: true },
    doctor_id: { type: Number, required: true },
    medication_detail_id: { type: Number, required: true },
    medicine_name: { type: String, required: true },
    medication_type: { type: String, required: true },
    medicine_reminder_time: { type: String, required: true },
    trigger_date: { type: String, required: true },
    is_active: { type: Number, required: true },
    created_at: { type: String },
    updated_at: { type: String }
});

module.exports = mongoose.model('medication_notifications', medication_notifications);
