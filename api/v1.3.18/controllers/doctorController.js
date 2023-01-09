const rating_reviews = require('../model/rating_reviews_model');
const moment = require('moment')
const CronJob = require('cron').CronJob;
const support_team_modal = require('../model/support_team_modal')
const user_subs_plan_model = require('../model/user_subs_plan_model')
const chatrooms_model = require('../model/chatrooms_model')
const disease_modal = require('../model/disease_modal')
const health_concern_modal = require('../model/health_concern_modal')
const doctor_days_time_modal = require('../model/doctor_days_time_modal')
const doctor_timeslots_modal = require('../model/doctor_timeslots_modal')


exports.bst = async (req, res, next) => {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let data = {};
        let screen_name = req.query.screen_name;
        let total_rating = 0;
        let all_over_rating = 0;

        // check screen name exists
        let get_screen_id = await screen_modal.find({ screen_name: screen_name });


        if (get_screen_id.length == 0) {
            res.status(400).json({ msg: "error", response: "screen name did not exists" })
        }

        let banner_details = await banner_modal.find({ screen_id: get_screen_id[0].screen_id, is_active: 1 })

        let specialization = await specialization_modal.find({ is_active: 1 })
        let disease_details = await disease_modal.find({ is_active: 1 })
        let health_concern_details = await health_concern_modal.find({ is_active: 1 })
        let top_rated_doctor = await UserModel.find({ role: 2, is_verified: 1, is_active: 1, is_number_verified: 1 }).limit(6)
        let filter = await filter_modal.find({ screen_id: get_screen_id[0].screen_id, is_active: 1 });
        let final_top_rated = []
        for (let i = 0; i < top_rated_doctor.length; i++) {
            let top_rated = await UserModel.find({ role: 2, is_verified: 1, is_active: 1, is_number_verified: 1, user_id: top_rated_doctor[i].user_id })
            let qualification_detail = await qualification_model.find({ doctor_id: top_rated_doctor[i].user_id })
            let services_detail = await services_model.find({ doctor_id: top_rated_doctor[i].user_id })
            let all_over_ratings = await rating_reviews.find({ doctor_id: top_rated_doctor[i].user_id, status: 1 }).sort({ rr_id: -1 });
            for (let i = 0; i < all_over_ratings.length; i++) {
                total_rating += all_over_ratings[i].stars
            }

            if (all_over_ratings.length > 0) {
                all_over_rating = parseInt(total_rating) / parseInt(all_over_ratings.length)
            }
            let endorsement = await endorsed_modal.find({ endors_to: top_rated_doctor[i].user_id })

            let doctor_detail = {
                doctor_list: top_rated,
                rating: all_over_rating.toFixed(1),
                endorsement: endorsement.length,
                qualification: qualification_detail,
                services_detail: services_detail,
            }
            final_top_rated.push(doctor_detail)
            total_rating = 0;
            all_over_rating = 0;
        }

        disease_details: disease_details
        data['banner'] = banner_details
        data['specialization'] = specialization
        data['disease_details'] = disease_details
        data['health_concern_details'] = health_concern_details
        data['top_rated_doctor'] = final_top_rated
        data['filter'] = filter

        res.status(200).json({ msg: "success", response: data })
    } catch (error) {
        // common.error_log(req.user._id, req.user.name, 'doclink-mobile-app-backend', 'doctor/bst', error.message, "http://3.252.226.91:3100/")
        res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.search_doctor = async (req, res, next) => {
    try {
        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { page = 1, limit = 20 } = req.query
        let name = req.query.name
        let specialization = req.query.specialization
        let referral_code = req.query.referral_code
        let filter = req.query.filter
        let doctor_detail = ''
        let final_all_doctor = [];
        let total_rating = 0;
        let all_over_rating = 0;
        let all_over_doctor = await UserModel.find({ role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 });

        if (name == '' && specialization == '') {
            doctor_detail = await UserModel.find({ role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
        }

        if (name && specialization == '') {
            doctor_detail = await UserModel.find({ name: { $regex: name, $options: 'i' }, role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
        }

        if (specialization && name == '') {
            doctor_detail = await UserModel.find({ role: 2, is_verified: 1, is_number_verified: 1, specialization: specialization, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
        }

        if (specialization && name) {
            doctor_detail = await UserModel.find({ name: { $regex: name, $options: 'i' }, role: 2, is_verified: 1, is_number_verified: 1, specialization: specialization, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
        }

        if (referral_code) {
            doctor_detail = await UserModel.find({ referral_code: referral_code, role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 });
        }

        for (let i = 0; i < doctor_detail.length; i++) {
            let all_doctor = await UserModel.find({ role: 2, is_verified: 1, is_active: 1, is_number_verified: 1, user_id: doctor_detail[i].user_id })
            let qualification_detail = await qualification_model.find({ doctor_id: doctor_detail[i].user_id })
            let services_detail = await services_model.find({ doctor_id: doctor_detail[i].user_id })
            let all_over_ratings = await rating_reviews.find({ doctor_id: doctor_detail[i].user_id, status: 1 }).sort({ rr_id: -1 });
            for (let i = 0; i < all_over_ratings.length; i++) {
                total_rating += all_over_ratings[i].stars
            }

            if (all_over_ratings.length > 0) {
                all_over_rating = parseInt(total_rating) / parseInt(all_over_ratings.length)
            }
            let endorsement = await endorsed_modal.find({ endors_to: doctor_detail[i].user_id })

            let doctor_details = {
                doctor_list: all_doctor,
                qualification: qualification_detail,
                services_detail: services_detail,
                rating: all_over_rating.toFixed(1),
                endorsement: endorsement.length,
            }
            final_all_doctor.push(doctor_details)
            total_rating = 0;
            all_over_rating = 0;
        }

        return res.status(200).json({ msg: "success", response: final_all_doctor, total: final_all_doctor.length, all_over_doctor: all_over_doctor.length })
    } catch (error) {
        // common.error_log(req.user._id, req.user.name, 'doclink-mobile-app-backend', 'doctor/search_doctor', error.message, "http://3.252.226.91:3100/")
        res.status(500).json({ msg: "error", response: error.message })
        console.log(error);
    }
}

exports.search_filter = async (req, res, next) => {
    try {
        console.log('search filters api is running');
        let final_search_doctor = []
        let doctor_detail = ''
        let all_over_total = ''
        let name = req.query.name;
        let referral_code = req.query.referral_code;
        const { page = 1, limit = 10 } = req.query;
        let total_rating = 0;
        let all_over_rating = 0;
        let filter_name_exists = await filter_modal.find({ filter_name: req.query.filter_name })
        let endorsed_doctor = await endorsed_modal.find({ endors_status: 1 }).distinct('endors_to');
        let doctor_rating = await rating_reviews.find({ satisfiedConsultationTime: "yes" }).distinct('doctor_id')
        let top_rating = await rating_reviews.find({ is_active: 1 }).distinct('doctor_id')

        // for (let i = 0; i < top_rating.length; i++) {
        //     let intial_rating = await rating_reviews.aggregate({ $match: { doctor_id: top_rating[i], is_active: 1 } },
        //         { $group: { _id: null, sum: { $sum: "$stars" } } })
        //     let calculation = 
        // }
        if (filter_name_exists.length > 0) {

            if (filter_name_exists[0].filter_name == 'Female Doctor') {
                if (name) {
                    all_over_total = await UserModel.find({ gender: 'female', role: 2, name: { $regex: name, $options: 'i' }, is_verified: 1, is_number_verified: 1, is_active: 1 })
                    doctor_detail = await UserModel.find({ gender: 'female', role: 2, name: { $regex: name, $options: 'i' }, is_verified: 1, is_number_verified: 1, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
                }
                else {
                    all_over_total = await UserModel.find({ gender: 'female', role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 })
                    doctor_detail = await UserModel.find({ gender: 'female', role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
                }
            }

            if (filter_name_exists[0].filter_name == 'Endorsed doctors') {
                if (name) {
                    all_over_total = await UserModel.find({
                        role: 2, name: { $regex: name, $options: 'i' }, is_verified: 1, is_active: 1, is_number_verified: 1, user_id: { $in: endorsed_doctor }
                    });
                    doctor_detail = await UserModel.find({ role: 2, name: { $regex: name, $options: 'i' }, is_verified: 1, is_active: 1, is_number_verified: 1, user_id: { $in: endorsed_doctor } }).limit(limit * 1).skip((page - 1) * limit);
                }
                else {
                    all_over_total = await UserModel.find({ user_id: { $in: endorsed_doctor }, role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 })
                    doctor_detail = await UserModel.find({ user_id: { $in: endorsed_doctor }, role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
                }
            }

            if (filter_name_exists[0].filter_name == 'Top Rated') {
                if (name) {
                    all_over_total = await UserModel.find({
                        role: 2, name: { $regex: name, $options: 'i' }, is_verified: 1, is_active: 1, is_number_verified: 1, user_id: { $in: top_rating }
                    });
                    doctor_detail = await UserModel.find({ role: 2, is_active: 1, name: { $regex: name, $options: 'i' }, is_verified: 1, is_number_verified: 1, user_id: { $in: top_rating } }).limit(limit * 1).skip((page - 1) * limit);
                }
                else {
                    all_over_total = await UserModel.find({ user_id: { $in: top_rating }, role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 })
                    doctor_detail = await UserModel.find({ user_id: { $in: top_rating }, role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
                }
            }

            if (filter_name_exists[0].filter_name == 'Patient satisfaction') {
                if (name) {
                    all_over_total = await UserModel.find({
                        role: 2, is_active: 1, name: { $regex: name, $options: 'i' }, is_verified: 1, is_number_verified: 1, user_id: { $in: doctor_rating }
                    });
                    doctor_detail = await UserModel.find({ role: 2, is_active: 1, name: { $regex: name, $options: 'i' }, is_verified: 1, is_number_verified: 1, user_id: { $in: doctor_rating } }).limit(limit * 1).skip((page - 1) * limit);
                }
                else {
                    all_over_total = await UserModel.find({ user_id: { $in: doctor_rating }, role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 })
                    doctor_detail = await UserModel.find({ user_id: { $in: doctor_rating }, role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
                }
            }

            if (filter_name_exists[0].filter_name == 'Most experienced') {
                if (name) {
                    all_over_total = await UserModel.find({ role: 2, name: { $regex: name, $options: 'i' }, is_verified: 1, is_number_verified: 1, is_active: 1 }).sort({ "experience": -1 })
                    doctor_detail = await UserModel.find({ role: 2, name: { $regex: name, $options: 'i' }, is_verified: 1, is_number_verified: 1, is_active: 1 }).sort({ "experience": -1 }).limit(limit * 1).skip((page - 1) * limit);
                }
                else {
                    all_over_total = await UserModel.find({ role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 }).sort({ "experience": -1 })
                    doctor_detail = await UserModel.find({ gender: 'Female', role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 }).sort({ "experience": -1 }).limit(limit * 1).skip((page - 1) * limit);
                }
            }

            if (filter_name_exists[0].filter_name == 'Male Doctor') {
                if (name) {
                    all_over_total = await UserModel.find({ gender: 'male', role: 2, name: { $regex: name, $options: 'i' }, is_verified: 1, is_number_verified: 1, is_active: 1 })
                    doctor_detail = await UserModel.find({ gender: 'male', role: 2, name: { $regex: name, $options: 'i' }, is_verified: 1, is_number_verified: 1, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
                }
                else {
                    all_over_total = await UserModel.find({ gender: 'male', role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 })
                    doctor_detail = await UserModel.find({ gender: 'male', role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit).sort({ user_id: -1 });
                }
            }

            if (filter_name_exists[0].filter_name == 'Lowest fee') {
                if (name) {
                    all_over_total = await UserModel.find({ consultation_fee: { $ne: null }, role: 2, is_verified: 1, is_number_verified: 1, name: { $regex: name, $options: 'i' }, is_active: 1 })
                    doctor_detail = await UserModel.find({ consultation_fee: { $ne: null }, role: 2, is_verified: 1, is_number_verified: 1, name: { $regex: name, $options: 'i' }, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
                } else {
                    all_over_total = await UserModel.find({ consultation_fee: { $ne: null }, role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 })
                    doctor_detail = await UserModel.find({ consultation_fee: { $ne: null }, role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
                }
            }

            if (filter_name_exists[0].filter_name == 'Hightest fee') {
                if (name) {
                    all_over_total = await UserModel.find({ consultation_fee: { $ne: null }, role: 2, is_verified: 1, is_number_verified: 1, name: { $regex: name, $options: 'i' }, is_active: 1 })
                    doctor_detail = await UserModel.find({ consultation_fee: { $ne: null }, role: 2, is_verified: 1, is_number_verified: 1, name: { $regex: name, $options: 'i' }, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit).sort({ consultation_fee: -1 });
                }
                else {
                    all_over_total = await UserModel.find({ consultation_fee: { $ne: null }, role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 })
                    doctor_detail = await UserModel.find({ consultation_fee: { $ne: null }, role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit).sort({ consultation_fee: -1 });
                }

            }

            if (filter_name_exists[0].filter_name == 'below 500') {
                if (name) {
                    all_over_total = await UserModel.find({ consultation_fee: { $gt: 499, $lt: 501 }, role: 2, is_verified: 1, is_number_verified: 1, name: { $regex: name, $options: 'i' }, is_active: 1 })
                    doctor_detail = await UserModel.find({ consultation_fee: { $gt: 499, $lt: 501 }, role: 2, is_verified: 1, is_number_verified: 1, name: { $regex: name, $options: 'i' }, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
                }
                else {
                    all_over_total = await UserModel.find({ consultation_fee: { $gt: 499, $lt: 501 }, role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 })
                    doctor_detail = await UserModel.find({ consultation_fee: { $gt: 499, $lt: 501 }, role: 2, is_verified: 1, is_number_verified: 1, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
                }
            }

            if (filter_name_exists[0].filter_name == 'Doctor near me') {
                doctor_detail = []
            }
        }

        if (name && filter_name_exists.length == 0) {
            all_over_total = await UserModel.find({ role: 2, name: { $regex: name, $options: 'i' }, is_verified: 1, is_number_verified: 1, is_active: 1 })
            doctor_detail = await UserModel.find({ role: 2, name: { $regex: name, $options: 'i' }, is_verified: 1, is_number_verified: 1, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
        }

        if (referral_code) {
            all_over_total = await UserModel.find({ role: 2, referral_code: referral_code, is_verified: 1, is_number_verified: 1, is_active: 1 })
            doctor_detail = await UserModel.find({ role: 2, referral_code: referral_code, is_verified: 1, is_number_verified: 1, is_active: 1 }).limit(limit * 1).skip((page - 1) * limit);
        }

        for (let i = 0; i < doctor_detail.length; i++) {
            let filter_doctors = await UserModel.find({ role: 2, is_verified: 1, is_active: 1, is_number_verified: 1, user_id: doctor_detail[i].user_id })
            let qualification_detail = await qualification_model.find({ doctor_id: doctor_detail[i].user_id })
            let services_detail = await services_model.find({ doctor_id: doctor_detail[i].user_id })
            let all_over_ratings = await rating_reviews.find({ doctor_id: doctor_detail[i].user_id, status: 1 }).sort({ rr_id: -1 });
            for (let i = 0; i < all_over_ratings.length; i++) {
                total_rating += all_over_ratings[i].stars
            }

            if (all_over_ratings.length > 0) {
                all_over_rating = parseInt(total_rating) / parseInt(all_over_ratings.length)
            }
            let endorsement = await endorsed_modal.find({ endors_to: doctor_detail[i].user_id })

            let doctor_details = {
                doctor_list: filter_doctors,
                qualification: qualification_detail,
                services_detail: services_detail,
                rating: all_over_rating.toFixed(1),
                endorsement: endorsement.length,
            }
            final_search_doctor.push(doctor_details)
            total_rating = 0;
            all_over_rating = 0;
        }

        return res.status(200).json({ msg: "success", response: final_search_doctor, total: final_search_doctor.length, all_over_total: all_over_total.length })
    } catch (error) {
        // common.error_log(req.user._id, req.user.name, 'doclink-mobile-app-backend', 'doctor/search_filter', error.message, "http://3.252.226.91:3100/")
        res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.all_top_rated_doctor = async (req, res, next) => {
    try {
        const { page = 1, limit = 15 } = req.query;
        const name = req.query.name
        let top_rated_doctor = ''
        if (name) {
            top_rated_doctor = await UserModel.find({ name: { $regex: name, $options: 'i' }, role: 2, is_verified: 1, is_number_verified: 1 }).limit(limit * 1).skip((page - 1) * limit).sort({ user_id: -1 });
        }
        else {
            top_rated_doctor = await UserModel.find({ role: 2, is_verified: 1, is_active: 1, is_number_verified: 1 }).limit(limit * 1).skip((page - 1) * limit).sort({ user_id: -1 });
        }

        let all_over_doctor = await UserModel.find({ role: 2, is_verified: 1, is_number_verified: 1 });
        let final_top_rated = []
        let total_rating = 0;
        let all_over_rating = 0;
        for (let i = 0; i < top_rated_doctor.length; i++) {
            let top_rated = await UserModel.find({ role: 2, is_verified: 1, is_active: 1, is_number_verified: 1, user_id: top_rated_doctor[i].user_id });
            if (top_rated.length > 0) {
                let qualification_detail = await qualification_model.find({ doctor_id: top_rated_doctor[i].user_id })
                let services_detail = await services_model.find({ doctor_id: top_rated_doctor[i].user_id })
                let all_over_ratings = await rating_reviews.find({ doctor_id: top_rated_doctor[i].user_id, status: 1 }).sort({ rr_id: -1 });
                for (let i = 0; i < all_over_ratings.length; i++) {
                    total_rating += all_over_ratings[i].stars
                }

                if (all_over_ratings.length > 0) {
                    all_over_rating = parseInt(total_rating) / parseInt(all_over_ratings.length)
                }
                let endorsement = await endorsed_modal.find({ endors_to: top_rated_doctor[i].user_id })
                const subscription_detail = await subscription_model.find({ doctor_id: top_rated_doctor[i].user_id, subscription_type: "custom plan" })
                let doctor_detail = {
                    doctor_list: top_rated,
                    qualification: qualification_detail,
                    services_detail: services_detail,
                    rating: all_over_rating.toFixed(1),
                    endorsement: endorsement.length,
                    subscription_type: subscription_detail.length > 0 ? "custom plan" : "doclink plan"
                }
                final_top_rated.push(doctor_detail)
                total_rating = 0
                all_over_rating = 0
            }

        }
        res.status(200).json({ msg: "success", response: final_top_rated, total: final_top_rated.length, all_over_doctor: all_over_doctor.length })
    } catch (error) {
        console.log(error);
    }
}

exports.doctor_profile_id = async (req, res, next) => {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }


        const access_token = req.header('access_token');
        const patient = await UserModel.find({ access_token: access_token })


        let days_data = {}
        const doctor_profile = await UserModel.find({ role: 2, is_verified: 1, is_number_verified: 1, user_id: req.query.doctor_id, is_active: 1 })
        let qualification_detail = await qualification_model.find({ doctor_id: req.query.doctor_id })
        let services_detail = await services_model.find({ doctor_id: req.query.doctor_id })
        let endorsedment_detail = await endorsed_modal.find({ endors_to: req.query.doctor_id }).limit(3)
        let rating_reviews_detail = await rating_reviews.find({ doctor_id: req.query.doctor_id, status: 1 }).limit(3).sort({ rr_id: -1 });
        let all_over_ratings = await rating_reviews.find({ doctor_id: req.query.doctor_id, status: 1 }).sort({ rr_id: -1 });
        let all_over_endorsement = await endorsed_modal.find({ endors_to: req.query.doctor_id, endors_status: 1 }).sort({ endorsment_id: -1 });
        let address = ''
        let final_days_time = []
        let all_over_days = []
        const doctor_days_time = await doctor_days_time_modal.find({ doctor_id: req.query.doctor_id }).distinct('hospital');
        const all_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        const subscription_detail = await subscription_model.find({ doctor_id: req.query.doctor_id, subscription_type: "custom plan" })
        for (let m = 0; m < doctor_days_time.length; m++) {
            let days_time_details = await doctor_days_time_modal.find({ doctor_id: req.query.doctor_id, hospital: doctor_days_time[m] });
            let days = {}
            for (let i = 0; i < days_time_details.length; i++) {
                address = days_time_details[0].address;
                const times_details = await doctor_timeslots_modal.find({ doctor_id: req.query.doctor_id, ddt_id: days_time_details[i].ddt_id });
                days[days_time_details[i].days] = times_details
            }
            final_days_time.push(days)

            days_data = {
                hospital: doctor_days_time[m],
                address: address,
                days: final_days_time
            }

            all_over_days.push(days_data)
            final_days_time = []

        }

        const patient_data = [];
        let endorsmentArr = []
        let total_rating = 0;
        let all_over_rating = 0;
        let rating_final = [];

        for (let i = 0; i < rating_reviews_detail.length; i++) {
            patient_data.push(rating_reviews_detail[i].patient_id)
        }
        let unique_patient_data = [...new Set(patient_data)];
        let waitLongConsultation = 0;
        let waitLongCount = 0;
        let patientSatisfication = 0;
        let allPatientSatisfication = 0;

        for (let i = 0; i < all_over_ratings.length; i++) {
            total_rating += all_over_ratings[i].stars;
            if (typeof (all_over_ratings[i].waitLongConsultation) != 'undefined') {
                waitLongConsultation += parseInt(all_over_ratings[i].waitLongConsultation);
                waitLongCount++;
            }

            if (typeof (all_over_ratings[i].satisfiedConsultationTime) != 'undefined') {
                allPatientSatisfication++;
                if (all_over_ratings[i].satisfiedConsultationTime == 'yes') {
                    patientSatisfication++;
                }
            }
        }

        const finalWaitLongConsultation = parseInt(waitLongConsultation) / parseInt(waitLongCount);
        const finalPatientSatisfication = parseInt(patientSatisfication) / parseInt(allPatientSatisfication) * 100;


        for (let i = 0; i < unique_patient_data.length; i++) {

            let rating_detail = await rating_reviews.findOne({ doctor_id: req.query.doctor_id, patient_id: unique_patient_data[i], status: 1 }).sort({ rr_id: -1 })
            let patient_detail = await UserModel.findOne({ role: 1, user_id: unique_patient_data[i] })
            let rating_calculation = parseInt(rating_detail.stars) / 1
            if (patient_detail != null) {
                let rating_final_obj = {
                    patient_img: patient_detail.avatar,
                    patient_name: patient_detail.name,
                    rating: rating_calculation,
                    reviews: rating_detail.reviews,
                    created_at: rating_detail.created_at
                }
                rating_final.push(rating_final_obj);
            }

        }


        if (rating_reviews_detail.length > 0) {
            all_over_rating = parseInt(total_rating) / parseInt(all_over_ratings.length)
        }

        for (let i = 0; i < endorsedment_detail.length; i++) {
            let endors_by_image = await UserModel.findOne({ user_id: endorsedment_detail[i].endors_by })
            let endors_to_image = await UserModel.findOne({ user_id: endorsedment_detail[i].endors_to })
            let endorsement_obj = {
                "generated_at": endorsedment_detail[i].generated_at,
                "endors_status": endorsedment_detail[i].endors_status,
                "created_at": endorsedment_detail[i].created_at,
                "endors_by_name": endorsedment_detail[i].endors_by_name,
                "endors_to_name": endorsedment_detail[i].endors_to_name,
                "endorsment_id": endorsedment_detail[i].endorsment_id,
                "endors_by": endorsedment_detail[i].endors_by,
                "endors_to": endorsedment_detail[i].endors_to,
                "endors_by_image": endors_by_image.avatar,
                "endors_to_image": endors_to_image.avatar,
                "comments": endorsedment_detail[i].comments,
            }
            endorsmentArr.push(endorsement_obj)
        }

        let doctor_obj = {
            doctor_profile: doctor_profile,
            qualification_detail: qualification_detail,
            services_detail: services_detail,
            endorsedment_detail: endorsmentArr,
            rating_reviews: rating_final,
            all_over_rating: all_over_rating.toFixed(1),
            all_over_endorsement: all_over_endorsement.length,
            clinic_time: all_over_days,
            WaitLongConsultation: Math.floor(finalWaitLongConsultation),
            PatientSatisfication: Math.floor(finalPatientSatisfication),
            subscription_type: subscription_detail.length > 0 ? "custom plan" : "doclink plan"
        }

        if (patient.length > 0) {
            const user_id = patient[0].user_id
            if (user_id) {
                const chatroom_detail = await chatrooms_model.find({ patient_id: user_id, doctor_id: req.query.doctor_id })
                const subscribed_status = await user_subs_plan_model.find({ patient_id: user_id, doctor_id: req.query.doctor_id, is_active: 1 })
                if (chatroom_detail.length > 0) {
                    let chatroom_obj = {
                        _id: chatroom_detail[0]._id,
                        generated_at: chatroom_detail[0].generated_at,
                        doctor_id: chatroom_detail[0].doctor_id,
                        patient_id: chatroom_detail[0].patient_id,
                        is_active: chatroom_detail[0].is_active,
                        chatroom_id: chatroom_detail[0].chatroom_id,
                        created_at: chatroom_detail[0].created_at,
                        updated_at: chatroom_detail[0].updated_at,
                        user: doctor_profile[0]
                    }
                    doctor_obj['chatroom_detail'] = chatroom_obj
                }

                doctor_obj['subscribed'] = subscribed_status.length

            }
        }

        res.status(200).json({ msg: "success", response: doctor_obj })
    } catch (error) {
        // common.error_log(req.user._id, req.user.name, 'doclink-mobile-app-backend', 'doctor/filter', error.message, "http://3.252.226.91:3100/")
        res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.doctor_basic_profile = async (req, res, next) => {
    try {
        // validation errors
        let live_url = ''
        let connectycube_email = req.body.connectycube_email;
        let connectycube_full_name = req.body.connectycube_full_name;
        let connectycube_id = req.body.connectycube_id;
        let connectycube_login = req.body.connectycube_login;
        let connectycube_password = req.body.connectycube_password;

        const errors = validationResult(req);
        console.log('doctor basic profile is running');
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        if (typeof req.file !== 'undefined') {
            live_url = 'http://3.252.226.91:3500/' + req.file.path
        }
        else {
            res.status(412).json({ msg: "error", response: "Doctor Image required" })
        }

        let str = req.body.name.substring(0, 3);
        let random_number = Math.floor(Math.random() * (999 - 100 + 1) + 100);
        let referral_code = "ref-" + str + "-" + random_number;
        let user_final_id = 0;
        let user_count = await UserModel.findOne({}).sort({ user_id: -1 });
        let qualification = JSON.parse(req.body.qualification)

        if (user_count == null) {
            user_final_id = 1;
        } else {
            user_final_id = parseInt(user_count.user_id) + 1;
        }


        let verify_pmdc_number = await UserModel.find({
            pmdc_number: req.body.pmdc_number, role: 2
        });

        // check duplicate phone number


        // check pmdc number
        // if (verify_pmdc_number.length > 0) {
        //     return res.status(409).json({
        //         msg: "error",
        //         response: "Pmdc Number already exists"
        //     });
        // }

        // get specialization id from specialization modal
        let spec_id = await specialization_modal
            .find({ id: req.body.specialization });

        // check specialization name is not found
        if (spec_id.length == 0) {
            return res.status(412).json({ msg: "error", response: "Specialization not found" })
        }

        const filter = { phone_number: req.body.phone_number };

        // doctor data object
        let user_data = {
            user_id: user_final_id,
            role: req.body.role_id,
            name: req.body.name,
            avatar: live_url,
            gender: req.body.gender,
            is_number_verified: 0,
            is_verified: 0,
            specialization: spec_id[0].name,
            specialization_id: spec_id[0].id,
            pmdc_number: req.body.pmdc_number,
            is_active: 1,
            device_token: "null",
            referral_code: referral_code.toLowerCase(),
            experience: req.body.experience,
            connectycube_email: connectycube_email,
            connectycube_full_name: connectycube_full_name,
            connectycube_id: connectycube_id,
            connectycube_login: connectycube_login,
            connectycube_password: connectycube_password,
            created_at: moment().format(),
            deleted_at: null,
        };


        // update specialization 
        let doc = await UserModel.updateOne(filter, user_data, {
            returnOriginal: false
        });

        // qualification data 
        if (qualification.length > 0) {
            for (let i = 0; i < qualification.length; i++) {

                let qualification_final_id = 0;
                let qualification_count = await doctor_qualification_model.findOne({}).sort({ qualification_id: -1 });
                if (qualification_count == null) {
                    qualification_final_id = 1;
                } else {
                    qualification_final_id = parseInt(qualification_count.qualification_id) + 1;
                }

                let qualification_obj = {
                    qualification_id: qualification_final_id,
                    doctor_id: user_final_id,
                    qualification_name: qualification[i].degree,
                    university_name: qualification[i].university
                }

                await new doctor_qualification_model(qualification_obj).save();
            }
        }

        // response send
        return res.status(200).json({ msg: "Success", response: "Doctor Insert Successfully" })
    } catch (error) {
        res.status(500).json({ msg: "error", response: error.message })
        console.log(error);
    }
}

exports.doctor_unavailable = async (req, res, next) => {
    try {
        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let cron_status = true
        const patient_id = req.body.patient_id
        const doctor_id = req.body.doctor_id

        const patient_details = await UserModel.find({ user_id: patient_id, role: 1, is_active: 1 })
        const doctor_details = await UserModel.find({ user_id: doctor_id, role: 2, is_verified: 1, is_number_verified: 1 })

        if (patient_details.length == 0) {
            return res.status(409).json({ msg: "error", response: "patient is not exists" })
        }

        if (doctor_details.length == 0) {
            return res.status(409).json({ msg: "error", response: "doctor is not exists" })
        }
        res.status(200).json({ msg: "success", response: "after 20 minutes query send to support team" })

        setTimeout(function () {
            const testing = new CronJob({
                // Run at 05:00 Central time, only on weekdays
                cronTime: '0 */1 * * * *',
                onTick: async function () {
                    let final_st_count = 0
                    let st_last_id = await support_team_modal.findOne().sort({ st_id: -1 });

                    if (st_last_id == null) {
                        final_st_count = 1;
                    }
                    else {
                        final_st_count = parseInt(st_last_id.st_id) + 1
                    }

                    let support_team_obj = {
                        st_id: final_st_count,
                        patient_id: patient_id,
                        doctor_id: doctor_id,
                        patient_name: patient_details[0].name,
                        doctor_name: doctor_details[0].name,
                        module_name: 'chat',
                        issue_type: "Doctor Unavailable"
                    }

                    await new support_team_modal(support_team_obj).save()
                    cron_status = false

                    if (cron_status == false) {
                    }

                    // cron_status == true ? 'true condition is running' : 'false condition is running'
                },
                start: true
            });
        }, 1000);


        // push notification send to patient coming soon


    } catch (error) {

        // error logs
        // common.error_log(req.header.device_token, req.user.name, 'doclink dashboard admin panel', 'doctor/add_new_doctor', error.message, "http://3.252.226.91:3100/")
        res.status(500).json({ msg: "error", response: error.message })
        console.log(error);
    }
}

exports.doctor_update = async (req, res, next) => {
    try {
        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        console.log('+==================');
        console.log(req.body);
        const doctor_id = req.body.doctor_id
        let live_url = '';
        const name = req.body.name
        const connectycube_email = req.body.connectycube_email;
        const connectycube_full_name = req.body.connectycube_full_name;
        const connectycube_id = req.body.connectycube_id;
        const connectycube_login = req.body.connectycube_login;
        const connectycube_password = req.body.connectycube_password;
        const experience = req.body.experience
        const pmdc_number = req.body.pmdc_number
        const gender = req.body.gender
        const specialization_id = req.body.specialization_id;
        const doctor_profile = await UserModel.find({ role: 2, is_verified: 1, is_number_verified: 1, user_id: doctor_id });
        const qualification = JSON.parse(req.body.qualification);
        const spec_name = await specialization_modal.findOne({ id: specialization_id, is_active: 1 })

        if (doctor_profile.length == 0) {
            return res.status(412).json({ msg: "error", response: "doctor id is not found" })
        }
        if (typeof req.file !== 'undefined') {
            live_url = 'http://3.252.226.91:3500/' + req.file.path
        }

        const filter = { user_id: doctor_id };

        // doctor data object
        let user_data = {
            gender: gender,
            name: name,
            experience: experience,
            pmdc_number: pmdc_number,
            specialization_id: specialization_id,
            specialization: spec_name.name,
            updated_at: moment().format()
        };

        if (live_url != '') {
            user_data['avatar'] = live_url;
        }

        if (connectycube_email != '') {
            user_data['connectycube_email'] = connectycube_email;
            user_data['connectycube_full_name'] = connectycube_full_name;
            user_data['connectycube_id'] = connectycube_id;
            user_data['connectycube_password'] = connectycube_password;
            user_data['connectycube_login'] = connectycube_login;
        }


        // qualification data 
        if (qualification.length > 0) {
            await doctor_qualification_model.deleteMany({ doctor_id: doctor_id, is_active: 1 })
            for (let i = 0; i < qualification.length; i++) {

                let qualification_final_id = 0;
                let qualification_count = await doctor_qualification_model.findOne({}).sort({ qualification_id: -1 });
                if (qualification_count == null) {
                    qualification_final_id = 1;
                } else {
                    qualification_final_id = parseInt(qualification_count.qualification_id) + 1;
                }

                let qualification_obj = {
                    qualification_id: qualification_final_id,
                    doctor_id: doctor_id,
                    qualification_name: qualification[i].degree,
                    university_name: qualification[i].institude
                }

                await new doctor_qualification_model(qualification_obj).save();
            }
        }

        // update doctor 
        let doc = await UserModel.updateOne(filter, user_data, {
            returnOriginal: false
        });
        const doctor_details = await UserModel.find({ user_id: doctor_id, role: 2, is_active: 1 })
        res.status(200).json({ msg: "success", response: doctor_details })
    } catch (error) {

        // error logs
        // common.error_log(req.header.device_token, req.user.name, 'doclink dashboard admin panel', 'doctor/add_new_doctor', error.message, "http://3.252.226.91:3100/")
        res.status(500).json({ msg: "error", response: error.message })
        console.log(error);
    }
}

exports.doctor_update = async (req, res, next) => {
    try {
        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        console.log('+==================');
        console.log(req.body);
        const doctor_id = req.body.doctor_id
        let live_url = '';
        const name = req.body.name
        const connectycube_email = req.body.connectycube_email;
        const connectycube_full_name = req.body.connectycube_full_name;
        const connectycube_id = req.body.connectycube_id;
        const connectycube_login = req.body.connectycube_login;
        const connectycube_password = req.body.connectycube_password;
        const experience = req.body.experience
        const pmdc_number = req.body.pmdc_number
        const gender = req.body.gender
        const specialization_id = req.body.specialization_id;
        const doctor_profile = await UserModel.find({ role: 2, is_verified: 1, is_number_verified: 1, user_id: doctor_id });
        const qualification = JSON.parse(req.body.qualification);
        const spec_name = await specialization_modal.findOne({ id: specialization_id, is_active: 1 })

        if (doctor_profile.length == 0) {
            return res.status(412).json({ msg: "error", response: "doctor id is not found" })
        }
        if (typeof req.file !== 'undefined') {
            live_url = 'http://3.252.226.91:3500/' + req.file.path
        }

        const filter = { user_id: doctor_id };

        // doctor data object
        let user_data = {
            gender: gender,
            name: name,
            experience: experience,
            pmdc_number: pmdc_number,
            specialization_id: specialization_id,
            specialization: spec_name.name,
            updated_at: moment().format()
        };

        if (live_url != '') {
            user_data['avatar'] = live_url;
        }

        if (connectycube_email != '') {
            user_data['connectycube_email'] = connectycube_email;
            user_data['connectycube_full_name'] = connectycube_full_name;
            user_data['connectycube_id'] = connectycube_id;
            user_data['connectycube_password'] = connectycube_password;
            user_data['connectycube_login'] = connectycube_login;
        }


        // qualification data 
        if (qualification.length > 0) {
            await doctor_qualification_model.deleteMany({ doctor_id: doctor_id, is_active: 1 })
            for (let i = 0; i < qualification.length; i++) {

                let qualification_final_id = 0;
                let qualification_count = await doctor_qualification_model.findOne({}).sort({ qualification_id: -1 });
                if (qualification_count == null) {
                    qualification_final_id = 1;
                } else {
                    qualification_final_id = parseInt(qualification_count.qualification_id) + 1;
                }

                let qualification_obj = {
                    qualification_id: qualification_final_id,
                    doctor_id: doctor_id,
                    qualification_name: qualification[i].degree,
                    university_name: qualification[i].institude
                }

                await new doctor_qualification_model(qualification_obj).save();
            }
        }

        // update doctor 
        let doc = await UserModel.updateOne(filter, user_data, {
            returnOriginal: false
        });
        const doctor_details = await UserModel.find({ user_id: doctor_id, role: 2, is_active: 1 })
        res.status(200).json({ msg: "success", response: doctor_details })
    } catch (error) {

        // error logs
        // common.error_log(req.header.device_token, req.user.name, 'doclink dashboard admin panel', 'doctor/add_new_doctor', error.message, "http://3.252.226.91:3100/")
        res.status(500).json({ msg: "error", response: error.message })
        console.log(error);
    }
}





