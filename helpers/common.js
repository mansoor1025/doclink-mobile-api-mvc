import mysql from 'mysql'
import errors_logs_model from '../api/v1.3.18/model/errors_logs_model';
import NotificationModel from '../api/v1.3.18/patient/NotificationModel';
import { join } from 'path';
const axios = require('axios').default;
import UserModel from '../api/v1.3.18/auth/UserModel';
import { log } from 'console';
var _request = require('request');
const qs = require('querystring');
var dateFormat = require('dateformat');
var moment = require('moment');
let error_logs = require('../api/v1.3.18/model/errors_logs_model');
const jwt = require('jsonwebtoken');
const firebase = require("firebase-admin");
var FCM = require('fcm-node');
const user_fcm_token_model = require('../api/v1.3.18/model/user_fcm_token_model');
// secret jwt token
const jwt_secret = 'doclink-mobile-api';
// var IncomingForm = require('formidable').IncomingForm
function validation(fields) {
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i]

    if (field[2] == true) {
      var fieldValue = field[0]
      if (fieldValue.length == 0) {
        throw Error(field[1])
      }
    }
  }
}

function sendAuthCode(mobile_number) {
  // SMS API to be integrated.
}

function guid() {
  let s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}


function getRandomInt(max) {
  return Math.floor(Math.random() * (9999 - 1000) + 1000)
}

// Generate Random String
function getRandomString(max) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < max; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

function getDateFromString(strDate) {
  return new Date(strDate)
}


/*
Compare Date Function
@param
date1: Expiry date
date2: Current date of the system
*/
function compareDate(date1, date2) {
  // var currentDate = new Date().toUTCString();
  // var authCodeExipry = new Date(result.mobile_auth_code_expire_at).toUTCString();
  console.log(date2);
  console.log(date1);

  if (date2 > date1) {
    return false;
  } else {
    return true;
  }
}

// Generate query from json dictionary
function makeQuery(dataDict) {
  var query = [];
  for (var key in dataDict) {
    if (dataDict.hasOwnProperty(key)) {
      var value = `'${dataDict[key]}'`
      //var value = (typeof dataDict[key] == "number") ? dataDict[key] : `'${dataDict[key]}'`
      query.push(`${key} = ${value}`)
    }
  }
  return query.join(', ')
}

function collectRequestData(request, callback) {
  const FORM_URLENCODED = 'application/x-www-form-urlencoded';
  if (request.headers['content-type'] === FORM_URLENCODED) {
    let body = '';
    request.on('data', chunk => {
      body += chunk.toString();
    });
    request.on('end', () => {
      // console.log(body)
      // callback(JSON.parse(body));
      callback(qs.parse(body));
    });
  } else {
    callback(null);
  }
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function convertTimeFormat(date) {
  var d = new Date.parse(date);
  return dateFormat(d, "h:MM TT");
}

function curler(options, callback) {
  try {
    _request(options, function (error, response, body) {
      const statusCode = response && response.statusCode
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      if (error == null && statusCode >= 200 && statusCode <= 299) {
        // console.log("IF")
        callback(null, body, statusCode)
        // return response.output(req, res, next, 200, 0, 'Payment successful', null);
      } else {
        // console.log("ELSE")
        console.error('error:', error, statusCode); // Print the error if one occurred
        callback((error == null) ? Error("unexpected error") : error, null, statusCode)

        // return response.output(req, res, next, statusCode, statusCode, error, null);
      }
    })
  } catch (error) {
    console.error(error)
    // throw error
  }
}
/**
 * [api call ro send sms]
 * @param recipient {number}
 * @param message {string}
 * @return reponse
 */
function send_sms(recipient, message) {

  if (typeof global.gConfig.sms === 'undefined') { console.error('global.gConfig.sms not defined.'); return; }
  var bodyParams = {
    action: "sendmessage",
    username: global.gConfig.sms.username,
    password: global.gConfig.sms.password,
    recipient: recipient, //"03333556551", //"03333182345", //"03333556551", // "03333182345", "03417892114"
    originator: global.gConfig.sms.originator,
    messagedata: message
  }

  /*if (action == "unlock") {
      bodyParams["messagedata"] = "@ 1 1010 2"
  } else if (action == "lock") {
      bodyParams["messagedata"] = "@ 1 1010 1"
  }*/
  // CURL request option
  // rejectUnauthorized is for if ssl not verified.
  const options = {
    method: global.methodType.POST,
    url: global.gConfig.sms.url,
    form: bodyParams
  }

  if (global.gConfig.sms.driver == "log") {
    options.method = global.methodType.GET;
    options.url = "http://localhost/";

    curler(options, function (error, curlResponse, statusCode) {
      var parseString = require('xml2js').parseString;
      parseString('<root>Hello xml2js is working!</root>', function (err, result) {
        if (result) { console.log('xml2js result', result); }
        if (err) { console.error('xml2js error', err); }
      });
    })
  } else {
    // CURL request
    curler(options, function (error, curlResponse, statusCode) {
      var parseString = require('xml2js').parseString;
      parseString(curlResponse, function (err, result) {
        try {
          const statusCode = result.response.data[0].acceptreport[0].statuscode[0]
          if (statusCode == 0) {
            // return response.output(req, res, next, 200, 0, 'Command has been executed', []);
            return true;
          }
        } catch (error) {
          // return response.output400(req, res, next, global.errorCodes.INVALID_DATA, error)
          return false;
        }
        // console.log("Status Code", result.data.acceptreport.statuscode)
      });
    })

  }

}

function currency_formatter(symbol, amount, number_format) {
  var result = '';
  amount = parseFloat(amount).toFixed(number_format);
  result = symbol + ' ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return result;
}

/**
 * [api call to voice otp]
 * @param recipient {number}
 * @param code {string}
 * @return reponse
 */
function request_voice_otp(number, code) {
  return new Promise((resolve, reject) => {
    if (typeof global.gConfig.voice_otp === 'undefined') {
      console.error('global.gConfig.sms not defined.');
      return;
    }
    var bodyParams = {
      number: number,
      username: global.gConfig.voice_otp.username,
      password: global.gConfig.voice_otp.password,
      code: code
    }

    // CURL request option
    // rejectUnauthorized is for if ssl not verified.
    const options = {
      method: global.methodType.POST,
      url: global.gConfig.voice_otp.url,
      form: bodyParams
    }

    if (global.gConfig.voice_otp.driver == "log") {
      console.log('options', options);
    } else {
      // CURL request
      curler(options, function (error, curlResponse, statusCode) {
        resolve(curlResponse)
      })
    }
  });
}
/**
 * Doctor schedule
 */
function format_doctor_schedule(data) {
  //  console.log('===========' + data);
  Object.entries(data).map(([key, value]) => {
    let days_text = []
    let days_index = []
    Object.entries(value).map(([ikey, ivalue]) => {
      console.log('ikey' + ikey);
      // if (ikey == "days") {
      //   let daysIndex = ivalue.split(",")
      //   Object.entries(daysIndex).map(([dkey, dvalue]) => {
      //     days_text.push(global.daysShort[parseInt(dvalue)])
      //     days_index.push(parseInt(dvalue))
      //   })
      // }
      //   if (ikey == "start_time") {
      //     value['start_time_text'] = moment('1970-01-01T' + ivalue).utc(true).format('hh:mm A')
      //   }
      //   if (ikey == "end_time") {
      //     value['end_time_text'] = moment('1970-01-01T' + ivalue).utc(true).format('hh:mm A')
      //   }
    })
    // value['days_text'] = days_text
    // value['days_index'] = days_index
  });
  return data;
}

async function error_log(user_id, name, platform, endpoint, error, server) {
  let error_count = await error_logs.findOne({}).sort({ error_id: -1 });
  let error_final_id = 0;
  if (error_count == null) {
    error_final_id = 1;
  }
  else {
    error_final_id = parseInt(error_count.error_id) + 1;
  }

  let error_data = {
    error_id: error_final_id,
    user_id: user_id,
    name: name,
    platform: platform,
    endpoint: endpoint,
    error: error,
    server: server
  }
  await new error_logs(error_data).save();
}

async function get_user_id_by_auth_token(auth_token) {
  try {
    jwt.verify(auth_token, jwt_secret, function (err, decoded) {
      // check if token is invalid
      if (err) {
        return res.status(401).json({ error: "token is not valid access denied" })
      }
      else {
        // send user_id via middleware
        let data = decoded.user
        console.log('yaha chal rha hai ');
        console.log(data);
        return data;
      }
    });
  } catch (error) {
    console.log(error);
  }
}

function curler(options, callback) {
  try {
    _request(options, function (error, response, body) {
      // console.log('++++++++++++++++++++++++++++++++');
      console.log(body);
    })
  } catch (error) {
    console.error(error)
    // throw error
  }
}

async function send_notification(user_id, flavor, title, body) {
  var flavor = flavor;
  var payload_data = { "doctor_id": "145", "patient_id": "130" }
  var ValidationArray = [
    [user_id, "User Id is required", true],
  ];

  try {
    let notificaiton_data = {
      "title": title,
      "body": body,
      "sound": "default",
      "icon": "stock_ticker_update",
      "color": "#ffffff",
      "channel_id": "doclink_patient_channel",
      "default_sound": "false"
    }
    let json_notification = notificaiton_data;
    let json_payload = payload_data;

    let { fcm_token } = await NotificationModel.findOne({ user_id: user_id }).select('fcm_token')

    console.log('==========fcmtoken' + fcm_token);
    let package_name = (flavor == 'patient') ? 'com.doclink.patient' : 'com.doclink.doctor'
    let name = (flavor == 'patient') ? 'DocLink/Patient' : 'DocLink/Doctor'

    var payload = {
      name: "DocLink/Patient",
      data: json_payload,
      notification: {
        title: json_notification.title,
        body: json_notification.body,
      },
      android: {
        priority: "high",
        ttl: 60 * 60 * 24, // 1 day
        restricted_package_name: package_name,
        data: json_payload,
        notification: json_notification,
      },
      token: fcm_token
    };
    console.log("Notificaion Payload Patient");

    if (typeof fcm_token !== 'undefined' && fcm_token.length != 0) {
      firebase.messaging().send(payload)

      // Initiate follow up session
      console.log('Notification sent');
      // return res.status(201).json({ error: 0, status: 'Success', message: 'Notification sent', data: payload });
    } else {
      // throw new Error('Fcm token not found in parameters')
      console.log('Notification not sent: Fcm token not found in parameters')
    }
  } catch (error) {
    console.log({
      error: 0, status: 'common error', message: error.message, data: []
    });
    // return res.status(400).json({
    //   error: 0, status: 'Error', message: error.message, data: []
    // });
  }
}


async function endSessionMutation(chatroom_id, startedAt, startedBy) {
  try {
    const res = await axios.post(
      'http://3.252.226.91:4000/',
      {
        query: `
    mutation endedSession(
      $chatroom_id: Int
      $startedAt: Float
      $startedBy: Int
      $status: String
    ) {
      endedSession(
        chatroom_id: $chatroom_id
        startedAt: $startedAt
        startedBy: $startedBy
        status: $status
      ) {
        sessionId
        startedAt
        sessionType
        status
      }
    }
  `,
        variables: {
          chatroom_id: chatroom_id,
          startedAt: startedAt,
          startedBy: startedBy,
          status: 'cancel',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    console.log(res);

  } catch (error) {
    console.log('===================');
    console.log(error);
  }
}

async function createMessageMutation(body, sender_id, receiver_id, message_type, chatroom_id, chatroom_session_id, app_user, local_url) {
  //   _id: Date.now(),
  try {
    const res = await axios.post(
      'http://3.252.226.91:4000/',
      {
        query: `
    mutation createMessage(
      $body: String!
      $sender_id: Int!
      $receiver_id: Int!
      $message_type: String!
      $sub_message_type:String
      $chatroom_id: Int
      $chatroom_session_id: Int
      $app_user: String!
      $local_url: String
      $created_at: String
      $updated_at: String
    ) {
      createMessage(
        body: $body
        sender_id: $sender_id
        receiver_id: $receiver_id
        message_type: $message_type
        sub_message_type:$sub_message_type
        chatroom_id: $chatroom_id
        chatroom_session_id: $chatroom_session_id
        app_user: $app_user
        local_url: $local_url
        created_at: $created_at
        updated_at: $updated_at
      ) {
        chatroom_id
        sender_id
        receiver_id
        body
      }
    }
  `,
        variables: {
          body: body,
          sender_id: sender_id,
          receiver_id: receiver_id,
          message_type: message_type,
          chatroom_id: chatroom_id,
          chatroom_session_id: chatroom_session_id,
          sub_message_type: "Medical Records",
          app_user: app_user,
          local_url: local_url,
          created_at: moment().utc(true).format('YYYY-MM-DDTHH:mm:ss'),
          updated_at: moment().utc(true).format('YYYY-MM-DDTHH:mm:ss'),
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    console.log(res);

  } catch (error) {
    console.log('===================');
    console.log(error.response.data);
  }
}


async function requestForChatMutation(patientId, doctorId, chiefComplaint, chatroom_id) {
  try {
    const res = await axios.post(
      'http://3.252.226.91:4000/',
      {
        query: `
        mutation requestForChat(
          $patientId: Int!
          $doctorId: Int!
          $status: String!
          $chiefComplaint: [chiefComplaintInput]
          $chatroom_id: Int!
        ) {
          requestForChat(
            patientId: $patientId
            doctorId: $doctorId
            status: $status
            chiefComplaint: $chiefComplaint
            chatroom_id: $chatroom_id
          ) {
            chatRequestId
          }
        }
    `,
        variables: {
          patientId: patientId,
          doctorId: doctorId,
          status: 'pending',
          chiefComplaint: chiefComplaint,
          chatroom_id: chatroom_id,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    console.log(res);
  } catch (error) {
    console.log('===================');
    console.log(error);
  }
}

async function addClosingNotesMessages(chatroom_id, sender_id, receiver_id, chatroom_session_id) {
  try {
    const res = await axios.post(
      'http://3.252.226.91:4000/',
      {
        query: `
        mutation addClosingNotesMessages(
          $chatroom_id: Int
          $sender_id: Int
          $receiver_id:Int
          $chatroom_session_id: Int
        ) {
          addClosingNotesMessages(
            chatroom_id: $chatroom_id
            sender_id: $sender_id
            receiver_id: $receiver_id
            chatroom_session_id: $chatroom_session_id
          ) {
            body
          }
        }
    `,
        variables: {
          chatroom_id: chatroom_id,
          sender_id: sender_id,
          receiver_id: receiver_id,
          chatroom_session_id: chatroom_session_id,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    console.log(res);
  } catch (error) {
    console.log('===================');
    console.log(error);
  }
}


async function createSessionMutation(chatroom_id, startedBy, chatRequestId) {
  try {
    const res = await axios.post(
      'http://3.252.226.91:4000/',
      {
        query: `
        mutation createSession(
          $chatroom_id: Int
          $startedAt: Float
          $startedBy: Int
          $status: String
          $chatRequestId: Int
        ) {
          createSession(
            chatroom_id: $chatroom_id
            startedAt: $startedAt
            startedBy: $startedBy
            status: $status
            chatRequestId: $chatRequestId
          ) {
            sessionId
            startedAt
            sessionType
            status
          }
        }
    `,
        variables: {
          chatroom_id: chatroom_id,
          startedAt: Date.now(),
          startedBy: startedBy,
          status: 'requested',
          chatRequestId: chatRequestId,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    console.log(res);
  } catch (error) {
    console.log('===================');
    console.log(error);
  }
}


async function send_notification_for_rest_api(data, flavor, title, body) {
  try {

    let title = data.notificaiton_data.title
    let body = data.notificaiton_data.body
    var serverKey = 'AAAAdinDe4s:APA91bF3CQRc4i9s4l9MoqmSIxWd_5nEyNiYz6j9KqC8mSfFdBgHQOqstSpRfWhRWU4WpJL3-N0IzZUdi17EHESeVgoZfNOJojA66GrtwCTAx33QiYmUQLkddf69z9a8PZZukuU7EAEK';
    var fcm = new FCM(serverKey);
    let user_id = data.user_id
    console.log('===========', user_id);
    let { fcm_token } = await user_fcm_token_model.findOne({ user_id: user_id }).select('fcm_token');
    console.log(fcm_token);
    console.log(data);
    var collapseKey = Math.random()
    var message = {
      to: fcm_token,
      priority: "high",
      notification: {
        title: title,
        body: body,
        priority: "high",
        tag: collapseKey
      },

      data: { //you can send only notification or only data(or include both)
        title: title,
        body: data,
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
    console.log({
      error: 0, status: 'common error', message: error.message, data: []
    });
    // return res.status(400).json({
    //   error: 0, status: 'Error', message: error.message, data: []
    // });
  }
}


async function send_sms_notification(phone_number, message) {
  try {

    var bodyParams = {
      action: "sendmessage",
      username: "doclink",
      password: "R%sr4rr7",
      recipient: phone_number,
      originator: 86574,
      messagedata: message,

    }

    // http://smsctp4.eocean.us:24555/api?action=sendmessage&username=doclink&password=R%sr4rr7&recipient=923353089102&originator=86574&messagedata=Test123.

    const options = {
      method: 'POST',
      url: 'http://smsctp4.eocean.us:24555/api?',
      form: bodyParams
    }

    curler(options, function (error, curlResponse, statusCode) {

      var parseString = require('xml2js').parseString;
      parseString(curlResponse, function (err, result) {

      });
    });

  } catch (error) {
    console.log(error);
    console.log({
      error: 0, status: 'common error', message: error.message, data: []
    });
    // return res.status(400).json({
    //   error: 0, status: 'Error', message: error.message, data: []
    // });
  }
}


async function capitalize_each_word(str) {
  try {

    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
      // You do not need to check if i is larger than splitStr length, as your for does that for you
      // Assign it back to the array
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    var convert = splitStr.join(' ')[0];
    let obj = {
      convert: convert
    }

    return obj;

  } catch (error) {
    console.log({
      error: 0, status: 'common error', message: error.message, data: []
    });
    // return res.status(400).json({
    //   error: 0, status: 'Error', message: error.message, data: []
    // });
  }
}
// Export Functions
module.exports = {
  collectRequestData,
  validation,
  sendAuthCode,
  getRandomInt,
  makeQuery,
  error_log,
  compareDate,
  isEmpty,
  getDateFromString,
  getRandomString,
  send_sms,
  currency_formatter,
  guid,
  request_voice_otp,
  format_doctor_schedule,
  send_notification,
  get_user_id_by_auth_token,
  send_notification_for_rest_api,
  endSessionMutation,
  requestForChatMutation,
  createSessionMutation,
  addClosingNotesMessages,
  createMessageMutation,
  capitalize_each_word,
  send_sms_notification

}
