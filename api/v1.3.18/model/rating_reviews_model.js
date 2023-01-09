const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const rating_reviews = Schema({
    rr_id: { type: Number },
    chatroom_id: { type: Number },
    doctor_id: { type: Number },
    patient_id: { type: Number },
    chatrequest_id: { type: Number },
    stars: { type: Number },
    reviews: { type: String },
    waitLongConsultation: { type: String },
    satisfiedConsultationTime: { type: String },
    satisfiedDiagnosis: { type: String },
    recommendServiceFriend: { type: Number },
    status: { type: Number, default: 0 },
    is_active: { type: Number, default: 1 },
    created_at: { type: String, default: moment().format() },
    updated_at: { type: String },
    deleted_at: { type: String }
});

module.exports = mongoose.model('rating_reviews', rating_reviews);
