const express = require('express');
const router = express.Router();
const FetchUsers = require('../middleware/FetchUsers');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        var string = file.originalname;
        string = string.replace(/ /g, "_");
        var random_number = Math.floor(Math.random() * 1000000000);
        cb(null, random_number + string);
    }
})
const upload = multer({ storage: storage });
const sessionLogout = require('../middleware/sessionLogout')
const storiesController = require('../controllers/storiesController')

router.post('/add_doctor_stories', upload.single('image'), FetchUsers, [body('story_type').exists(), body('data').exists(), body('story_privacy').exists()], storiesController.add_doctor_stories);

router.get('/get_doctor_stories', FetchUsers, storiesController.get_doctor_stories);

router.get('/get_patient_stories', FetchUsers, storiesController.get_patient_stories);

router.post('/viewed_patient_stories', sessionLogout, [body('story_id').exists()], storiesController.viewed_patient_stories);

module.exports = router;