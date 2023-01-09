const moment = require('moment');
const { body, query, validationResult } = require('express-validator');
const user_model = require('../auth/UserModel')
const multer = require('multer');
const user_fcm_token_model = require('../model/user_fcm_token_model');
var FCM = require('fcm-node');
const UserModel = require('../auth/UserModel');

exports.patient_profile = async (req, res, next) => {
    try {
        console.log('patient_profile');
        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        console.log('=================');
        console.log(req.body);
        let live_url = '';
        let name = req.body.name;
        let email = req.body.email;
        let user_id = req.user.user_id;
        let connectycube_email = req.body.connectycube_email;
        let connectycube_full_name = req.body.connectycube_full_name;
        let connectycube_id = req.body.connectycube_id;
        let connectycube_login = req.body.connectycube_login;
        let connectycube_password = req.body.connectycube_password;
        let emergency_contact = req.body.emergency_contact;
        let dob = req.body.dob;
        let blood_group = req.body.blood_group;
        let gender = req.body.gender
        let martial_status = req.body.martial_status
        let patient_exists = await user_model.find({ user_id: user_id, role: 1, is_active: 1 })
        console.log('patient_exists');
        console.log(patient_exists.length);
        if (name == '') {
            return res.status(412).json({ msg: "error", response: "name is required" })
        }

        if (patient_exists.length == 0) {
            return res.status(400).json({ msg: "error", response: "patient did not exists" })
        }

        if (typeof req.file !== 'undefined') {
            live_url = 'http://3.252.226.91:3500/' + req.file.path
        }

        const filter = { user_id: user_id };
        const update = {
            name: name,
            email: email,
            dob: dob,
            gender: gender,
            emergency_contact: emergency_contact,
            martial_status: martial_status,
            blood_group: blood_group,
        };

        if (connectycube_email != '') {
            update['connectycube_email'] = connectycube_email;
            update['connectycube_full_name'] = connectycube_full_name;
            update['connectycube_id'] = connectycube_id;
            update['connectycube_login'] = connectycube_login;
            update['connectycube_password'] = connectycube_password;
        }

        if (live_url != '') {
            update['avatar'] = live_url;
        }

        // update patient profile 
        let doc = await user_model.updateOne(filter, update, {
            returnOriginal: false
        });

        const user_detail = await UserModel.findOne({ role: 1, user_id: user_id })
        res.status(200).json({ msg: "success", response: user_detail })
    } catch (error) {
        res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.send_notification = async (req, res, next) => {
    try {
        let title = req.body.notificaiton_data.title
        let body = req.body.notificaiton_data.body
        var serverKey = 'AAAAdinDe4s:APA91bF3CQRc4i9s4l9MoqmSIxWd_5nEyNiYz6j9KqC8mSfFdBgHQOqstSpRfWhRWU4WpJL3-N0IzZUdi17EHESeVgoZfNOJojA66GrtwCTAx33QiYmUQLkddf69z9a8PZZukuU7EAEK';
        var fcm = new FCM(serverKey);
        let user_id = parseInt(req.body.user_id)
        console.log('==========', user_id);
        let { fcm_token } = await user_fcm_token_model.findOne({ user_id: user_id }).select('fcm_token');
        console.log(fcm_token);
        console.log(req.body);

        var message = {
            to: fcm_token,
            notification: {
                title: title,
                body: body,
            },

            data: { //you can send only notification or only data(or include both)
                title: title,
                body: req.body
            }

        };

        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Something has gone wrong!" + err);
                console.log("Respponse:! " + response);
            } else {
                // showToast("Successfully sent with response");
                console.log("Successfully sent with response: ", response);
            }

        });

    } catch (error) {
        // common.error_log(req.user._id, req.user.name, 'doclink-mobile-app-backend', 'profile/patient_profile', error.message, "http://3.252.226.91:3100/")
        res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}

exports.send_notification_for_rest_api = async (req, res, next) => {
    try {
        let title = req.body.notificaiton_data.title
        let body = req.body.notificaiton_data.body
        var serverKey = 'AAAAdinDe4s:APA91bF3CQRc4i9s4l9MoqmSIxWd_5nEyNiYz6j9KqC8mSfFdBgHQOqstSpRfWhRWU4WpJL3-N0IzZUdi17EHESeVgoZfNOJojA66GrtwCTAx33QiYmUQLkddf69z9a8PZZukuU7EAEK';
        var fcm = new FCM(serverKey);
        let user_id = req.body.user_id

        let { fcm_token } = await user_fcm_token_model.findOne({ user_id: user_id }).select('fcm_token');
        console.log(fcm_token);
        console.log(req.body);

        var message = {
            to: fcm_token,
            priority: "high",
            notification: {
                title: title,
                body: body,
                priority: "high",
            },

            data: { //you can send only notification or only data(or include both)
                title: title,
                body: req.body,
                priority: "high",
            },


        };

        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Something has gone wrong!" + err);
                console.log("Respponse:! " + response);
            } else {
                // showToast("Successfully sent with response");
                console.log("Successfully sent with response: ", response);
            }

        });

    } catch (error) {
        // common.error_log(req.user._id, req.user.name, 'doclink-mobile-app-backend', 'profile/patient_profile', error.message, "http://3.252.226.91:3100/")
        res.status(500).json({ msg: error, response: error.message })
        console.log(error);
    }
}



