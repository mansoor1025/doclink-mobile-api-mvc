const express = require('express');
const router = express.Router();
const jsdom = require("jsdom");
const dom = new jsdom.JSDOM(`<!DOCTYPE html>`)
const jquery = require("jquery")(dom.window);
router.post(
    "/easypaisa_payment_url",
    async function (req, res, next) {
        try {
            const orderId = req.body.orderId;
            const amount = req.body.amount;
            const encryptedHashRequest = req.body.encryptedHashRequest;
            const url = 'https://easypay.easypaisa.com.pk/tpg/?';
            var params = {
                storeId: 72190,
                orderId: orderId,
                transactionAmount: amount,
                mobileAccountNo: '',
                emailAddress: '',
                transactionType: "InitialRequest",
                tokenExpiry: '',
                bankIdentificationNumber: '',
                encryptedHashRequest: encryptedHashRequest,
                merchantPaymentMethod: '',
                postBackURL: 'https://doclinkpay.com/easypaisa',
                signature: ''
            };

            const str = jquery.param(params);
            const payment_url = url+str
            
            console.log(str);
            return res.status(200).json({ msg: "success", response: payment_url })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: "success", response: error.message })
        }

    }
);






module.exports = router;