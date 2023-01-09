const express = require('express');
const router = express.Router();
const moment = require('moment');
const { body, query, validationResult } = require('express-validator');
const FetchUsers = require("../middleware/FetchUsers");
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
        console.log(file);

        var string = file.originalname;
        string = string.replace(/ /g, "_");
        cb(null, moment().format('YYYY-MM-DD') + '_' + string);
    }
})
const upload = multer({ storage: storage });
const profileController = require('../controllers/profileController')

router.post('/patient_profile', FetchUsers, upload.single('image'), profileController.patient_profile);

router.post('/send_notification', profileController.send_notification);

router.post('/send_notification_for_rest_api', profileController.send_notification_for_rest_api);


module.exports = router;