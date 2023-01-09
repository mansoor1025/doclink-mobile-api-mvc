const express = require('express');
const router = express.Router();
const FetchUsers = require('../middleware/FetchUsers');
const { body, query, validationResult } = require('express-validator');
const medical_records_model = require('../model/medical_records_model');
const medical_records_data_model = require('../model/medical_records_data');
const multer = require('multer');
// secret jwt token
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: async function (req, file, cb) {
        console.log('++++++++++++file');
        console.log(file);


        var string = file.originalname;
        string = string.replace(/ /g, "_");
        var random_number = Math.floor(Math.random() * 1000000000);
        const final_live_url = random_number + string
        // const finalization = `http://localhost:3500/uploads/${final_live_url}`
        const finalization = final_live_url

        let medical_record_count = await medical_records_model.findOne({}).sort({ mr_id: -1 });
        let medical_record_id = 0;

        if (medical_record_count == null) {
            medical_record_id = 1;
        }
        else {
            medical_record_id = parseInt(medical_record_count.mr_id) + 1;
        }

        final_medical_record_id = medical_record_id
        let medical_record_data_count = await medical_records_data_model.findOne({}).sort({ mrd_id: -1 });
        let medical_record_data_id = 0;
        if (medical_record_data_count == null) {
            medical_record_data_id = 1;
        }
        else {
            medical_record_data_id = parseInt(medical_record_data_count.mrd_id) + 1;
        }

        let medical_record_data = {
            mrd_id: medical_record_data_id,
            mr_id: medical_record_id,
            file_path: finalization,
            file_type: file.mimetype
        }

        await new medical_records_data_model(medical_record_data).save();
        cb(null, random_number + string);
    }
})
const upload = multer({ storage: storage });
const medicalRecordsController = require('../controllers/medicalRecordsController')

router.get('/view_type_of_records', FetchUsers, medicalRecordsController.view_type_of_records);

router.post('/add_medical_records', upload.array('record_file', 12), FetchUsers, medicalRecordsController.add_medical_records);

router.get('/view_medical_records', FetchUsers, medicalRecordsController.view_medical_records);

router.get('/view_all_medical_reports', FetchUsers, [query('mr_id', 'mr_id is required').exists()], medicalRecordsController.view_all_medical_reports);

router.post('/edit_medical_records', upload.array('record_file', 12), [query('mr_id', 'mr_id is required').exists()], FetchUsers, medicalRecordsController.edit_medical_records);

router.post('/delete_medical_records', [query('mr_id', 'mr_id is required').exists()], FetchUsers, medicalRecordsController.delete_medical_records);

router.get('/connected_doctors', FetchUsers, medicalRecordsController.connected_doctors);

router.post('/share_medical_records', FetchUsers, medicalRecordsController.share_medical_records);

router.post('/share_single_medical_records', FetchUsers, medicalRecordsController.share_single_medical_records);


module.exports = router;