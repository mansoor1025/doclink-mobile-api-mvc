const UserModel = require('../auth/UserModel');
const { body, query, validationResult } = require('express-validator');

exports.check_referral_code = async (req, res, next) => {
    try {
        const referral_codes = req.query.referral_code;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // check referral code is exists
        const referral_code = await UserModel.find({ referral_code: referral_codes, role: 2, is_verified: 1, is_number_verified: 1 });
        if (referral_code.length > 0) {
            return res.status(200).json({
                error: 0, status: 'Success', message: 'Doctor Profile', data: referral_code
            });
        }
        else {
            return res.status(409).json({
                msg: 'error', response: 'No Doctor Profile Found'
            });
        }

    } catch (error) {
        console.log(error);
        res.send(error);
    }
}