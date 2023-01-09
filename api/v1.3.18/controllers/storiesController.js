const moment = require('moment');
const { body, query, validationResult } = require('express-validator');
const UserModel = require('../auth/UserModel');
const stories_model = require('../model/stories_model');
const story_viewers_model = require('../model/story_viewers_model');
const common = require('../../../helpers/common');
const chatrooms = require('../model/chatrooms_model');
const multer = require('multer');
const jwt = require('jsonwebtoken');
// secret jwt token
const jwt_secret = 'doclink-mobile-api';



exports.add_doctor_stories = async (req, res, next) => {    
    try {
        var caption = req.body.caption ? req.body.caption : "";
        var story_type = req.body.type ? req.body.type : "";
        var data = req.body.data ? req.body.data : "";
        var story_privacy = req.body.privacy ? req.body.privacy : "";
        let live_url = '';
        if (typeof req.file !== 'undefined') {
            live_url = 'http://3.252.226.91:3500/' + req.file.path
        }


        const doctorProfile = await UserModel.find({ user_id: req.user.user_id });

        // checking doctor exists
        if (doctorProfile.length > 0) {
            if (parseInt(doctorProfile[0].is_verified) == 0) {
                return res.status(400).json({ error: 1, status: 'error', message: 'Your profile is not verified yet, please try again later', data: [] });
            } else if (parseInt(doctorProfile[0].is_number_verified) == 0) {
                return res.status(400).json({ error: 1, status: 'error', message: 'Your profile is not verified yet, please try again later', data: [] });
            }
        } else {
            return res.status(400).json({ error: 1, status: 'error', message: 'No profile found.', data: [] });
        }

        // stories count
        const stories_count = await stories_model.findOne({}).sort({ story_id: -1 });
        let final_story_id = 0;
        if (stories_count == null) {
            final_story_id = 1;
        }
        else {
            final_story_id = parseInt(stories_count.story_id) + 1;
        }

        // story object 
        const story = {
            story_id: final_story_id,
            user_id: req.user.user_id,
            caption: caption,
            story_type: story_type,
            raw_data: data,
            story_privacy: story_privacy,
            stories_user_type: "Doctor",
            seconds: 0,
            image: live_url,
            viewers_count: 0,
            is_active: 1,
            created_at: moment().format(),
            created_at_story: Date.now(),
            deleted_at: null,
            updated_at: moment().format()
        }

        // add story data 
        await new stories_model(story).save();

        const stories_data = await stories_model.find({ user_id: req.user.user_id }).sort({ story_id: -1 });

        //send res with stories data 
        return res.status(200).json({
            error: 0, status: 'success', message: 'Stored', 'stories': stories_data
        });
    } catch (error) {
        common.error_log(req.user.user_id, req.user.name, 'doclink-mobile-app-backend', 'stories/add_doctor_stories', error.message, "http://3.252.226.91:3100/")
        console.log(error);
    }
}

exports.get_doctor_stories = async (req, res, next) => {
    try {
        console.log('========== user_id');
        console.log(req.user.user_id);
        let data = {};
        const arrDocLinks = await UserModel.find({ user_id: req.user.user_id });

        // check doctor is exists
        if (arrDocLinks.length > 0) {
            if (parseInt(arrDocLinks[0].is_verified) == 0) {
                return res.status(409).json({
                    error: 0, msg: 'success', response: 'Your profile is not verified yet, please try again later'
                });
            } else if (parseInt(arrDocLinks[0].is_number_verified) == 0) {
                return res.status(409).json({
                    error: 0, msg: 'success', response: 'Your number profile is not verified yet, please try again later'
                });
            }
        } else {
            return res.status(409).json({ error: 0, msg: 'success', response: 'No profile found.', data: [] });
        }

        // fetch all doctor stories
        let my_status = []
        let my_story_data = []
        let public_story_data = []
        let viewed_story = []
        let recent_story = []
        let my_stories = await stories_model.find({ user_id: req.user.user_id, is_active: 1 }).sort({ story_id: -1 });
        let stories_user_id = await stories_model.find({ is_active: 1, story_privacy: "public", user_id: { $nin: [req.user.user_id] } }).distinct('user_id');

        // my status story start 
        let my_status_obj = {
            'id': arrDocLinks[0].user_id,
            'title': 'DR',
            'name': arrDocLinks[0].name,
            'avatar': arrDocLinks[0].avatar,
            'verified_badge': 1,
        }
        if (my_stories.length > 0) {
            for (let j = 0; j < my_stories.length; j++) {
                let current_date = Date.now();
                let database_date = my_stories[j].created_at_story;
                let hours = Math.abs(database_date - current_date) / 36e5;
                let total_hours = Math.floor(hours);
                if (parseInt(total_hours) >= 24) {
                    const filter = { story_id: my_stories[j].story_id };
                    const update = { is_active: 0 };
                    let doc = await stories_model.updateOne(filter, update, {
                        returnOriginal: false
                    });
                }
                const story_obj = {
                    story_id: my_stories[j].story_id,
                    user_id: my_stories[j].user_id,
                    caption: my_stories[j].caption,
                    story_type: my_stories[j].story_type,
                    raw_data: my_stories[j].raw_data,
                    story_privacy: my_stories[j].story_privacy,
                    image: my_stories[j].image,
                    viewers_count: my_stories[j].viewers_count,
                    is_seen: 0,
                    created_at: my_stories[j].created_at,
                    created_at_story: my_stories[j].created_at_story,
                    updated_at: my_stories[j].updated_at,
                    _id: my_stories[j]._id,
                }
                my_story_data.push(story_obj)
            }
            my_status_obj['stories'] = my_story_data
            my_status_obj['created_at'] = my_stories[0].created_at
            my_status.push(my_status_obj)
        }



        // my status story end

        // public stories 

        let doctor_story_viewed_count = 0

        for (let i = 0; i < stories_user_id.length; i++) {
            let user_detail = await UserModel.findOne({ user_id: stories_user_id[i] })
            let stories = await stories_model.find({ user_id: stories_user_id[i], is_active: 1, story_privacy: "public" }).sort({ story_id: -1 });
            let all_story_viewed = await story_viewers_model.find({ viewer_id: stories_user_id[i] });
            let doclink_stories = {
                'id': user_detail.user_id,
                'title': 'DR',
                'name': user_detail.name,
                'avatar': user_detail.avatar,
                'verified_badge': 1,
            }
            for (let j = 0; j < stories.length; j++) {
                var story_viewed = await story_viewers_model.find({ story_id: stories[j].story_id, viewer_id: req.user.user_id });
                let current_date = Date.now();
                let database_date = stories[j].created_at_story;
                let hours = Math.abs(database_date - current_date) / 36e5;
                let total_hours = Math.floor(hours);
                if (story_viewed.length > 0) {
                    doctor_story_viewed_count++
                }
                if (parseInt(total_hours) >= 24) {
                    const filter = { story_id: stories[j].story_id };
                    const update = { is_active: 0 };
                    let doc = await stories_model.updateOne(filter, update, {
                        returnOriginal: false
                    });
                }
                const story_obj = {
                    story_id: stories[j].story_id,
                    user_id: stories[j].user_id,
                    caption: stories[j].caption,
                    story_type: stories[j].story_type,
                    raw_data: stories[j].raw_data,
                    story_privacy: stories[j].story_privacy,
                    image: stories[j].image,
                    viewers_count: stories[j].viewers_count,
                    created_at: stories[j].created_at,
                    created_at_story: stories[j].created_at_story,
                    updated_at: stories[j].updated_at,
                    _id: stories[j]._id,
                }

                if (story_viewed.length > 0) {
                    story_obj['is_seen'] = 1
                }
                else {
                    story_obj['is_seen'] = 0
                }

                public_story_data.push(story_obj)
            }
            doclink_stories['stories'] = public_story_data
            doclink_stories['created_at'] = stories[0].created_at
            console.log(doclink_stories);

            if (stories.length == doctor_story_viewed_count) {
                viewed_story.push(doclink_stories)
            }
            else {
                recent_story.push(doclink_stories)
            }
        }
        return res.status(201).json({
            error: 0, status: 'success', message: 'Fetched', recent_story: recent_story, viewed_story: viewed_story, my_status: my_status
        });
    } catch (error) {
        // common.error_log(req.user.user_id, req.user.name, 'doclink-mobile-app-backend', 'stories/get_doctor_stories', error.message, "http://3.252.226.91:3100/")
        console.log(error);
        res.status(500).json({ msg: "error", response: error.message })
    }
}

exports.get_patient_stories = async (req, res, next) => {
    try {

        // all patient time ranges 
        let time_range = await stories_model.find({ is_active: 1 });
        let final_story_status = 'viewed_story';
        let recent_story = [];
        let viewed_story = [];
        let user_id = 0;
        const auth_token = req.header('auth_token') ? req.header('auth_token') : ""
        const device_token = req.header('device_token') ? req.header('device_token') : ""
        console.log('==== auth_token');
        console.log(auth_token);
        console.log('==== device_token');
        console.log(device_token);
        // if auth token is available
        if (auth_token) {
            jwt.verify(auth_token, jwt_secret, function (err, decoded) {
                // check if token is invalid
                if (err) {
                    return res.status(401).json({ error: "token is not valid access denied" })
                }
                else {
                    // send user_id via middleware
                    user_id = decoded.user.user_id
                }
            });
        }

        console.log('=============');
        console.log(req.user);
        console.log('=====', user_id);

        if (user_id != 0) {
            console.log('privacy condition is running');
            // time range loop
            for (var i = 0; i < time_range.length; i++) {
                let current_date = Date.now();
                let database_date = time_range[i].created_at_story;
                var hours = Math.abs(database_date - current_date) / 36e5;
                var total_hours = Math.floor(hours);

                // remove story after 24 hours
                if (parseInt(total_hours) >= 24) {
                    const filter = { story_id: time_range[i].story_id };
                    const update = { is_active: 0 };
                    let doc = await stories_model.updateOne(filter, update, {
                        returnOriginal: false
                    });
                }
            }

            // all connected doctor 
            console.log('loop is running');

            let doctor_connected = await chatrooms.find({ patient_id: req.user.user_id }).distinct('doctor_id');
            let my_patient_id = await stories_model.find({ user_id: { $in: doctor_connected }, story_privacy: 'patient', is_active: 1 }).distinct('user_id');
            let public_stories = await stories_model.find({ story_privacy: "public", is_active: 1 }).distinct('user_id');
            let all_users = my_patient_id.concat(public_stories);
            let unique_users = [...new Set(all_users)];
            let my_patient_story_id = await stories_model.find({ user_id: { $in: doctor_connected }, story_privacy: 'patient', is_active: 1 }).distinct('story_id');
            let my_patient_story_viewed_count = await story_viewers_model.find({ story_id: { $in: my_patient_story_id }, story_privacy: "patient", viewer_id: req.user.user_id });
            let user_data = await UserModel.find({ user_id: { $in: unique_users } });
            var _docLinkObjects = {}
            // all my patient stories data  

            for (var i = 0; i < user_data.length; i++) {
                let story1 = await stories_model.find({ user_id: user_data[i]['user_id'], is_active: 1, story_privacy: 'patient' }).sort({ story_id: -1 });
                let story2 = await stories_model.find({ user_id: user_data[i]['user_id'], is_active: 1, story_privacy: 'public' }).sort({ story_id: -1 });
                let all_stories = story1.concat(story2);

                let story_viewed = await story_viewers_model.findOne({ story_id: all_stories[0].story_id })
                // all_stories.push(story1)
                _docLinkObjects = {
                    'id': user_data[i]['user_id'],
                    'title': user_data[i]['title'],
                    'name': user_data[i]['name'],
                    'avatar': user_data[i]['avatar'],
                    'verified_badge': 1,
                    'story_viewed': story_viewed,
                    'stories': all_stories
                }

                _docLinkObjects['created_at'] = all_stories[0].created_at;
                // _docLinkObjects.push(users_objects)
                // console.log('=================logging object');
                // console.log(_docLinkObjects);
                if (my_patient_story_id.length == my_patient_story_viewed_count.length) {
                    viewed_story.push(_docLinkObjects);
                    final_story_status = 'viewed_story'
                }
                else {
                    recent_story.push(_docLinkObjects);
                    final_story_status = 'recent_story'
                }
            }

            // public patients


            // let story_data = [];
            // // let public_stories = await stories_model.find({ story_privacy: "public", is_active: 1 }).distinct('user_id');
            // console.log('public story length===========');
            // console.log(public_stories.length)
            // for (var i = 0; i < public_stories.length; i++) {
            //     let public_story_id = await stories_model.find({ user_id: public_stories[i], story_privacy: 'public', is_active: 1 }).distinct('story_id');
            //     let public_story_viewed_count = await story_viewers_model.find({ story_id: { $in: public_story_id }, story_privacy: "public", $or: [{ viewer_id: user_id, device_token: device_token }, { device_token: device_token, viewer_id: user_id }] });
            //     let story1 = await stories_model.find({ user_id: public_stories[i], story_privacy: 'public', is_active: 1 }).sort({ story_id: -1 });
            //     let user_detail = await UserModel.findOne({ user_id: public_stories[i] });
            //     // var _docLinkObjects = {
            //     //     'id': user_detail.user_id,
            //     //     'title': user_detail.title,
            //     //     'name': user_detail.name,
            //     //     'avatar': user_detail.avatar,
            //     //     'verified_badge': 1,
            //     // }
            //     for (let j = 0; j < story1.length; j++) {
            //         var story_viewed = await story_viewers_model.find({ story_id: story1[j].story_id, $or: [{ viewer_id: user_id, device_token: device_token }, { device_token: device_token, viewer_id: user_id }] });

            //         const story_obj = {
            //             story_id: story1[j].story_id,
            //             user_id: story1[j].user_id,
            //             caption: story1[j].caption,
            //             story_type: story1[j].story_type,
            //             raw_data: story1[j].raw_data,
            //             story_privacy: story1[j].story_privacy,
            //             image: story1[j].image,
            //             viewers_count: story1[j].viewers_count,
            //             created_at: story1[j].created_at,
            //             created_at_story: story1[j].created_at_story,
            //             updated_at: story1[j].updated_at,
            //             _id: story1[j]._id,
            //         }

            //         if (story_viewed.length > 0) {
            //             story_obj['is_seen'] = 1
            //         }
            //         else {
            //             story_obj['is_seen'] = 0
            //         }

            //         story_data.push(story_obj);
            //     }
            //     all_stories.push(story_data)
            //     users_objects['stories'] = all_stories
            //     // _docLinkObjects['created_at'] = story1[0].created_at;
            //     console.log('===================');
            //     console.log('stories object++++++++++++++');
            //     console.log(_docLinkObjects);
            //     let unique_patient_data = [...new Set(_docLinkObjects)];
            //     story_data = []
            //     if (public_story_id.length == public_story_viewed_count.length && final_story_status == 'viewed_story') {
            //         console.log('condition 1 ============');
            //         viewed_story.push(unique_patient_data);
            //     }
            //     else {
            //         console.log('condition 1 ============');
            //         recent_story.push(unique_patient_data)
            //     }
            // }

        }



        // console.log('final_story_status==============');
        // console.log(final_story_status);
        // let story_data = [];
        // let public_stories = await stories_model.find({ story_privacy: "public", is_active: 1 }).distinct('user_id');

        // for (var i = 0; i < public_stories.length; i++) {
        //     let public_story_id = await stories_model.find({ user_id: public_stories[i], story_privacy: 'public', is_active: 1 }).distinct('story_id');
        //     let public_story_viewed_count = await story_viewers_model.find({ story_id: { $in: public_story_id }, story_privacy: "public", $or: [{ viewer_id: user_id, device_token: device_token }, { device_token: device_token, viewer_id: user_id }] });
        //     let story1 = await stories_model.find({ user_id: public_stories[i], story_privacy: 'public', is_active: 1 }).sort({ story_id: -1 });
        //     let user_detail = await UserModel.findOne({ user_id: public_stories[i] });
        //     var _docLinkObjects = {
        //         'id': user_detail.user_id,
        //         'title': user_detail.title,
        //         'name': user_detail.name,
        //         'avatar': user_detail.avatar,
        //         'verified_badge': 1,
        //     }
        //     for (let j = 0; j < story1.length; j++) {
        //         var story_viewed = await story_viewers_model.find({ story_id: story1[j].story_id, $or: [{ viewer_id: user_id, device_token: device_token }, { device_token: device_token, viewer_id: user_id }] });
        //         const story_obj = {
        //             story_id: story1[j].story_id,
        //             user_id: story1[j].user_id,
        //             caption: story1[j].caption,
        //             story_type: story1[j].story_type,
        //             raw_data: story1[j].raw_data,
        //             story_privacy: story1[j].story_privacy,
        //             image: story1[j].image,
        //             viewers_count: story1[j].viewers_count,
        //             created_at: story1[j].created_at,
        //             created_at_story: story1[j].created_at_story,
        //             updated_at: story1[j].updated_at,
        //             _id: story1[j]._id,
        //         }

        //         if (story_viewed.length > 0) {
        //             story_obj['is_seen'] = 1
        //         }
        //         else {
        //             story_obj['is_seen'] = 0
        //         }

        //         story_data.push(story_obj);
        //     }

        //     _docLinkObjects['stories'] = story_data;
        //     _docLinkObjects['created_at'] = story1[0].created_at;
        //     console.log('===================');
        //     console.log(_docLinkObjects);
        //     story_data = []
        //     if (public_story_id.length == public_story_viewed_count.length && final_story_status == 'viewed_story') {
        //         console.log('condition 1 ============');
        //         viewed_story.push(_docLinkObjects);
        //     }
        //     else {
        //         console.log('condition 1 ============');
        //         recent_story.push(_docLinkObjects)
        //     }
        // }
        // res send 
        return res.status(201).json({
            error: 0, status: 'success', message: 'Fetched', recent_story: recent_story, viewed_story: viewed_story
        });
    } catch (error) {
        common.error_log(1, 'req.user.name', 'doclink-mobile-app-backend', 'stories/get_patient_stories', error.message, "http://3.252.226.91:3100/")
        console.log(error);
    }
}

exports.viewed_patient_stories = async (req, res, next) => {
    try {

        // validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let story_id = req.body.story_id ? req.body.story_id : "";
        let user_id = 0;
        const auth_token = req.header('auth_token') ? req.header('auth_token') : ""
        const device_token = req.header('device_token') ? req.header('device_token') : ""

        // if auth token is available
        if (auth_token) {
            jwt.verify(auth_token, jwt_secret, function (err, decoded) {
                // check if token is invalid
                if (err) {
                    return res.status(401).json({ error: "token is not valid access denied" })
                }
                else {
                    // send user_id via middleware
                    user_id = decoded.user.user_id
                }
            });
        }

        // storyviewed count 
        var story_viewed = await story_viewers_model.find({ story_id: story_id, $or: [{ viewer_id: user_id, device_token: device_token }, { device_token: device_token, viewer_id: user_id }] });
        // if story already exits
        if (story_viewed.length == 0) {
            let story_detail = await stories_model.findOne({ story_id: story_id });
            const story_viewers = {
                story_id: story_id,
                viewer_id: user_id,
                device_token: device_token,
                viewed_at: moment().format(),
                story_privacy: story_detail.story_privacy,
                deleted_at: 'null'
            }
            await new story_viewers_model(story_viewers).save();
            const pre_stories_count = await stories_model.findOne({ story_id: story_id });

            const filter = { story_id: story_id };
            const update = { viewers_count: parseInt(pre_stories_count.viewers_count) + 1 };

            let doc = await stories_model.where('story_id').equals(story_id).updateOne(filter, update, {
                returnOriginal: false
            });

            return res.status(200).json({
                error: 0, status: 'success', message: 'Stored', data: []
            });
        }

        return res.status(200).json({
            error: 0, status: 'success', message: 'Story viewed already', data: []
        });
    } catch (error) {
        common.error_log(1, 'req.user.name', 'doclink-mobile-app-backend', 'stories/viewed_patient_stories', error.message, "http://3.252.226.91:3100/")
        console.log(error);
    }
}




