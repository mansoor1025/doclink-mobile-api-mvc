const jwt = require('jsonwebtoken');
// secret jwt token
const jwt_secret = 'doclink-mobile-api';
const UserModel = require('../auth/UserModel')
// fetch user function
const sessionLogout = async (req, res, next) => {
    try {
        const device_token = req.header('device_token');
        const phone_number = req.header('phone_number');
        console.log("device_token", device_token);
        console.log("phone_number", phone_number);
        console.log('sessionLogout is running');
        // if token is empty
        if (!device_token) {
            return res.status(401).json({ error: "device token cannot be empty" })
        }

        if (phone_number != 'null') {
            const user_detail = await UserModel.find({ phone_number: phone_number, device_token: device_token, is_active: 1 });
            if (user_detail.length == 0) {
                console.log('this device token is expired kindly logout device');
                return res.status(401).json({ msg: "error", response: "this device token is expired kindly logout device" })
            }
        }
        else {
            console.log('phone number is not found');
        }
        next()
    } catch (error) {
        // error handling
        console.log(error);
        return res.status(401).json({ error: "token is not valid access denied" })
    }
}

module.exports = sessionLogout;