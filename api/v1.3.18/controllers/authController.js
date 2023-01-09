const moment = require('moment');
const UserModel = require("../auth/UserModel");
const jwt = require('jsonwebtoken');
const roles_modal = require('../model/roles_modal')
const { body, query, validationResult } = require('express-validator');
import { parsePhoneNumberFromString } from 'libphonenumber-js';
const jwt_secret = 'doclink-mobile-api';
const user_fcm_token_model = require('../model/user_fcm_token_model')

exports.mobile = async (req, res, next) => {
    try {
        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

       
        console.log('*********************');
        console.log(req.body);
        // intializa all variables  
        var mobile = req.body.mobile ? req.body.mobile : ""
        var fcm_token = req.body.fcm_token ? req.body.fcm_token : ""
        var role_id = req.body.role_id ? req.body.role_id : ""
        var device_identifier = req.body.device_identifier ? req.body.device_identifier : ""
        var device_token = req.body.device_token ? req.body.device_token : ""
        var device_brand = req.body.device_brand ? req.body.device_brand : ""
        var device_model = req.body.device_model ? req.body.device_model : ""
        var app_version = req.body.app_version ? req.body.app_version : ""
        var device_os = req.body.device_os ? req.body.device_os : ""
        var device_name = req.body.device_name ? req.body.device_name : ""
        var platform = req.body.platform ? req.body.platform : ""
        var flavor = req.body.flavor ? req.body.flavor : ""
        var device_type = req.body.device_type ? req.body.device_type : ""
        let final_user_id = 0;
        let is_register = true;
        let is_basic_profile_update = 0
        let doctor_status = ''


        // parsing phone number 
        const phoneNumber = parsePhoneNumberFromString(mobile, 'PK');
        if (phoneNumber.isValid() == false) {
            return res.status(201).json({ error: 0, status: 'Error', message: 'Incorrect number.', data: [] });
        }

        let nationalNumber = "0" + phoneNumber.nationalNumber
        let number = phoneNumber.number
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';


        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < charactersLength; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        let access_token = result;
        // check role present 
        const roles = await roles_modal.find({ roles_id: role_id });
        if (roles.length == 0) {
            return res.status(400).json({ error: 'No Role Found' });
        }

        // check user already exists
        var isMobileNumberExists = await UserModel.findOne({ phone_number: number, role: role_id, is_active: 1 })

        // working on patient 
        if (!isMobileNumberExists) {
            // if (role_id == 2) {
            //     return res.status(201).json({
            //         error: 1, status: 'Error', message: 'Your number is not registered. If you think this is an error, please reach out to us at hello@doclink.health', data: []
            //     });
            // }
            is_register = false;
            // add new user params
            let params_new_user = {
                'phone_number': number,
                'avatar': global.IMAGE_BASE_URL_NEW + "dummy.png",
                'platform': platform,
                'device_brand': device_brand,
                'device_model': device_model,
                'device_name': device_name,
                'app_version': app_version,
                'device_type': device_type,
                'device_os': device_os,
                'device_identifier': device_identifier,
                'device_token': device_token,
                'access_token': access_token,
                'created_at': moment().format(),
                'role': role_id
            }

            if (role_id == 1) {
                let arrMRN = await UserModel.findOne({ role: role_id }).select("mrn")
                let mrn = (arrMRN) ? parseInt(arrMRN.mrn) + 1 : 1;
                params_new_user['mrn'] = mrn
            }


            let arrUserId = await UserModel.findOne({}).select("user_id").sort({ user_id: -1 });
            let user_id = (arrUserId) ? arrUserId.user_id + 1 : 1;
            params_new_user['user_id'] = user_id


            final_user_id = user_id;
            // save user data
            await new UserModel(params_new_user).save();
        }
        else {
            console.log('update condition');
            const filter = { phone_number: number, role: role_id };
            const update = {
                'access_token': access_token,
                'device_brand': device_brand,
                'device_model': device_model,
                'device_name': device_name,
                'app_version': app_version,
                'device_type': device_type,
                'device_os': device_os,
                'device_identifier': device_identifier,
                'device_token': device_token,
            };

            // update specialization 
            let doc = await UserModel.updateOne(filter, update, {
                returnOriginal: false
            });

            final_user_id = isMobileNumberExists.user_id
        }

        // jwt payload data
        var isMobileNumberExists2 = await UserModel.findOne({ phone_number: number, role: role_id, is_active: 1 })
        const data = {
            user: isMobileNumberExists2
        }

        await user_fcm_token_model.deleteMany({ user_id: final_user_id })
        let fcm_details = {
            device_token: device_token,
            fcm_token: fcm_token,
            user_id: final_user_id
        }

        await new user_fcm_token_model(fcm_details).save()
        // generating auth token
        const auth_token = await jwt.sign(data, jwt_secret);
        console.log('auth_token', auth_token);
        const user_detail = await UserModel.findOne({ user_id: final_user_id });
        const doctor_detail = await UserModel.findOne({ phone_number: number, role: role_id, is_active: 1 });

        if (doctor_detail.is_number_verified == 1 && doctor_detail.is_verified == 1) {
            doctor_status = 'approved'
        }
        else if (doctor_detail.is_number_verified == 0 && doctor_detail.is_verified == 0) {
            doctor_status = 'pending'
        }
        else if (doctor_detail.is_number_verified == 2 && doctor_detail.is_verified == 2) {
            doctor_status = 'rejected'
        }

        if (typeof isMobileNumberExists2.name != 'undefined') {
            is_basic_profile_update = 1
        }

        return res.status(200).json({
            error: 0, status: 'Success', data: {
                "auth_code": auth_token,
                "is_already_registered": is_register,
                "is_verified": user_detail.is_verified,
                "is_number_verified": user_detail.is_number_verified,
                "skip_at": user_detail.skip_at,
                "flavour": flavor,
                "doctor_status": doctor_status,
                "connecty_cube": typeof (doctor_detail.connectycube_email) == 'undefined' || doctor_detail.connectycube_email == 'undefined' ? 0 : 1,
                "rejected_comment": doctor_detail.rejected_comment,
                "is_basic_profile_update": is_basic_profile_update,
                "user_obj": user_detail,
                'access_token': access_token
            }
        });
    } catch (error) {
        console.log(error);
        res.send(error);
    }
}

exports.public_patient_fcm_token = async (req, res, next) => {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // intializa all variables

        var device_token = req.body.device_token ? req.body.device_token : ""
        var fcm_token = req.body.fcm_token ? req.body.fcm_token : ""
        let response = ''
        let fcm_token_exists = await user_fcm_token_model.find({ device_token: device_token, is_active: 1 })

        if (fcm_token_exists.length == 0) {
            let fcm_details = {
                device_token: device_token,
                fcm_token: fcm_token
            }

            await new user_fcm_token_model(fcm_details).save()
            response = 'public patient fcm add successfully'
        }
        else {
            const filter = { device_token: device_token };
            const update = { fcm_token: fcm_token };

            // update specialization 
            let doc = await user_fcm_token_model.updateOne(filter, update, {
                returnOriginal: false
            });
            response = 'public patient fcm update successfully'
        }

        return res.status(200).json({ msg: "success", response: response })
    } catch (error) {
        res.send(error);
    }
}

exports.update_connecty_cube = async (req, res, next) => {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const connectycube_email = req.body.connectycube_email
        const connectycube_full_name = req.body.connectycube_full_name
        const connectycube_id = req.body.connectycube_id
        const connectycube_login = req.body.connectycube_login
        const connectycube_password = req.body.connectycube_password
        const user_id = req.body.user_id

        const filter = { user_id: user_id };
        const update = {
            connectycube_email: connectycube_email,
            connectycube_full_name: connectycube_full_name,
            connectycube_id: connectycube_id,
            connectycube_login: connectycube_login,
            connectycube_password: connectycube_password
        };

        // update user details 
        let doc = await UserModel.updateOne(filter, update, {
            returnOriginal: false
        });

        const user_details = await UserModel.findOne({ user_id: user_id })
        return res.status(200).json({ msg: "success", response: user_details })

    } catch (error) {
        console.log(error);
        res.send(error);
    }
}

exports.logout = async (req, res, next) => {
    try {

        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const check_user = await UserModel.find({ user_id: req.body.user_id, is_active: 1 })
        if (check_user.length == 0) {
            return res.status(409).json({ msg: "error", response: "user not found" })
        }

        // await user_fcm_token_model.deleteMany({ user_id: req.body.user_id })

        return res.status(200).json({ msg: "success", response: "logout successfully" })

    } catch (error) {
        console.log(error);
        res.send(error);
    }
}
