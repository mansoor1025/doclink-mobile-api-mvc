const express = require('express');
import transactions_consumer_model from '../model/transactions_consumer_model'
import chatroom_sessions_model from '../model/chatroom_sessions_model';
import chatrooms_model from '../model/chatrooms_model'
import medications_model from '../model/medications_model';
import medication_details_model from '../model/medication_details_model'
import patient_diagnostic_tests from '../model/patient_diagnostic_tests_model'
import patient_diagnostic_tests_model from '../model/patient_diagnostic_tests_model'
import follow_up_model from '../model/follow_up_model';
import chatrequests from '../model/chatrequests';
import chatroom_session_charges_return_model from '../model/chatroom_session_charges_return_model'
import wallet_logs from '../model/wallets_model';
import UserModel from '../auth/UserModel'
import message_model from '../model/message_model'
import medication_notification_model from '../model/medication_notification_model';
var moment = require('moment');
const { body, query, validationResult } = require('express-validator');

exports.add_closing_notes = async (req, res, next) => {
    try {
        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Getting body params
        var chatroom_session_id = req.body.chatroom_session_id ? req.body.chatroom_session_id : "";
        var chatroom_id = req.body.chatroom_id ? req.body.chatroom_id : "";
        var doctor_id = req.body.doctor_id ? req.body.doctor_id : "";
        var notes = req.body.notes ? req.body.notes : "";
        var return_session_charges = req.body.return_session_charges ? req.body.return_session_charges : "";
        var prescribe_medicine = req.body.prescribe_medicine ? req.body.prescribe_medicine : "";
        var lab_tests = req.body.lab_tests ? req.body.lab_tests : "";
        var follow_ups = req.body.follow_ups ? req.body.follow_ups : "";
        var dismiss = req.body.dismiss ? req.body.dismiss : 0;

        console.log('chatroom_id', chatroom_id);
        console.log('chatroom_session_id', chatroom_session_id);

        const medication_data = await medications_model.deleteMany({ chatroom_id: chatroom_id, chatroom_session_id: chatroom_session_id })
        const medication_details_data = await medication_details_model.deleteMany({ chatroom_id: chatroom_id, chatroom_session_id: chatroom_session_id })
        const lab_test = await patient_diagnostic_tests_model.deleteMany({ chatroom_session_id: chatroom_session_id })
        const follow_up = await follow_up_model.deleteMany({ chatroom_session_id: chatroom_session_id })

        let arr_chatroom_session = await chatroom_sessions_model.find({ sessionId: chatroom_session_id });
        if (arr_chatroom_session.length == 0) {
            return res.status(201).json({ error: 0, status: 'Error', message: 'No chatroom session found', data: [] });
        }
        let chatroom_session = arr_chatroom_session[0];
        // chatroom functionality

        let arr_chatroom = await chatrooms_model.find({ chatroom_id: chatroom_id });
        if (arr_chatroom.length == 0) {
            return res.status(201).json({ error: 0, status: 'Error', message: 'No chatroom found', data: [] });
        }
        let chatroom = arr_chatroom[0];

        // Store prescribe medicine
        if (prescribe_medicine.length > 0) {
            let json_prescribe_medicine = JSON.parse(prescribe_medicine);
            if (json_prescribe_medicine.length > 0) {
                let medication_count = await medications_model.findOne().sort({ medication_id: -1 });
                let final_medi_id = 0;
                if (medication_count == null) {
                    final_medi_id = 1;
                }
                else {
                    final_medi_id = parseInt(medication_count.medication_id) + 1;
                }

                let store_prescribe_medicine = {
                    medication_id: final_medi_id,
                    doctor_id: chatroom.doctor_id,
                    patient_id: chatroom.patient_id,
                    chatroom_id: chatroom.chatroom_id,
                    chatroom_session_id: chatroom_session.sessionId,
                    additional_comments: req.body.notes,
                    created_at: moment().format(),
                    updated_at: moment().format(),
                    deleted_at: null
                }
                await new medications_model(store_prescribe_medicine).save();

                for (var i = 0; i < json_prescribe_medicine.length; i++) {
                    let medi_details_count = await medication_details_model.findOne().sort({ medication_details_id: -1 });
                    let final_medi_detail_id = 0;
                    if (medi_details_count == null) {
                        final_medi_detail_id = 1;
                    }
                    else {
                        final_medi_detail_id = parseInt(medi_details_count.medication_details_id) + 1;
                    }
                    let child_data = json_prescribe_medicine[i]
                    if (child_data.medicine_name != "" && child_data.days > 0) {
                        let a = {
                            medication_details_id: final_medi_detail_id,
                            medication_id: final_medi_id,
                            chatroom_id: chatroom.chatroom_id,
                            chatroom_session_id: chatroom_session_id,
                            medicine_name: child_data.medicine_name,
                            days: parseInt(child_data.days),
                            morning: (child_data.morning == true) ? 1 : 0,
                            afternoon: (child_data.afternoon == true) ? 1 : 0,
                            evening: (child_data.evening == true) ? 1 : 0,
                            comment: child_data.comment,
                            created_at: moment().format(),
                            updated_at: moment().format(),
                            deleted_at: null
                        }

                        let days_loop = parseInt(child_data.days);
                        var current_date = moment().format();
                        var check = moment(current_date, 'YYYY/MM/DD');
                        var month = check.format('M');
                        var day = check.format('D');
                        var year = check.format('YYYY');

                        if (days_loop > 0) {
                            for (let j = 0; j < days_loop; j++) {
                                let mn_count = await medication_notification_model.findOne().sort({ mn_id: -1 });
                                let final_mn_id = 0;
                                if (mn_count == null) {
                                    final_mn_id = 1;
                                }
                                else {
                                    final_mn_id = parseInt(mn_count.mn_id) + 1;
                                }

                                let custom_date = day++ + '-' + month + '-' + year;

                                if (child_data.morning == 'true') {
                                    let morning_data = {
                                        mn_id: final_mn_id,
                                        medication_id: final_medi_id,
                                        medication_detail_id: final_medi_detail_id,
                                        medicine_name: child_data.medicine_name,
                                        doctor_id: chatroom.patient_id,
                                        patient_id: chatroom.doctor_id,
                                        medication_type: 'Morning',
                                        medicine_reminder_time: "09:00",
                                        trigger_date: custom_date,
                                        is_active: 1,
                                        created_at: moment().format(),
                                        updated_at: moment().format(),
                                        deleted_at: null
                                    }
                                    await new medication_notification_model(morning_data).save();
                                }

                                if (child_data.evening == 'true') {
                                    let evening_data = {
                                        mn_id: final_mn_id,
                                        medication_id: final_medi_id,
                                        medication_detail_id: final_medi_detail_id,
                                        medicine_name: child_data.medicine_name,
                                        doctor_id: chatroom.patient_id,
                                        patient_id: chatroom.doctor_id,
                                        medication_type: 'Evening',
                                        medicine_reminder_time: "08:00",
                                        trigger_date: custom_date,
                                        is_active: 1,
                                        created_at: moment().format(),
                                        updated_at: moment().format(),
                                        deleted_at: null
                                    }

                                    await new medication_notification_model(evening_data).save();
                                }

                                if (child_data.afternoon == 'true') {
                                    let afternoon = {
                                        mn_id: final_mn_id,
                                        medication_id: final_medi_id,
                                        medication_detail_id: final_medi_detail_id,
                                        medicine_name: child_data.medicine_name,
                                        doctor_id: chatroom.patient_id,
                                        patient_id: chatroom.doctor_id,
                                        medication_type: 'Afternoon',
                                        medicine_reminder_time: "03:00",
                                        trigger_date: custom_date,
                                        is_active: 1,
                                        created_at: moment().format(),
                                        updated_at: moment().format(),
                                        deleted_at: null
                                    }

                                    await new medication_notification_model(afternoon).save();
                                }

                            }
                        }
                        await new medication_details_model(a).save();
                    }
                }
            }
        }
        else {
            console.log('prescribe medicine this is empty');
        }


        // End  

        // lab tests
        if (lab_tests.length > 0) {
            let json_lab_tests = JSON.parse(lab_tests)
            console.log('=============' + json_lab_tests.length);
            if (json_lab_tests.length > 0) {
                for (var i = 0; i < json_lab_tests.length; i++) {
                    let child_data = json_lab_tests[i]
                    let lab_test_count = await patient_diagnostic_tests_model.findOne().sort({ patient_diagnostic_tests_id: -1 });
                    let final_lab_test_id = 0;
                    if (lab_test_count == null) {
                        final_lab_test_id = 1;
                    }
                    else {
                        final_lab_test_id = parseInt(lab_test_count.patient_diagnostic_tests_id) + 1;
                    }

                    let lab_test_data = {
                        patient_diagnostic_tests_id: final_lab_test_id,
                        chatroom_session_id: chatroom_session.sessionId,
                        doctor_id: chatroom.doctor_id,
                        patient_id: chatroom.patient_id,
                        short_code: child_data.short_code,
                        test_name: child_data.test_name,
                        lab_test_id: child_data.lab_test_id,
                        comment: child_data.comment,
                        created_at: moment().format(),
                        updated_at: null,
                        deleted_at: null,
                    }
                    await new patient_diagnostic_tests(lab_test_data).save();

                }
            }
        }
        else {
            console.log('labtest this is empty');
        }
        // End

        // follow ups
        if (follow_ups.length > 0) {
            let json_follow_ups = JSON.parse(follow_ups);

            if (json_follow_ups.length > 0) {
                for (var i = 0; i < json_follow_ups.length; i++) {
                    let follow_count = await follow_up_model.findOne().sort({ follow_up_id: -1 });
                    let final_follow_id = 0;
                    if (follow_count == null) {
                        final_follow_id = 1;
                    }
                    else {
                        final_follow_id = parseInt(follow_count.follow_up_id) + 1;
                    }

                    let child_data = json_follow_ups[i];
                    var year = moment(child_data.follow_up_at).format('Y');
                    var month = moment(child_data.follow_up_at).format('M');
                    var date = moment(child_data.follow_up_at).format('DD');
                    var time = moment(child_data.follow_up_at).format('h:mm');

                    let follow_ups_data = {
                        follow_up_id: final_follow_id,
                        chatroom_session_id: chatroom_session.sessionId,
                        doctor_id: chatroom.doctor_id,
                        patient_id: chatroom.patient_id,
                        follow_up_at: child_data.follow_up_at,
                        year: year,
                        month: month,
                        date: date,
                        time: time,
                        comment: child_data.comment,
                        created_at: moment().format(),
                        updated_at: moment().format(),
                        deleted_at: null
                    }

                    await new follow_up_model(follow_ups_data).save();
                }
            }
        }
        else {
            console.log('followup this is empty');
        }


        return_session_charges = parseInt(return_session_charges)

        // Update doctor closing notes and timestamp
        let param_closing_notes = {
            doctor_closing_notes_given_at: moment().format(),
            return_session_charges: return_session_charges,
            dismiss_closing_notes: dismiss
        }
        const filter = { sessionId: chatroom_session_id };
        const update = {
            doctor_closing_notes_given_at: moment().format(),
            return_session_charges: return_session_charges,
            dismiss_closing_notes: dismiss
        };

        let doc = await chatroom_sessions_model.updateOne(filter, update, {
            returnOriginal: false
        });

        // If doctor decided to return session charges
        if (return_session_charges == 1) {

            // Get Chat Request Details
            // let arr_chat_request = await patientModel.fetch_chat_request_by_id(chatroom_session.chat_request_id)
            // if (arr_chat_request.length == 0) {
            //   return res.status(201).json({ error: 0, status: 'Error', message: 'No chat request found', data: [] });
            // }
            // let chat_request = arr_chat_request[0]

            let arr_chat_request = await chatrequests.find({ chatRequestId: chatroom_session.requestId });
            if (arr_chat_request.length == 0) {
                return res.status(201).json({ error: 0, status: 'Error', message: 'No chat request found', data: [] });
            }
            let chat_request = arr_chat_request[0];

            // Store session charges return data into flat table.
            let cscr_count = await chatroom_session_charges_return_model.findOne().sort({ cscr_id: -1 });
            let final_cscr_id = 0;
            if (cscr_count == null) {
                final_cscr_id = 1;
            }
            else {
                final_cscr_id = parseInt(cscr_count.cscr_id) + 1;
            }

            let param_charges_return = {
                cscr_id: final_cscr_id,
                chatroom_session_id: chatroom_session_id,
                amount: chat_request.amount,
                created_at: moment().format(),
                updated_at: moment().format(),
                deleted_at: null,
            }

            await new chatroom_session_charges_return_model(param_charges_return).save();

            // Find transactions of chatroom session
            // SELECT * FROM transactions where chatroom_session_id
            let arr_transactions = await transactions_consumer_model.find({ chat_session_id: chatroom_session_id })
            if (arr_transactions.length == 0) {
                return res.status(201).json({ error: 0, status: 'Error', message: 'No transaction session of chatroom found', data: [] });
            }
            let transaction = arr_transactions[0]

            // Update transaction field to 'CashReturn'
            const trans_filter = { transaction_id: transaction.transaction_id };
            const trans_update = {
                payment_status: 'CashReturn'
            };

            let trans_doc = await transactions_consumer_model.updateOne(trans_filter, trans_update, {
                returnOriginal: false
            });

            // Store Wallet record
            let wallet_count = await wallet_logs.findOne().sort({ wallet_logs_id: -1 });
            let final_wallet_id = 0;
            if (wallet_count == null) {
                final_wallet_id = 1;
            }
            else {
                final_wallet_id = parseInt(wallet_count.wallet_logs_id) + 1;
            }

            let param_wallet = {
                wallet_logs_id: final_wallet_id,
                credit: chat_request.amount,
                patient_id: chat_request.patient_id,
                payment_type_id: 4,
                payment_type: 'CashReturn',
                reference_id: chatroom_session_id
            }
            await new wallet_logs(param_wallet).save();
            //let insert_id_wallet = await chatModel.store_wallet(param_wallet)

            // Update Patient Wallet

            const user_filter = { user_id: chat_request.patientId };
            const user_update = {
                current_wallet_amount: chat_request.amount,
            };

            let user_doc = await transactions_consumer_model.updateOne(trans_filter, trans_update, {
                returnOriginal: false
            });

            //await patientModel.update_patient_wallet(chat_request.package_amount, chat_request.patient_id)

            let arrDoctor = await UserModel.find({ user_id: doctor_id });

            if (arrDoctor.length > 0) {



                let doctor = arrDoctor[0]
                //let fcm_token_patient = await get_fcm_token(chat_request.patient_id);

                if (return_session_charges == 1) {
                    // send notification to patient of session charges
                    // notify_patient({
                    //   title: 'Session Charges',
                    //   body: 'Dr. ' + doctor.name + ' has refunded the session charges',
                    //   fcmToken: fcm_token_patient,
                    //   data: {
                    //     doctor_id: chat_request.doctor_id.toString(),
                    //     patient_id: chat_request.patient_id.toString(),
                    //   }
                    // });
                } else {
                    // send notification to patient of closing notes
                    // notify_patient({
                    //   title: 'Closing Notes',
                    //   body: "Dr. " + doctor.name + ' has sent the closing notes',
                    //   fcmToken: fcm_token_patient,
                    //   data: {
                    //     doctor_id: chat_request.doctor_id.toString(),
                    //     patient_id: chat_request.patient_id.toString(),
                    //   }
                    // });
                }
            }
        }

        if (notes != '') {
            var total_message_notes = await message_model.findOne().sort({ messageId: -1 });
            var messageIds_notes = 0;
            if (total_message_notes == null) {
                messageIds_notes = 0 + 1;
            }
            else {
                messageIds_notes = parseInt(total_message_notes.messageId) + 1
            }
            // let system_message_notes = {
            //     messageId: messageIds_notes,
            //     delivered: false,
            //     recieved: false,
            //     seen: false,
            //     chatroom_session_id: chatroom_session_id,
            //     body: notes,
            //     sender_id: doctor_id,
            //     receiver_id: chatroom.patient_id,
            //     message_type: 'system',
            //     sub_message_type: 'is_notes',
            //     chatroom_id: chatroom.chatroom_id,
            //     app_user: 'doctor',
            //     created_at: moment().format(),
            //     updated_at: moment().format()
            // }
            // await new message_model(system_message_notes).save();
        }

        let check_prescription_medicine = await medications_model.find({ chatroom_session_id: chatroom_session_id })
        if (check_prescription_medicine.length > 0) {
            var total_message = await message_model.findOne().sort({ messageId: -1 });
            var messageIds = 0;
            if (total_message == null) {
                messageIds = 0 + 1;
            }
            else {
                messageIds = parseInt(total_message.messageId) + 1
            }
            // let system_message = {
            //     messageId: messageIds,
            //     delivered: false,
            //     recieved: false,
            //     seen: false,
            //     chatroom_session_id: chatroom_session_id,
            //     body: 'Closing Notes',
            //     sender_id: doctor_id,
            //     receiver_id: chatroom.patient_id,
            //     message_type: 'system',
            //     sub_message_type: 'closing_notes',
            //     chatroom_id: chatroom.chatroom_id,
            //     app_user: 'doctor',
            //     created_at: moment().format(),
            //     updated_at: moment().format()
            // }
            // await new message_model(system_message).save();
        }

        // End

        common.send_notification(chatroom.patient_id, 'patient', 'Closing Notes', 'Doctor Submitted Closing Notes')
        common.addClosingNotesMessages(chatroom.chatroom_id, chatroom.doctor_id, chatroom.patient_id, chatroom_session_id)
        return res.status(200).json({
            error: 0, status: 'Success', message: 'Doctor prescribe submitted', data: chatroom_session
        });
    }
    catch (error) {
        console.log(error);
        res.send(error);
    }
}