const { body, query, validationResult } = require('express-validator');
const UserModel = require('../auth/UserModel');
const chatrooms = require('../model/chatrooms_model');
const ChatSession = require('../model/chatroom_sessions_model')
const common = require('../../../helpers/common');
const medical_records_model = require('../model/medical_records_model');
const medical_records_data_model = require('../model/medical_records_data');
const type_of_records = require('../model/type_records_modal');
const doctor_qualification_model = require('../model/doctor_qualification_model')
const doctor_services_model = require('../model/doctor_services_model')
const multer = require('multer');
const rating_reviews = require('../model/rating_reviews_model');
const endorsed_modal = require('../model/endorsment_modal')
let final_medical_record_id = 0;
// secret jwt token
exports.view_type_of_records = async (req, res, next) => {
    try {
        const types_of_records = await type_of_records.find({ is_active: 1 })
        let all_type_records = []
        for (let i = 0; i < types_of_records.length; i++) {
            let records_obj = {
                "is_active": types_of_records[i].is_active,
                "created_at": types_of_records[i].created_at,
                "tr_id": types_of_records[i].tr_id,
                "record_name": types_of_records[i].record_name,
                "record_image": `http://3.252.226.91:3100/uploads/medical_records/${types_of_records[i].record_image}`,
            }
            all_type_records.push(records_obj)
        }
        return res.status(200).json({ msg: "success", response: all_type_records })
    } catch (error) {
        return res.status(500).json({ msg: "error", response: error.message })
    }
}

exports.add_medical_records = async (req, res, next) => {
    try {
        console.log('medical records is runnings');
        const record_for = req.body.record_for
        const record_date = req.body.record_date
        const record_name = req.body.record_name
        const tr_id = req.body.tr_id
        const user_id = req.user.user_id;


        let medical_records_detail = {
            mr_id: final_medical_record_id,
            user_id: user_id,
            tr_id: tr_id,
            record_for: record_for,
            record_name: record_name,
            record_date: record_date,
        }

        await new medical_records_model(medical_records_detail).save();
        return res.status(200).json({ msg: "success", response: "medical records save successfully" })

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ msg: "error", response: error.message })
    }
}

exports.view_medical_records = async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        console.log('==============user_id');
        console.log(user_id);
        const medical_records_details = await medical_records_model.find({ user_id: user_id, is_active: 1 })
        const all_medical_record = []
        console.log('===================');
        console.log(medical_records_details);
        for (let i = 0; i < medical_records_details.length; i++) {

            let medical_record_file_data = await medical_records_data_model.findOne({ mr_id: medical_records_details[i].mr_id }).limit(1);
            let record_type = await type_of_records.findOne({ tr_id: medical_records_details[i].tr_id });

            let all_medical_records = {
                mr_id: medical_records_details[i].mr_id,
                record_name: medical_records_details[i].record_name,
                record_date: medical_records_details[i].record_date,
                record_for: medical_records_details[i].record_for,
                image: `http://3.252.226.91:3500/uploads/${medical_record_file_data.file_path}`,
                file_type: medical_record_file_data.file_type,
                record_type: record_type.record_name,
                file_shared: 0,
                edited: medical_records_details[i].updated_at == null ? 0 : 1,
            }
            all_medical_record.push(all_medical_records)
        }
        return res.status(200).json({ msg: "success", response: all_medical_record })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "error", response: error.message })
    }
}

exports.view_all_medical_reports = async (req, res, next) => {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let medical_records_arr = []
        let final_medical_details = []
        const mr_id = req.query.mr_id;
        const medical_records = await medical_records_model.find({ is_active: 1, mr_id: mr_id })
        const medical_records_data_details = await medical_records_data_model.find({ is_active: 1, mr_id: mr_id })
        const record_type = await type_of_records.findOne({ tr_id: medical_records[0].tr_id })
        const medical_records_obj = {
            "is_active": medical_records[0].is_active,
            "created_at": medical_records[0].created_at,
            "updated_at": medical_records[0].updated_at,
            "mr_id": medical_records[0].mr_id,
            "user_id": medical_records[0].user_id,
            "record_type": record_type.record_name,
            "record_for": medical_records[0].record_for,
            "record_name": medical_records[0].record_name,
            "record_date": medical_records[0].record_date,
            "file_shared": 0, medical_records_obj
        }
        medical_records_arr.push(medical_records_obj)

        for (let i = 0; i < medical_records_data_details.length; i++) {
            let data_details = {
                "is_active": medical_records_data_details[i].is_active,
                "created_at": medical_records_data_details[i].created_at,
                "mrd_id": medical_records_data_details[i].mrd_id,
                "mr_id": medical_records_data_details[i].mr_id,
                "file_path": `http://3.252.226.91:3500/uploads/${medical_records_data_details[i].file_path}`,
                "file_type": medical_records_data_details[i].file_type
            }
            final_medical_details.push(data_details)
        }
        return res.status(200).json({ msg: "success", response: final_medical_details, medical_records: medical_records_arr })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "error", response: error.message })
    }
}

exports.edit_medical_records = async (req, res, next) => {
    try {

        const mr_id = req.body.mr_id
        const record_for = req.body.record_for
        const record_date = req.body.record_date
        const record_name = req.body.record_name
        const tr_id = req.body.tr_id
        const user_id = req.user.user_id;

        // delete all previous medical records and medical record data
        await medical_records_model.deleteMany({ mr_id: mr_id })
        await medical_records_data_model.deleteMany({ mr_id: mr_id })

        let medical_records_detail = {
            mr_id: final_medical_record_id,
            user_id: user_id,
            tr_id: tr_id,
            record_for: record_for,
            record_name: record_name,
            record_date: record_date,
        }

        await new medical_records_model(medical_records_detail).save();
        return res.status(200).json({ msg: "success", response: "medical records update successfully" })

    } catch (error) {
        return res.status(500).json({ msg: "error", response: error.message })
    }
}

exports.delete_medical_records = async (req, res, next) => {
    try {

        const mr_id = req.body.mr_id

        // delete all previous medical records and medical record data
        await medical_records_model.deleteMany({ mr_id: mr_id })
        await medical_records_data_model.deleteMany({ mr_id: mr_id });

        return res.status(200).json({ msg: "success", response: "medical records delete successfully" })

    } catch (error) {
        return res.status(500).json({ msg: "error", response: error.message })
    }
}

exports.connected_doctors = async (req, res, next) => {
    try {
        const user_id = req.user.user_id
        let user_data = '';
        let total_rating = 0;
        let all_over_rating = 0;
        const all_doctor_id = await chatrooms.find({ patient_id: user_id }).distinct('doctor_id');
        const doctors = await UserModel.find({ user_id: { $in: all_doctor_id }, role: 2, is_active: 1, is_verified: 1 })
        let data = []
        console.log('all_doctor_id', all_doctor_id);
        // if name is defined
        if (req.query.name) {
            user_data = await UserModel
                .find({
                    name: { $regex: req.query.name, $options: "i" },
                    user_id: { $in: all_doctor_id },
                    role: 2,
                    is_active: 1,
                    is_verified: 1
                }).sort({ user_id: -1 })
        } else {
            // if name is not defined
            user_data = await UserModel
                .find({
                    role: 2, is_active: 1, is_verified: 1, user_id: { $in: all_doctor_id }
                }).sort({ user_id: -1 })
        }

        for (let i = 0; i < user_data.length; i++) {
            let user_detail = await UserModel.findOne({ user_id: user_data[i].user_id, role: 2, is_active: 1, is_verified: 1, });
            let qualification = await doctor_qualification_model.find({ doctor_id: user_data[i].user_id })
            let services = await doctor_services_model.find({ doctor_id: user_data[i].user_id })
            const all_over_ratings = await rating_reviews.find({ doctor_id: user_data[i].user_id, status: 1 }).sort({ rr_id: -1 });
            if (all_over_ratings.length > 0) {
                for (let i = 0; i < all_over_ratings.length; i++) {
                    total_rating += all_over_ratings[i].stars
                }

                if (all_over_ratings.length > 0) {
                    all_over_rating = parseInt(total_rating) / parseInt(all_over_ratings.length)
                }
            }
            let endorsement = await endorsed_modal.find({ endors_to: user_data[i].user_id })
            let user_data_obj = {
                user_data: user_detail,
                qualification: qualification,
                services: services,
                all_over_rating: all_over_rating.toFixed(1),
                all_over_endorsement: endorsement.length
            }
            data.push(user_data_obj)
            all_over_rating = 0
            total_rating = 0
        }

        console.log('data');
        return res.status(200).json({
            msg: "success", response: data, total: data.length,
            complete_data: doctors.length
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "error", response: error.message })
    }
}

exports.share_medical_records = async (req, res, next) => {
    try {
        const user_id = req.user.user_id
        console.log('user_id===========', user_id);
        const doctor_id = req.body.doctor_id;
        const mr_id = req.body.mr_id
        let data = [];
        console.log('doctor_id', doctor_id);
        if (doctor_id.length > 0) {
            for (let i = 0; i < doctor_id.length; i++) {
                let chatroom_detail = await chatrooms.findOne({ doctor_id: doctor_id[i], patient_id: user_id })
                let user_details = await UserModel.findOne({ user_id: doctor_id[i] })
                console.log('chatroom_detail.chatroom_id', chatroom_detail.chatroom_id);
                let get_session_id = await ChatSession.findOne({ chatroom_id: chatroom_detail.chatroom_id }).limit(1).sort({ sessionId: -1 })

                common.createMessageMutation(mr_id.toString(), chatroom_detail.patient_id, chatroom_detail.doctor_id, "text", chatroom_detail.chatroom_id, get_session_id == null ? 0 : get_session_id.sessionId, "patient")

                let medical_record_obj = {
                    chatroom_detail: chatroom_detail,
                    user_details: user_details,
                    message: {
                        mr_id: mr_id.toString(),
                        patient_id: chatroom_detail.patient_id,
                        doctor_id: chatroom_detail.doctor_id,
                        message_type: "text",
                        app_user: "patient",
                        chatroom_id: chatroom_detail.chatroom_id,
                        session_id: get_session_id == null ? 0 : get_session_id.sessionId
                    }

                }

                data.push(medical_record_obj)
            }
        }
        else {
            return res.status(409).json({ msg: "success", response: "No doctor found to share medical records" })
        }

        console.log(req.body.doctor_id);
        return res.status(200).json({ msg: "success", response: data })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "error", response: error.message })
    }
}

exports.share_single_medical_records = async (req, res, next) => {
    try {
        const user_id = req.user.user_id
        console.log('user_id===========', user_id);
        const doctor_id = req.body.doctor_id;
        const mrd_id = req.body.mrd_id
        let data = [];
        console.log('doctor_id', doctor_id);
        if (doctor_id.length > 0) {
            for (let i = 0; i < doctor_id.length; i++) {
                let chatroom_detail = await chatrooms.findOne({ doctor_id: doctor_id[i], patient_id: user_id })
                let user_details = await UserModel.findOne({ user_id: doctor_id[i] })
                console.log('chatroom_detail.chatroom_id', chatroom_detail.chatroom_id);
                let get_session_id = await ChatSession.findOne({ chatroom_id: chatroom_detail.chatroom_id }).limit(1).sort({ sessionId: -1 })
                console.log('get_session_id+++++++++++');
                console.log(get_session_id);
                if (get_session_id != null) {
                    for (let i = 0; i < mrd_id.length; i++) {
                        const mrd_detail = await medical_records_data_model.findOne({ mrd_id: mrd_id[i], is_active: 1 })
                        common.createMessageMutation('image', chatroom_detail.patient_id, chatroom_detail.doctor_id, mrd_detail.file_type == 'application/pdf' ? "pdf" : "image", chatroom_detail.chatroom_id, get_session_id.sessionId, "patient", `http://3.252.226.91:3500/uploads/${mrd_detail.file_path}`)
                        let medical_record_obj = {
                            chatroom_detail: chatroom_detail,
                            user_details: user_details,
                            message: {
                                mr_id: mrd_id[i].toString(),
                                patient_id: chatroom_detail.patient_id,
                                doctor_id: chatroom_detail.doctor_id,
                                message_type: "text",
                                app_user: "patient",
                                chatroom_id: chatroom_detail.chatroom_id,
                                session_id: get_session_id.sessionId,
                                local_url: `http://3.252.226.91:3500/uploads/${mrd_detail.file_path}`
                            }

                        }

                        data.push(medical_record_obj)
                    }
                }
                else {
                    console.log('condition 2');
                    res.status(409).json({ msg: "error", response: "cannot share medical records session not found" })
                }



            }
        }
        else {
            return res.status(409).json({ msg: "success", response: "No doctor found to share medical records" })
        }

        console.log(req.body.doctor_id);
        return res.status(200).json({ msg: "success", response: data })
    } catch (error) {
        return res.status(500).json({ msg: "error", response: error.message })
    }
}








