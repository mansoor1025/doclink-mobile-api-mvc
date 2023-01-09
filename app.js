const express = require('express');
const common = require('./helpers/common');
const ChatRequest = require('./api/v1.3.18/model/chatrequests')
const ChatSession = require('./api/v1.3.18/model/chatroom_sessions_model')
const User = require('./api/v1.3.18/auth/UserModel')
const Message = require('./api/v1.3.18/model/message_model');
const video_chatroom_model = require('./api/v1.3.18/model/video_chatroom_model')
const support_team = require('./api/v1.3.18/model/support_team_modal')
const reschedule_chat = require('./api/v1.3.18/model/reschedule_chat_model')
const patient_accept_model = require('./api/v1.3.18/model/patient_accept_model')
const { body, query, validationResult } = require('express-validator');
const CronJob = require('cron').CronJob;
const app = express();
const mongoose = require("mongoose");
const server = require("http").createServer(app)
const path = require('path');
const UserModel = require('./api/v1.3.18/auth/UserModel');
const chatrooms_model = require('./api/v1.3.18/model/chatrooms_model');
const medication_notifications_model = require('./api/v1.3.18/model/medication_notification_model');
const followup_model = require('./api/v1.3.18/model/follow_up_model');
const moment = require('moment');
const bodyParser = require('body-parser');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname == 'audio') {
      cb(null, './uploads/audio');
    }
    else {

      cb(null, './uploads/images');
    }
  },
  filename: function (req, file, cb) {

    var string = file.originalname;
    string = string.replace(/ /g, "_");
    cb(null, moment().format('YYYY-MM-DD') + '_' + string);
  }
})
const upload = multer({ storage: storage });
process.env.TZ = 'Asia/Karachi';

require('./helpers/extension');
require('./config/config.js');
require('dotenv').config();


app.get('/requestVideoCall', [
  query('username', 'username is required').exists(),
  query('doctor_id', 'doctor_id is required').exists(),
  query('patient_id', 'patient_id is required').exists(),
  query('request_by', 'request_by is required').exists()
], async (req, res, next) => {
  try {
    // check all required fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const doctor_id = req.query.doctor_id
    const patient_id = req.query.patient_id
    const request_by = req.query.request_by
    const { chatroom_id } = await chatrooms_model.findOne({ doctor_id: doctor_id, patient_id: patient_id }).select('chatroom_id')
    let chat_request_status = await ChatRequest.find({ chatroom_id: chatroom_id, status: 'accepted' }).limit(1).sort({ chatRequestId: -1 })


    const accessToken = new AccessToken(
      process.env.Account_SID,
      process.env.API_KEY_SID,
      process.env.API_KEY_SECRET,
    );

    let doctor_details = await UserModel.findOne({ user_id: doctor_id, role: 2 });
    let patient_details = await UserModel.findOne({ user_id: patient_id, role: 1 });

    var body_data = '';
    var request_image = ''
    var request_by_name = ''
    if (request_by == 'patient') {
      request_image = patient_details.avatar;
      request_by_name = patient_details.name
      body_data = 'Patient ' + patient_details.name + ' send you video call request'
    }
    else {
      request_image = doctor_details.avatar;
      request_by_name = doctor_details.name
      body_data = 'Doctor ' + doctor_details.name + ' send you video call request'
    }

    var room_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    var bodyParams = {
      user_id: request_by == 'patient' ? doctor_id : patient_id,
      flavor: request_by == 'patient' ? 'doctor' : 'patient',
      notificaiton_data: {
        "title": 'Incoming Video Call Reminder',
        "body": body_data,
        "sound": "default",
        "icon": "stock_ticker_update",
        "color": "#ffffff",
        "channel_id": "doclink_patient_channel",
        "default_sound": "false",
        "personal_data": { "doctor_id": doctor_id, "patient_id": patient_id, module: 'Video Call', status: 'Incoming video call', room_id: room_id, image: request_image, request_by_name: request_by_name, patient_details: patient_details, doctor_details: doctor_details },
      },
    }
    common.send_notification_for_rest_api(bodyParams)
    accessToken.identity = req.query.username;

    var grant = new VideoGrant();
    accessToken.addGrant(grant);

    // convert accessToken into jwt so that can be used in front-end
    var jwt = accessToken.toJwt();
    // return res.send(jwt);
    var total_vc_id = await video_chatroom_model.findOne().sort({ vc_id: -1 });
    var vc_id = 0;
    if (total_vc_id == null) {
      vc_id = 0 + 1;
    }
    else {
      vc_id = parseInt(total_vc_id.vc_id) + 1
    }

    let video_chatroom_obj = {
      vc_id: vc_id,
      doctor_id: doctor_id,
      patient_id: patient_id,
      chatroom_id: chatroom_id,
      chatrequest_id: chat_request_status[0].chatRequestId
    }

    await new video_chatroom_model(video_chatroom_obj).save();

    let response = {};
    response.token = jwt;
    response.doctor_id = doctor_id;
    response.patient_id = patient_id;
    response.room_id = room_id;
    response.request_by = request_by;
    response.doctor_details = doctor_details;
    response.patient_details = patient_details;
    //   return res.status(200).json(jwt);
    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: "error", message: error.message });
  }

});

app.get('/acceptVideoCall', [
  query('room_id', 'room_id is required').exists(),
  query('username', 'doctor_id is required').exists()
], async (req, res, next) => {
  try {
    // check all required fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const doctor_id = req.query.doctor_id
    const patient_id = req.query.patient_id

    const { chatroom_id } = await chatrooms_model.findOne({ doctor_id: doctor_id, patient_id: patient_id }).select('chatroom_id');
    const get_last_video_call_id = await video_chatroom_model.findOne({ status: 'pending', chatroom_id: chatroom_id }).sort({ vc_id: -1 })

    const filter = { vc_id: get_last_video_call_id.vc_id };
    const update = {
      status: 'accepted'
    }

    let doc = await video_chatroom_model.updateOne(filter, update, {
      returnOriginal: false
    });

    const accessToken = new AccessToken(
      process.env.Account_SID,
      process.env.API_KEY_SID,
      process.env.API_KEY_SECRET,
    );

    accessToken.identity = req.query.username;

    var grant = new VideoGrant();
    accessToken.addGrant(grant);

    // convert accessToken into jwt so that can be used in front-end
    var jwt = accessToken.toJwt();
    // return res.send(jwt);
    let response = {};
    response.token = jwt;
    response.room_id = req.query.room_id;
    //   return res.status(200).json(jwt);
    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: "error", message: error.message });
  }

});

app.get('/rejectVideoCall', [
  query('username', 'username is required').exists(),
  query('doctor_id', 'doctor_id is required').exists(),
  query('patient_id', 'patient_id is required').exists(),
  query('request_by', 'request_by is required').exists()
], async (req, res, next) => {
  try {
    // check all required fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const doctor_id = req.query.doctor_id
    const patient_id = req.query.patient_id
    const request_by = req.query.request_by

    const { chatroom_id } = await chatrooms_model.findOne({ doctor_id: doctor_id, patient_id: patient_id }).select('chatroom_id');
    const get_last_video_call_id = await video_chatroom_model.findOne({ status: 'pending', chatroom_id: chatroom_id }).sort({ vc_id: -1 })

    const filter = { vc_id: get_last_video_call_id.vc_id };
    const update = {
      status: 'rejected'
    }

    let doc = await video_chatroom_model.updateOne(filter, update, {
      returnOriginal: false
    });

    let doctor_details = await UserModel.findOne({ user_id: doctor_id, role: 2 });
    let patient_details = await UserModel.findOne({ user_id: patient_id, role: 1 });

    var body_data = '';
    var request_image = ''
    var request_by_name = ''
    if (request_by == 'patient') {
      request_image = patient_details.avatar;
      request_by_name = patient_details.name
      body_data = 'Patient ' + patient_details.name + ' rejected video call'
    }
    else {
      request_image = doctor_details.avatar;
      request_by_name = doctor_details.name
      body_data = 'Doctor ' + doctor_details.name + ' rejected video call'
    }

    var bodyParams = {
      user_id: request_by == 'patient' ? doctor_id : patient_id,
      flavor: request_by == 'patient' ? 'doctor' : 'patient',
      notificaiton_data: {
        "title": 'Video Call Rejected',
        "body": body_data,
        "sound": "default",
        "icon": "stock_ticker_update",
        "color": "#ffffff",
        "channel_id": "doclink_patient_channel",
        "default_sound": "false",
        "personal_data": { "doctor_id": doctor_id, "patient_id": patient_id, module: 'Video Call', status: 'video call rejected', image: request_image, request_by_name: request_by_name },
      },
    }
    common.send_notification_for_rest_api(bodyParams)
    let response = {};
    response.doctor_id = doctor_id;
    response.patient_id = patient_id;
    response.request_by = request_by;
    //   return res.status(200).json(jwt);
    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: "error", message: error.message });
  }

});

/**
 * Mongo DB Connection Create . 
 */
//  global.gConfig.config_id 

// var MONGODB_URL = process.env.LIVE_DB;

if (global.gConfig.config_id == 'staging') {
  var MONGODB_URL = process.env.LOCAL_DB
}
// cors middleware 
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static('images'));
app.use('/uploads/', express.static('uploads/'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use('/api/v1.3.18/referral_code', require('./api/v1.3.18/routes/referral_code'));
app.use('/api/v1.3.18/auth', require('./api/v1.3.18/routes/auth'));
app.use('/api/v1.3.18/stories', require('./api/v1.3.18/routes/stories'));
app.use('/api/v1.3.18/doctor', require('./api/v1.3.18/routes/doctor'));
app.use('/api/v1.3.18/subscription', require('./api/v1.3.18/routes/subscription'));
app.use('/api/v1.3.18/specialization', require('./api/v1.3.18/routes/specialization'));
app.use('/api/v1.3.18/profile', require('./api/v1.3.18/routes/profile'));
app.use('/api/v1.3.18/endorsment', require('./api/v1.3.18/routes/endorsment'));
app.use('/api/v1.3.18/doctor_screen', require('./api/v1.3.18/routes/doctor_screen'));
app.use('/api/v1.3.18/chat', require('./api/v1.3.18/routes/chat'));
app.use('/api/v1.3.18/patient', require('./api/v1.3.18/routes/patient'));
app.use('/api/v1.3.18/reviews', require('./api/v1.3.18/routes/reviews'));
app.use('/api/v1.3.18/medical_records', require('./api/v1.3.18/routes/medical_records'));
app.use('/api/v1.3.18/disease', require('./api/v1.3.18/routes/disease'));
app.use('/api/v1.3.18/health_concern', require('./api/v1.3.18/routes/health_concern'));
app.use('/api/v1.3.18/wallet', require('./api/v1.3.18/routes/wallet'));
app.use('/api/v1.3.18/video_calls', require('./api/v1.3.18/routes/video_calls'));
app.use('/api/v1.3.18/easypaisa', require('./api/v1.3.18/routes/easypaisa'));
app.use('/api/v1.3.18/doctor_wallet', require('./api/v1.3.18/routes/doctor_wallet'));
app.use('/api/v1.3.18/setting', require('./api/v1.3.18/routes/setting'));
app.use('/api/v1.3.18/labs', require('./api/v1.3.18/routes/labs'));
// app.use('/api/v1.3.18/invite_your_doctor', require('./api/v1.3.18/routes/invite_your_doctor'));

mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true, useUnifiedTopology: true,
  useFindAndModify: false, useCreateIndex: true
}).then(() => { console.log("Connected to " + MONGODB_URL) });

// image upload  
app.post('/imageupload', upload.single('image'), function (req, res, next) {
  try {

    let data = {
      final_url: 'http://3.252.226.91:3500' + '/uploads/images/' + req.file.filename,
      base_url: 'http://3.252.226.91:3500' + '/uploads/images',
      image_name: req.file.filename
    }
    res.send({ 'data': data });
  } catch (error) {
    res.status(500).json({ msg: "error", message: error.message })
    console.log(error);
  }

});

// audio upload
app.post('/audioupload', upload.single('audio'), function (req, res, next) {
  try {

    let data = {
      final_url: 'http://3.252.226.91:3500' + '/uploads/audio/' + req.file.filename,
      base_url: 'http://3.252.226.91:3500' + '/uploads/audio',
      audio_name: req.file.filename
    }
    res.send({ 'data': data });
  } catch (error) {
    console.log(error);
  }

});


const request_for_chat = new CronJob({
  // Run at 05:00 Central time, only on weekdays
  cronTime: '0 */1 * * * *',
  onTick: async function () {

    let chat_request_data = await ChatRequest.find({ is_active: 1 })
    if (chat_request_data.length > 0) {
      for (let i = 0; i < chat_request_data.length; i++) {
        const chatroom_id = chat_request_data[i].chatroom_id

        const notification_time = chat_request_data[i].request_time

        // const doctor_name = reschedule_data[i].doctor_name
        // const patient_name = reschedule_data[i].patient_name
        let diff_times = moment().diff(notification_time, 'minutes')
        const last_chatroom_sessionid = await ChatSession.find({ chatroom_id: chatroom_id }).limit(1).sort({ sessionId: -1 })

        const check_accepted = await Message.find({ body: "Requested Accepted", chatroom_id: chat_request_data[i].chatroom_id, chatroom_session_id: last_chatroom_sessionid[0].sessionId })
        const check_reschedule = await Message.find({ body: "Reschedule Request", chatroom_id: chat_request_data[i].chatroom_id, chatroom_session_id: last_chatroom_sessionid[0].sessionId })
        const patient_detail = await User.find({ user_id: chat_request_data[i].patientId, role: 1, is_active: 1 })
        const doctor_detail = await User.find({ user_id: chat_request_data[i].doctorId, role: 2, is_active: 1, is_verified: 1, is_number_verified: 1 })


        if (check_accepted.length > 0) {
          const request_rejected = await ChatRequest.findOneAndUpdate(
            { chatRequestId: chat_request_data[i].chatRequestId },
            { $set: { is_active: 0 } }
          )

        }

        if (check_reschedule.length > 0) {

          const request_rejected = await ChatRequest.findOneAndUpdate(
            { chatRequestId: chat_request_data[i].chatRequestId },
            { $set: { is_active: 0 } }
          )
        }

        if (parseInt(diff_times) === 3) {

          if (check_accepted.length == 0 && check_reschedule.length == 0) {
            let final_st_count = 0
            let st_last_id = await support_team.findOne().sort({ st_id: -1 });

            if (st_last_id == null) {
              final_st_count = 1;
            }
            else {
              final_st_count = parseInt(st_last_id.st_id) + 1
            }

            var bodyParams = {
              user_id: chat_request_data[i].doctorId,
              flavor: 'doctor',
              notificaiton_data: {
                "title": 'Request For Chat Reminder',
                "body": '10 Min are remaining please accept the query',
                "sound": "default",
                "icon": "stock_ticker_update",
                "color": "#ffffff",
                "channel_id": "doclink_patient_channel",
                "default_sound": "false",
                "personal_data": { "doctor_id": chat_request_data[i].doctorId, "patient_id": chat_request_data[i].patientId, "chatroom_id": chatroom_id, module: 'Chat', status: 'Chat Requested Reminder Call' },
              },

            }

            common.send_notification_for_rest_api(bodyParams)
            var random_number = Math.floor(1000 + Math.random() * 9000);
            const ticket_no = `DOC- ${random_number}`
            const support_team_obj = {
              st_id: final_st_count,
              patient_id: chat_request_data[i].patientId,
              doctor_id: chat_request_data[i].doctorId,
              ticket_no: ticket_no,
              patient_name: patient_detail[0].name,
              doctor_name: doctor_detail[0].name,
              module_name: 'chat',
              issue_type: "Doctor Unavailable"
            };
            await support_team(support_team_obj).save();
          }

          if (check_accepted.length > 0) {
            const request_rejected = await ChatRequest.findOneAndUpdate(
              { chatRequestId: chat_request_data[i].chatRequestId },
              { $set: { is_active: 0 } }
            )

          }

          if (check_reschedule.length > 0) {
            const request_rejected = await ChatRequest.findOneAndUpdate(
              { chatRequestId: chat_request_data[i].chatRequestId },
              { $set: { is_active: 0 } }
            )
          }
        }

        if (parseInt(diff_times) === 5) {
          const request_rejected = await ChatRequest.findOneAndUpdate(
            { chatRequestId: chat_request_data[i].chatRequestId },
            { $set: { is_active: 0 } }
          )

          common.endSessionMutation(chat_request_data[i].chatroom_id, Date.now(), chat_request_data[i].patientId);
          var bodyParams_for_doctor = {
            user_id: chat_request_data[i].doctorId,
            flavor: 'doctor',
            notificaiton_data: {
              "title": 'Request Cancelled',
              "body": `Your session request by ${patient_detail[0].name} is cancelled due to your unavailability.`,
              "sound": "default",
              "icon": "stock_ticker_update",
              "color": "#ffffff",
              "channel_id": "doclink_patient_channel",
              "default_sound": "false",
              "personal_data": { "doctor_id": chat_request_data[i].doctorId, "patient_id": chat_request_data[i].patientId, "chatroom_id": chatroom_id, module: 'Chat', status: 'Chat Requested Cancel By Doctor' },
            },

          }

          common.send_notification_for_rest_api(bodyParams)
          common.send_notification_for_rest_api(bodyParams_for_doctor)


        }
      }
    }
  },
  start: true
});

const reschedule_for_chat = new CronJob({
  // Run at 05:00 Central time, only on weekdays
  cronTime: '0 */1 * * * *',
  onTick: async function () {

    let reschedule_data = await reschedule_chat.find({ reschedule_status: "pending", is_active: 1 })
    if (reschedule_data.length > 0) {
      for (let i = 0; i < reschedule_data.length; i++) {

        const reschedule_time = reschedule_data[i].notification_time
        const doctor_name = reschedule_data[i].doctor_name
        const patient_name = reschedule_data[i].patient_name
        const last_chatroom_sessionid = await ChatSession.find({ chatroom_id: reschedule_data[i].chatroom_id }).limit(1).sort({ sessionId: -1 })
        const check_accepted = await Message.find({ sub_message_type: "request_patient_accepted", chatroom_id: reschedule_data[i].chatroom_id, chatroom_session_id: last_chatroom_sessionid[0].sessionId })
        const check_reject = await Message.find({ sub_message_type: "request_rejected", chatroom_id: reschedule_data[i].chatroom_id, chatroom_session_id: last_chatroom_sessionid[0].sessionId })

        // const doctor_name = reschedule_data[i].doctor_name
        // const patient_name = reschedule_data[i].patient_name

        let diff_reschedule_time = moment().diff(reschedule_time, 'minutes')


        if (check_accepted.length > 0) {
          const reschedule_update = await reschedule_chat.findOneAndUpdate(
            { rc_id: reschedule_data[i].rc_id },
            { $set: { is_active: 0, support_team_status: 1 } }
          )
        }

        if (check_reject.length > 0) {
          const reschedule_update = await reschedule_chat.findOneAndUpdate(
            { rc_id: reschedule_data[i].rc_id },
            { $set: { is_active: 0, support_team_status: 1 } }
          )
        }

        if (parseInt(reschedule_data[i].five_min_reminder_status) === 0) {
          if (parseInt(diff_reschedule_time) === 0) {
            let patient_details = await User.findOne({ user_id: reschedule_data[i].doctor_id })

            let doctor_data = {
              name: patient_details.name,
              image: patient_details.avatar,
            }

            var bodyParams = {
              user_id: reschedule_data[i].patient_id,
              flavor: 'patient',
              notificaiton_data: {
                "title": 'Reschedule Reminder',
                "body": `Hi ${patient_name}, You have 5 minutes left, kindly accept or reject the reschedule request.`,
                "sound": "default",
                "icon": "stock_ticker_update",
                "color": "#ffffff",
                "channel_id": "doclink_patient_channel",
                "default_sound": "false",
                "personal_data": { "doctor_id": reschedule_data[i].doctor_id, "patient_id": reschedule_data[i].patient_id, "chatroom_id": reschedule_data[i].chatroom_id, doctor_data: doctor_data, remaining_time: reschedule_data[i].requested_time, chatRequestId: reschedule_data[i].chatrequest_id, module: 'Chat', status: 'Chat Reschedule reminder' },
              },

            }

            var bodyParams_for_doctor = {
              user_id: reschedule_data[i].doctor_id,
              flavor: 'doctor',
              notificaiton_data: {
                "title": 'Reschedule Pending Reminder',
                "body": `${patient_name} reschedule request is on pending.`,
                "sound": "default",
                "icon": "stock_ticker_update",
                "color": "#ffffff",
                "channel_id": "doclink_patient_channel",
                "default_sound": "false",
                "personal_data": { "doctor_id": reschedule_data[i].doctor_id, chatRequestId: reschedule_data[i].chatrequest_id, "patient_id": reschedule_data[i].patient_id, "chatroom_id": reschedule_data[i].chatroom_id, doctor_data: doctor_data, module: 'Chat', status: 'Chat Reschedule reminder' },
              },

            }

            common.send_notification_for_rest_api(bodyParams)
            common.send_notification_for_rest_api(bodyParams_for_doctor)

            const reschedule_filter = { rc_id: reschedule_data[i].rc_id };
            const reschedule_update = { five_min_reminder_status: 1 };

            const reschedule_return = await reschedule_chat.updateOne(reschedule_filter, reschedule_update, {
              returnOriginal: false
            });

            let final_st_count = 0
            let st_last_id = await support_team.findOne().sort({ st_id: -1 });

            if (st_last_id == null) {
              final_st_count = 1;
            }
            else {
              final_st_count = parseInt(st_last_id.st_id) + 1
            }

            var random_number = Math.floor(1000 + Math.random() * 9000);
            const ticket_no = `DOC- ${random_number}`

            const support_team_obj = new support_team({
              st_id: final_st_count,
              patient_id: reschedule_data[i].patient_id,
              doctor_id: reschedule_data[i].doctor_id,
              patient_name: patient_name,
              ticket_no: ticket_no,
              doctor_name: doctor_name,
              module_name: 'Reschedule Chat',
              issue_type: "Patient Unavailable"
            });

            await support_team_obj.save();
          }
        }

        if (parseInt(reschedule_data[i].is_active) === 1) {
          if (parseInt(diff_reschedule_time) === 5) {

            const reschedule_update = await reschedule_chat.findOneAndUpdate(
              { rc_id: reschedule_data[i].rc_id },
              { $set: { is_active: 0, support_team_status: 1, status: "cancel" } }
            )

            const session_update = await ChatSession.findOneAndUpdate(
              { sessionId: reschedule_data[i].chatrequest_id },
              { $set: { status: 'cancel' } }
            )

            common.endSessionMutation(reschedule_data[i].chatroom_id, Date.now(), reschedule_data[i].patient_id);

            var bodyParams_for_doctor = {
              user_id: reschedule_data[i].doctor_id,
              flavor: 'doctor',
              notificaiton_data: {
                "title": 'Not Responding',
                "body": ` ${patient_name} did not respond on your reschedule request.`,
                "sound": "default",
                "icon": "stock_ticker_update",
                "color": "#ffffff",
                "channel_id": "doclink_patient_channel",
                "default_sound": "false",
                "personal_data": { "doctor_id": reschedule_data[i].doctor_id, "patient_id": reschedule_data[i].patient_id, "chatroom_id": reschedule_data[i].chatroom_id, module: 'Chat', status: 'Chat Reschedule Cancel By Patient' },
              },
            }

            var bodyParams_for_patient = {
              user_id: reschedule_data[i].patient_id,
              flavor: 'patient',
              notificaiton_data: {
                "title": 'Request Cancelled',
                "body": `Your reschedule session request sent by Dr. ${doctor_name} has been cancelled.`,
                "sound": "default",
                "icon": "stock_ticker_update",
                "color": "#ffffff",
                "channel_id": "doclink_patient_channel",
                "default_sound": "false",
                "personal_data": { "doctor_id": reschedule_data[i].doctor_id, "patient_id": reschedule_data[i].patient_id, "chatroom_id": reschedule_data[i].chatroom_id, module: 'Chat', status: 'Chat Reschedule Cancel By Patient' },
              },
            }
            common.send_notification_for_rest_api(bodyParams_for_doctor)
            common.send_notification_for_rest_api(bodyParams_for_patient)
          }
        }



      }
    }
  },
  start: true
});

const patient_accept_cron_job = new CronJob({
  // Run at 05:00 Central time, only on weekdays
  cronTime: '0 */1 * * * *',
  onTick: async function () {
    let patient_accept_data = await patient_accept_model.find({ is_active: 1 })
    if (patient_accept_data.length > 0) {
      for (let i = 0; i < patient_accept_data.length; i++) {
        const reschedule_time = patient_accept_data[i].accept_notification_time

        let diff_reschedule_time = moment().diff(reschedule_time, 'minutes')
        let doctor_details = await User.findOne({ role: 2, is_active: 1, user_id: patient_accept_data[i].doctor_id })
        let patient_details = await User.findOne({ role: 1, is_active: 1, user_id: patient_accept_data[i].patient_id })

        if (parseInt(diff_reschedule_time) === 0) {

          var bodyParams_for_doctor = {
            user_id: patient_accept_data[i].doctor_id,
            flavor: 'doctor',
            notificaiton_data: {
              "title": 'Chat Session Reminder',
              "body": 'Dr ' + doctor_details.name + ' your session will be start in 10 min with patient ' + patient_details.name,
              "sound": "default",
              "icon": "stock_ticker_update",
              "color": "#ffffff",
              "channel_id": "doclink_patient_channel",
              "default_sound": "false",
              "personal_data": { "doctor_id": patient_accept_data[i].doctor_id, "patient_id": patient_accept_data[i].patient_id, "chatroom_id": patient_accept_data[i].chatroom_id, module: 'Chat', status: '' },
            },

          }

          var bodyParams_for_patient = {
            user_id: patient_accept_data[i].patient_id,
            flavor: 'patient',
            notificaiton_data: {
              "title": 'Chat Session Reminder',
              "body": 'Dear ' + patient_details.name + ' your session will be start in 10 min with Dr ' + doctor_details.name,
              "sound": "default",
              "icon": "stock_ticker_update",
              "color": "#ffffff",
              "channel_id": "doclink_patient_channel",
              "default_sound": "false",
              "personal_data": { "doctor_id": patient_accept_data[i].doctor_id, "patient_id": patient_accept_data[i].patient_id, "chatroom_id": patient_accept_data[i].chatroom_id, module: 'Chat', status: '' },
            },

          }

          common.send_notification_for_rest_api(bodyParams_for_doctor)
          common.send_notification_for_rest_api(bodyParams_for_patient)
        }

        if (parseInt(diff_reschedule_time) === 10) {

          let patient_accept_data = await patient_accept_model.find({ is_active: 1 })
          let { chiefComplaint } = await ChatRequest.findOne({ chatRequestId: patient_accept_data[i].chatrequest_id })

          let cheif_complain_obj = [{
            des: chiefComplaint[0].des,
            url: chiefComplaint[0].url,
          }]

          common.requestForChatMutation(patient_accept_data[i].patient_id, patient_accept_data[i].doctor_id, cheif_complain_obj, patient_accept_data[i].chatroom_id)
          common.createSessionMutation(patient_accept_data[i].chatroom_id, patient_accept_data[i].patient_id, patient_accept_data[i].chatrequest_id)

          var bodyParams_for_doctor = {
            user_id: patient_accept_data[i].doctor_id,
            flavor: 'doctor',
            notificaiton_data: {
              "title": 'Reschedule Reminder',
              "body": `Your chat session is now active with ${patient_details.name}`,
              "sound": "default",
              "icon": "stock_ticker_update",
              "color": "#ffffff",
              "channel_id": "doclink_patient_channel",
              "default_sound": "false",
              "personal_data": { "doctor_id": patient_accept_data[i].doctor_id, "patient_id": patient_accept_data[i].patient_id, "chatroom_id": patient_accept_data[i].chatroom_id, module: 'Chat', status: '', chiefComplaint: cheif_complain_obj },
            },

          }

          var bodyParams_for_patient = {
            user_id: patient_accept_data[i].patient_id,
            flavor: 'patient',
            notificaiton_data: {
              "title": 'Reschedule Reminder',
              "body": `Your chat session is now active with Dr ${doctor_details.name}`,
              "sound": "default",
              "icon": "stock_ticker_update",
              "color": "#ffffff",
              "channel_id": "doclink_patient_channel",
              "default_sound": "false",
              "personal_data": { "doctor_id": patient_accept_data[i].doctor_id, "patient_id": patient_accept_data[i].patient_id, "chatroom_id": patient_accept_data[i].chatroom_id, chatRequestId: patient_accept_data[i].chatrequest_id, chiefComplaint: cheif_complain_obj, module: 'Chat', status: 'Reschedule session is active' },
            },
          }

          const filters = { pa_id: patient_accept_data[i].pa_id };
          const updates = { is_active: 0 };

          let docs = await patient_accept_model.updateOne(filters, updates, {
            returnOriginal: false
          });
          common.send_notification_for_rest_api(bodyParams_for_doctor)
          common.send_notification_for_rest_api(bodyParams_for_patient)


        }

        if (parseInt(diff_reschedule_time) > 10) {

          const filters = { pa_id: patient_accept_data[i].pa_id };
          const updates = { is_active: 0 };

          let docs = await patient_accept_model.updateOne(filters, updates, {
            returnOriginal: false
          });
        }

      }
    }
  },
  start: true
});


// app.listen(4000, () => console.log('Express GraphQL Server Now Running On localhost:4000/graphql'));



server.listen(global.gConfig.node_port, function () {
  console.log('Listening on port ' + global.gConfig.node_port);
});


var current_date = moment().format();
var check = moment(current_date, 'YYYY/MM/DD');
var month = check.format('M');
var day = check.format('D');
var year = check.format('YYYY');
var time = moment(current_date).format('h:mm');

// cronjob for afternoon 
const afternoon = new CronJob({
  // Run at 05:00 Central time, only on weekdays
  cronTime: "0 22 3 * * *",
  onTick: async function () {
    let custom_date = day + '-' + month + '-' + year;
    let data = await medication_notifications_model.find({ is_active: 1, medication_type: "Afternoon", trigger_date: custom_date });
    for (let i = 0; i < data.length; i++) {
      let user_id = data[i].patient_id;
      let flavor = 'patient';
      let title = 'Afternoon Medicine Reminder';
      let body = 'Please take your medicine ' + data[i].medicine_name;
      common.send_notification(user_id, flavor, title, body)
    }

  },
  start: true
});

// // cronjob for evening 
const evening = new CronJob({
  // Run at 05:00 Central time, only on weekdays
  cronTime: "0 0 8 * * *",
  onTick: async function () {
    let custom_date = day + '-' + month + '-' + year;
    let data = await medication_notifications_model.find({ is_active: 1, medication_type: "Evening", trigger_date: custom_date });
    for (let i = 0; i < data.length; i++) {
      let user_id = data[i].patient_id;
      let flavor = 'patient';
      let title = 'Evening Medicine Reminder';
      let body = 'Please take your medicine ' + data[i].medicine_name;
      common.send_notification(user_id, flavor, title, body)
    }
  },
  start: true
});

// // Morning   
const morning = new CronJob({
  // Run at 05:00 Central time, only on weekdays
  cronTime: "0 0 9 * * *",
  onTick: async function () {
    let custom_date = day + '-' + month + '-' + year;
    let data = await medication_notifications_model.find({ is_active: 1, medication_type: "Morning", trigger_date: custom_date });

    for (let i = 0; i < data.length; i++) {
      let user_id = data[i].patient_id;
      let flavor = 'patient';
      let title = 'Morning Medicine Reminder';
      let body = 'Please take your medicine ,' + data[i].medicine_name;
      common.send_notification(user_id, flavor, title, body)
    }

  },
  start: true
});

// // Followup cron jon   
const follow_up_cron = new CronJob({
  // Run at 05:00 Central time, only on weekdays
  cronTime: "0 */15 * * * *",
  onTick: async function () {
    let custom_date = day + '-' + month + '-' + year + '-' + time;
    let data = await followup_model.find({ day: day, month: month, year: year, time: time });
    for (let i = 0; i < data.length; i++) {
      let user_id = data[i].patient_id;
      let flavor = 'patient';
      let title = 'Follow up Reminder';
      let body = data[i].comment;
      common.send_notification(user_id, flavor, title, body)
    }
  },
  start: true
});



/**
 * Catch 404
 */
app.use(function (req, res) {
  return res.status(400).send({ message: 'No endpoint found', code: 400 })
});
