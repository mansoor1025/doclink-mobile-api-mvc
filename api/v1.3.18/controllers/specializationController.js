const { body, query, validationResult } = require('express-validator');
const specialization_model = require('../model/specializations_model');
const UserModel = require('../auth/UserModel');

exports.view_specialization = async (req, res, next) => {
    try {
        let spec_data = '';
        if (req.query.name) {
            spec_data = await specialization_model
                .find({
                    name: { $regex: req.query.name, $options: "i" },
                    is_active: 1,
                })
        } else {
            // if name is not defined
            spec_data = await specialization_model
                .find({
                    is_active: 1,
                })
        }

        res.status(200).json({ msg: "success", response: spec_data })
    } catch (error) {
        return res.status(200).json({ msg: "error", response: error.message })
    }
}

exports.specliazation_via_doctor = async (req, res, next) => {
    try {
        // check all required fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        console.log('logging');
        const spec_id = req.query.spec_id;
        const user_details = await UserModel.find({ specialization_id: spec_id })

        res.status(200).json({ msg: "success", response: user_details })
    } catch (error) {
        return res.status(200).json({ msg: "error", response: error.message })
    }
}

