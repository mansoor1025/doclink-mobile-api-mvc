const UserModel = require("../auth/UserModel");
const { body, query, validationResult } = require('express-validator');
const rating_reviews = require("../model/rating_reviews_model");

exports.view_all_reviews = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const doctor_id = req.query.doctor_id
        const complete_count = await rating_reviews.find({ status: 1, doctor_id: doctor_id }).sort({ rr_id: -1 })
        const reviews_details = await rating_reviews.find({ status: 1, doctor_id: doctor_id }).sort({ rr_id: -1 }).limit(limit * 1).skip((page - 1) * limit);
        const rating_final = [];
        console.log('reviews============');
        console.log(reviews_details);
        for (let i = 0; i < reviews_details.length; i++) {
            let patient_detail = await UserModel.findOne({ role: 1, user_id: reviews_details[i].patient_id })
            let rating_calculation = parseInt(reviews_details[i].stars) / 1
            if (patient_detail != null) {
                let rating_final_obj = {
                    rr_id: reviews_details[i].rr_id,
                    patient_img: patient_detail.avatar,
                    patient_name: patient_detail.name,
                    rating: rating_calculation,
                    reviews: reviews_details[i].reviews,
                    created_at: reviews_details[i].created_at
                }
                rating_final.push(rating_final_obj);
            }

        }

        return res.status(200).json({ msg: "success", response: rating_final, total: reviews_details.length, complete_count: complete_count.length })
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }
}