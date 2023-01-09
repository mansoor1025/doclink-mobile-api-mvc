const express = require('express');
const router = express.Router();
const { body, query, validationResult, header } = require('express-validator');
const FetchUsers = require('../middleware/FetchUsers');
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
const sessionLogout = require('../middleware/sessionLogout')
const upload = multer({ storage: storage });
const doctorController = require('../controllers/doctorController')

router.get('/bst', sessionLogout, [
    query('screen_name', 'screen_name is required').exists()], doctorController.bst);

router.get('/search_doctor', sessionLogout, doctorController.search_doctor);

router.get('/search_filter', sessionLogout, doctorController.search_filter);

router.get('/all_top_rated_doctor', sessionLogout, doctorController.all_top_rated_doctor);

router.get('/doctor_profile_id', sessionLogout, [
    query('doctor_id', 'doctor_id is required').exists()], doctorController.doctor_profile_id);

router.post(
    "/doctor_basic_profile", sessionLogout, upload.single('image'), doctorController.doctor_basic_profile
);

router.post(
    "/doctor_unavailable", [
    body('doctor_id', 'doctor_id is required').exists(),
    body('patient_id', 'patient_id is required').exists(),
], sessionLogout, doctorController.doctor_unavailable
);

router.post(
    "/doctor_update", upload.single('image'), [
    body('doctor_id', 'doctor_id is required').exists(),
], FetchUsers, doctorController.doctor_update);

module.exports = router;