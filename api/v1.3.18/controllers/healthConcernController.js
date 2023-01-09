const UserModel = require("../auth/UserModel");
const { body, query, validationResult } = require('express-validator');
const health_modal = require('../model/health_concern_modal')
const doctor_health_concern_modal = require('../model/doctor_health_concern_modal')
const qualification_model = require('../model/doctor_qualification_model');
const services_model = require('../model/doctor_services_model');
const rating_reviews = require('../model/rating_reviews_model');
const endorsed_modal = require('../model/endorsment_modal')

exports.view_all_heath_concern = async (req, res, next) => {
    try {
        const { page = 1, limit = 15 } = req.query
        const health_with_image = await health_modal.find({ health_image: { $ne: '' } })
        const health_without_image = await health_modal.find({ health_image: '' }).limit(limit * 1).skip((page - 1) * limit);
        const health_without_image_pagination = await health_modal.find({ health_image: '' })
        return res.status(200).json({ msg: "success", health_with_image: health_with_image, health_without_image: health_without_image, total: health_without_image.length, all_over_health: health_without_image_pagination.length })

    } catch (error) {
        res.status(500).json({ msg: "error", response: error.message })
        console.log(error);
        res.send(error);
    }
}

exports.health_via_name = async (req, res, next) => {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const name = req.body.name;
        if (name == '') {
            return res.status(409).json({ msg: "error", response: "name is required" })
        }
        const { page = 1, limit = 15 } = req.query
        const health_with_image = await health_modal.find({ name: { $regex: req.query.name, $options: "i" }, health_image: { $ne: '' } })
        const health_without_image = await health_modal.find({ name: { $regex: req.query.name, $options: "i" }, health_image: '' }).limit(limit * 1).skip((page - 1) * limit);
        const health_without_image_pagination = await health_modal.find({ name: { $regex: req.query.name, $options: "i" }, health_image: '' })
        return res.status(200).json({ msg: "success", health_with_image: health_with_image, health_without_image: health_without_image, total: health_without_image.length, all_over_health: health_without_image_pagination.length })

    } catch (error) {
        res.status(500).json({ msg: "error", response: error.message })
        console.log(error);
        res.send(error);
    }
}

exports.health_by_doctor = async (req, res, next) => {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { page = 1, limit = 15 } = req.query
        const name = req.query.name
        const health_id = req.query.health_id;
        const all_over_heath = [];
        let health = await doctor_health_concern_modal.find({ health_id: health_id, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
        let health_pag = await doctor_health_concern_modal.find({ health_id: health_id, is_active: 1 });
        let final_top_rated = []
        let total_rating = 0;
        let all_over_rating = 0;

        for (let i = 0; i < health_pag.length; i++) {
            let top_rated = await UserModel.findOne({ role: 2, is_verified: 1, is_active: 1, is_number_verified: 1, user_id: health_pag[i].doctor_id })
            if (top_rated != null) {
                all_over_heath.push(top_rated.user_id)
            }
        }

        for (let i = 0; i < health.length; i++) {
            let top_rated = '';
            if (name) {
                top_rated = await UserModel.find({ "name": { $regex: req.query.name, $options: "i" }, role: 2, is_verified: 1, is_active: 1, is_number_verified: 1, user_id: health[i].doctor_id })
            }
            else {
                top_rated = await UserModel.find({ role: 2, is_verified: 1, is_active: 1, is_number_verified: 1, user_id: health[i].doctor_id })
            }
            if (top_rated.length > 0) {
                let qualification_detail = await qualification_model.find({ doctor_id: health[i].doctor_id })
                let services_detail = await services_model.find({ doctor_id: health[i].doctor_id })
                let all_over_ratings = await rating_reviews.find({ doctor_id: health[i].doctor_id, status: 1 }).sort({ rr_id: -1 });
                for (let i = 0; i < all_over_ratings.length; i++) {
                    total_rating += all_over_ratings[i].stars
                }

                if (all_over_ratings.length > 0) {
                    all_over_rating = parseInt(total_rating) / parseInt(all_over_ratings.length)
                }
                let endorsement = await endorsed_modal.find({ endors_to: health[i].doctor_id })
                let doctor_detail = {
                    doctor_list: top_rated,
                    qualification: qualification_detail,
                    services_detail: services_detail,
                    rating: all_over_rating.toFixed(1),
                    endorsement: endorsement.length,
                }
                final_top_rated.push(doctor_detail)
                total_rating = 0
                all_over_rating = 0
            }
        }
        return res.status(200).json({ msg: "success", response: final_top_rated, total: final_top_rated.length, all_over_health: all_over_heath.length })

    } catch (error) {
        res.status(500).json({ msg: "error", response: error.message })
        console.log(error);
        res.send(error);
    }
}



