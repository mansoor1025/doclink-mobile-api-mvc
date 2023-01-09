const UserModel = require("../auth/UserModel");
const { body, query, validationResult } = require('express-validator');
const disease_modal = require('../model/disease_modal')
const doctor_disease_model = require('../model/doctor_disease_modal')
const qualification_model = require('../model/doctor_qualification_model');
const services_model = require('../model/doctor_services_model');
const rating_reviews = require('../model/rating_reviews_model');
const endorsed_modal = require('../model/endorsment_modal')

exports.view_all_disease = async (req, res, next) => {
    try {
        const alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        const disease_with_image = await disease_modal.find({ disease_image: { $ne: '' } })
        const { start_limit = 1, end_limit = 20 } = req.query
        let alphabet_arr = []
        if (end_limit > alphabet.length) {
            return res.status(500).json({ msg: "error", response: "total alphabets are 26" })
        }

        for (let i = start_limit - 1; i < end_limit; i++) {
            var char = alphabet[i].toUpperCase();
            let disease_with_alphabet = await disease_modal.find({ "name": { $regex: '^' + char, $options: 'i' } });
            let alphabet_obj = {

            }
            alphabet_obj[char] = disease_with_alphabet
            alphabet_arr.push(alphabet_obj)
        }

        return res.status(200).json({ msg: "success", alphabet_disease: alphabet_arr, disease_with_image: disease_with_image, total: alphabet_arr.length, all_over_disease: alphabet.length })

    } catch (error) {
        res.status(500).json({ msg: "error", response: error.message })
        console.log(error);
        res.send(error);
    }
}

exports.disease_via_name = async (req, res, next) => {
    try {
        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const alphabet_arr = [];
        const name = req.query.name;

        if (name == '') {
            return res.status(409).json({ msg: "error", response: "name is required" })
        }

        var char = name[0].toUpperCase();
        let disease_with_alphabet = await disease_modal.find({ "name": { $regex: req.query.name, $options: "i" }, is_active: 1 })

        let alphabet_obj = {
        }

        alphabet_obj[char] = disease_with_alphabet
        alphabet_arr.push(alphabet_obj)


        let disease_via_name = await disease_modal.find({ name: { $regex: req.query.name, $options: "i" }, is_active: 1, disease_image: { $ne: '' } })
        return res.status(200).json({ msg: "success", alphabet_disease: alphabet_arr, disease_with_image: disease_via_name })

    } catch (error) {
        res.status(500).json({ msg: "error", response: error.message })
        console.log(error);
        res.send(error);
    }
}

exports.disease_by_doctor = async (req, res, next) => {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { page = 1, limit = 15 } = req.query
        const disease_id = req.query.disease_id;
        const name = req.query.name;
        const all_over_arr = [];
        let disease = await doctor_disease_model.find({ disease_id: disease_id, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
        let over_all_disease = await doctor_disease_model.find({ disease_id: disease_id, is_active: 1 });
        for (let i = 0; i < over_all_disease.length; i++) {
            let top_rated = await UserModel.findOne({ role: 2, is_verified: 1, is_active: 1, is_number_verified: 1, user_id: over_all_disease[i].doctor_id })
            if (top_rated != null) {
                all_over_arr.push(top_rated.user_id)
            }

        }
        let final_top_rated = []
        let total_rating = 0;
        let all_over_rating = 0;
        for (let i = 0; i < disease.length; i++) {
            let top_rated = ''
            if (name) {
                top_rated = await UserModel.find({ name: { $regex: req.query.name, $options: "i" }, role: 2, is_verified: 1, is_active: 1, is_number_verified: 1, user_id: disease[i].doctor_id })
            }
            else {
                top_rated = await UserModel.find({ role: 2, is_verified: 1, is_active: 1, is_number_verified: 1, user_id: disease[i].doctor_id })
            }

            if (top_rated.length > 0) {
                let qualification_detail = await qualification_model.find({ doctor_id: disease[i].doctor_id })
                let services_detail = await services_model.find({ doctor_id: disease[i].doctor_id })
                let all_over_ratings = await rating_reviews.find({ doctor_id: disease[i].doctor_id, status: 1 }).sort({ rr_id: -1 });
                for (let i = 0; i < all_over_ratings.length; i++) {
                    total_rating += all_over_ratings[i].stars
                }

                if (all_over_ratings.length > 0) {
                    all_over_rating = parseInt(total_rating) / parseInt(all_over_ratings.length)
                }
                let endorsement = await endorsed_modal.find({ endors_to: disease[i].doctor_id })
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
            else {
                console.log(disease[i].doctor_id, 'disease[i].doctor_id');
            }
        }
        return res.status(200).json({ msg: "success", response: final_top_rated, total: final_top_rated.length, over_all_disease: all_over_arr.length })

    } catch (error) {
        res.status(500).json({ msg: "error", response: error.message })
        console.log(error);
        res.send(error);
    }
}



