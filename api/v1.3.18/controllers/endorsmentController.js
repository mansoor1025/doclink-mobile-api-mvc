const moment = require('moment');
const UserModel = require("../auth/UserModel");
const { body, query, validationResult } = require('express-validator');
const endorsed_modal = require('../model/endorsment_modal')
const doctor_qualification_model = require('../model/doctor_qualification_model')
const doctor_services_model = require('../model/doctor_services_model')
const rating_reviews = require('../model/rating_reviews_model');
const common = require('../../../helpers/common')



exports.doctor_endored = async (req, res, next) => {
    try {
        // validation error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let endors_by = req.user.user_id
        let endors_to = req.body.endors_to
        let comments = req.body.comments
        let endorsed_final_id = 0;

        let doctor_verify = await UserModel.find({ user_id: endors_to, is_verified: 1, is_number_verified: 1, is_active: 1 })

        if (doctor_verify.length == 0) {
            res.status(409).json({ msg: "error", response: "Endorsed To Doctor Not Exists" })
        }

        let endorsed_exists = await endorsed_modal.find({ endors_by: endors_by, endors_to: endors_to })

        // check if doctor already endorsed
        if (endorsed_exists.length > 0) {
            return res.status(409).json({ msg: "error", response: "already endorsed by doctor" })
        }
        let endorsed_count = await endorsed_modal.findOne({}).sort({ endorsment_id: -1 });
        if (endorsed_count == null) {
            endorsed_final_id = 1;
        } else {
            endorsed_final_id = parseInt(endorsed_count.endorsment_id) + 1;
        }

        // endorsed data obj
        let endorsed_data = {
            endors_by_name: req.user.name,
            endors_to_name: doctor_verify[0].name,
            endorsment_id: endorsed_final_id,
            endors_by: req.user.user_id,
            endors_to: endors_to,
            comments: comments,
            created_at: moment().format()
        }

        // endorsed data save in database
        await new endorsed_modal(endorsed_data).save()

        var message = `Dr ${req.user.name} has endorsed you`
        var bodyParams = {
            user_id: doctor_verify[0].user_id,
            flavor: 'doctor',
            notificaiton_data: {
                "title": `Endorsment`,
                "body": message,
                "sound": "default",
                "icon": "stock_ticker_update",
                "color": "#ffffff",
                "channel_id": "doclink_patient_channel",
                "default_sound": "false",
                "personal_data": {},
            },
        }
        common.send_notification_for_rest_api(bodyParams)
        res.status(200).json({ msg: "success", response: "Doctor endorsed add successfully" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "error", response: error.message })
    }
}

exports.doctor_list_with_endorsed = async (req, res, next) => {
    try {
        console.log('doctor_list_with_endorsed');

        // validation error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let doctor_id = req.user.user_id

        let user_data = "";
        let data = [];
        let total_rating = 0;
        let all_over_rating = 0;
        const { page = 1, limit = 10 } = req.query
        const all_over_endorsment = await UserModel
            .find({
                role: 2,
                is_active: 1,
                is_verified: 1,
                user_id: { $nin: [doctor_id] }
            });
        // if name is defined
        if (req.query.name) {
            user_data = await UserModel
                .find({
                    name: { $regex: req.query.name, $options: "i" },
                    role: 2,
                    is_active: 1,
                    is_verified: 1,
                    user_id: { $nin: [doctor_id] }
                }).sort({ user_id: -1 }).limit(limit * 1).skip((page - 1) * limit);
        } else {
            // if name is not defined
            user_data = await UserModel
                .find({
                    role: 2, is_active: 1, is_verified: 1,
                    user_id: { $nin: [doctor_id] }
                }).sort({ user_id: -1 }).limit(limit * 1).skip((page - 1) * limit);
        }


        for (let i = 0; i < user_data.length; i++) {
            let user_detail = await UserModel.find({ user_id: user_data[i].user_id });
            let qualification = await doctor_qualification_model.find({ doctor_id: user_data[i].user_id })
            let services = await doctor_services_model.find({ doctor_id: user_data[i].user_id })
            let endorsed_doctor = await endorsed_modal.find({ endors_to: user_data[i].user_id, endors_by: req.user.user_id, endors_status: 1 })
            const all_over_ratings = await rating_reviews.find({ doctor_id: user_data[i].user_id, status: 1 }).sort({ rr_id: -1 });
            if (all_over_ratings.length > 0) {
                console.log('doctor_id', user_data[i].user_id);
                for (let i = 0; i < all_over_ratings.length; i++) {
                    total_rating += all_over_ratings[i].stars
                }

                if (all_over_ratings.length > 0) {
                    all_over_rating = parseInt(total_rating) / parseInt(all_over_ratings.length)
                }
            }

            let endorsement = await endorsed_modal.find({ endors_to: user_data[i].user_id })

            let user_data_obj = {
                doctor_list: user_detail,
                qualification: qualification,
                services: services,
                endorsed_status: endorsed_doctor.length,
                rating: all_over_rating.toFixed(1),
                endorsement: endorsement.length,
            }
            data.push(user_data_obj)
            all_over_rating = 0
            total_rating = 0
        }

        res.status(200).json({ msg: "success", response: data, total: data.length, all_over_endorsment: all_over_endorsment.length })

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "error", response: error.message })
    }
}

exports.endored_detail_by_id = async (req, res, next) => {
    try {
        let endorsed_detail = await endorsed_modal.find({ endors_by: req.user.user_id })
        res.status(200).json({ msg: "success", response: endorsed_detail })
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "error", response: error.message })
    }
}

exports.view_all_endorsment = async (req, res, next) => {
    try {

        // validation error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { page = 1, limit = 5 } = req.query
        let endorsmentArr = []
        const doctor_id = req.query.doctor_id
        const doctor_exists = await UserModel.find({ user_id: doctor_id, is_verified: 1, is_active: 1 })
        if (doctor_exists.length == 0) {
            return res.status(200).json({ msg: "error", response: "doctor not found" })
        }
        let over_all_endorsment = await endorsed_modal.find({ endors_to: doctor_id })
        let endorsed_doctor = await endorsed_modal.find({ endors_to: doctor_id }).limit(limit * 1).skip((page - 1) * limit);
        for (let i = 0; i < endorsed_doctor.length; i++) {
            let endors_by_image = await UserModel.findOne({ user_id: endorsed_doctor[i].endors_by })
            let endors_to_image = await UserModel.findOne({ user_id: endorsed_doctor[i].endors_to })
            let endorstment_obj = {
                "generated_at": endorsed_doctor[i].generated_at,
                "endors_status": endorsed_doctor[i].endors_status,
                "created_at": endorsed_doctor[i].created_at,
                "endors_by_name": endorsed_doctor[i].endors_by_name,
                "endors_to_name": endorsed_doctor[i].endors_by_name,
                "endorsment_id": endorsed_doctor[i].endorsment_id,
                "endors_by": endorsed_doctor[i].endors_by,
                "endors_to": endorsed_doctor[i].endors_to,
                "endors_by_image": endors_by_image.avatar,
                "endors_to_image": endors_to_image.avatar,
                "comments": endorsed_doctor[i].comments
            }
            endorsmentArr.push(endorstment_obj)
        }
        res.status(200).json({ msg: "success", response: endorsmentArr, total: endorsmentArr.length, over_all_endorsment: over_all_endorsment.length })

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "error", response: error.message })
    }
}

exports.doctor_endorsment_cards = async (req, res, next) => {
    try {

        let endorsed_doctor_to = await endorsed_modal.find({ endors_by: req.user.user_id }).countDocuments();
        let endorsed_doctor_by = await endorsed_modal.find({ endors_to: req.user.user_id }).countDocuments();
        let endored_obj = {
            endorsed_doctor_to,
            endorsed_doctor_by
        }
        res.status(200).json({ msg: "success", response: endored_obj })

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "error", response: error.message })
    }
}

exports.endored_by_details = async (req, res, next) => {
    try {
        console.log('condition 1 ');
        let endorsed_by = [];
        let endorsed_doctor_by = await endorsed_modal.find({ endors_to: req.user.user_id });
        for (let i = 0; i < endorsed_doctor_by.length; i++) {
            let user_details = await UserModel.findOne({ user_id: endorsed_doctor_by[i].endors_by })
            let endored_obj = {
                name: user_details.name,
                image: user_details.avatar,
                created_at: endorsed_doctor_by[i].created_at,
                comments: endorsed_doctor_by[i].comments
            }
            endorsed_by.push(endored_obj)
        }
        res.status(200).json({ msg: "success", response: endorsed_by })

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "error", response: error.message })
    }
}

exports.endored_to_details = async (req, res, next) => {
    try {
        console.log('condition 2 ');
        let endorsed_to = [];
        let endorsed_doctor_to = await endorsed_modal.find({ endors_by: req.user.user_id, endors_status: 1 });
        let total_rating = 0;
        let all_over_rating = 0;
        if (endorsed_doctor_to.length > 0) {

            for (let i = 0; i < endorsed_doctor_to.length; i++) {
                let user_detail = await UserModel.find({ user_id: endorsed_doctor_to[i].endors_to });
                let qualification = await doctor_qualification_model.find({ doctor_id: endorsed_doctor_to[i].endors_to })
                let services = await doctor_services_model.find({ doctor_id: endorsed_doctor_to[i].endors_to })
                let endorsed_doctor = await endorsed_modal.find({ endors_by: req.user.user_id, endors_to: endorsed_doctor_to[i].endors_to, endors_status: 1 })
                const all_over_ratings = await rating_reviews.find({ doctor_id: endorsed_doctor_to[i].endors_to, status: 1 }).sort({ rr_id: -1 });
                for (let i = 0; i < all_over_ratings.length; i++) {
                    total_rating += all_over_ratings[i].stars
                }

                if (all_over_ratings.length > 0) {
                    all_over_rating = parseInt(total_rating) / parseInt(all_over_ratings.length)
                }

                let endorsement = await endorsed_modal.find({ endors_to: endorsed_doctor_to[i].endors_to })

                let user_data_obj = {
                    doctor_list: user_detail,
                    qualification: qualification,
                    services: services,
                    endorsed_status: endorsed_doctor.length,
                    rating: all_over_rating.toFixed(1),
                    endorsement: endorsement.length,
                }
                endorsed_to.push(user_data_obj)
                all_over_rating = 0
                total_rating = 0

            }
        }

        res.status(200).json({ msg: "success", response: endorsed_to })

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "error", response: error.message })
    }
}

