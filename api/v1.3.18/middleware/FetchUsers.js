const jwt = require('jsonwebtoken');
// secret jwt token
const jwt_secret = 'doclink-mobile-api';
const UserModel = require('../auth/UserModel')
// fetch user function
const FetchUsers = async (req, res, next) => {
    try {

        const token = req.header('auth_token');
        const device_token = req.header('device_token');
        const phone_number = req.header('phone_number');
        console.log('fetch user middleware is running');
        console.log('phone_number');
        // if token is empty
        if (!token) {
            console.log('token is not valid access denied');
            return res.status(401).json({ error: "token is not valid access denied" })
        }

        // if token is empty
        if (!device_token) {
            console.log('device condition');
            return res.status(401).json({ error: "device token cannot be empty" })
        }

        console.log('verify jwt condition');
        // verify jwt token
        jwt.verify(token, jwt_secret, async function (err, decoded) {
            console.log('conditon 1');
            // check if token is invalid
            if (err) {
                console.log('conditon 2');
                return res.status(401).json({ error: "token is not valid access denied" })
            }
            else {
                console.log('conditon 3');
                // send user_id via middleware
                req.user = decoded.user;
                console.log('req.user.user_id', req.user.user_id);
                console.log('device_token', device_token);
                const user_detail = await UserModel.find({ user_id: req.user.user_id, $or: [{ device_token: device_token, is_active: 1 }, { device_token: 'null', is_active: 1 }] })
                
                if (user_detail.length == 0) {
                    console.log('this device token is expired kindly logout device');
                    return res.status(401).json({ msg: "error", response: "this device token is expired kindly logout device" })
                }
                next()
            }

        });
    } catch (error) {
        // error handling
        console.log(error);
        return res.status(401).json({ error: "token is not valid access denied" })
    }
}

module.exports = FetchUsers;