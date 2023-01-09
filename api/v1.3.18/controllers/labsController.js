const user_subs_plan_model = require('../model/user_subs_plan_model')
const { body, query, validationResult } = require('express-validator');
const lab_modal = require('../model/lab_modal')
const lab_branch = require('../model/lab_branch_modal')
const lab_fees_modal = require('../model/lab_fees_modal')
const lab_test_booking = require('../model/lab_test_booking_modal')
const lab_test_details = require('../model/lab_test_details_modal')
const lab_child_category = require('../model/lab_child_category')


exports.view_all_labs = async (req, res, next) => {
    try {
        const user_id = req.user.user_id
        const lab_arr = []
        const { page = 1, limit = 5 } = req.query;
        let lab_data = '';
        const subscribe_plan_exists = await user_subs_plan_model.find({ patient_id: user_id, is_active: 1 })
        console.log("user_id", user_id);
        if (req.query.name) {
            lab_data = await lab_modal.find({ is_active: 1, name: { $regex: req.query.name, $options: 'i' } }).limit(limit * 1).skip((page - 1) * limit).sort({ labs_id: -1 });
        }
        else {
            lab_data = await lab_modal.find({ is_active: 1 }).limit(limit * 1).skip((page - 1) * limit).sort({ labs_id: -1 });
        }
        const all_over_lab = await lab_modal.find({ is_active: 1 });
        for (let i = 0; i < lab_data.length; i++) {
            console.log('************* lab id');
            console.log("lab_id", lab_data[i].labs_id);
            const lab_branchs = await lab_branch.find({ is_active: 1, lab_id: lab_data[i].labs_id })
            let lab_obj = {
                labs_id: lab_data[i].labs_id,
                name: lab_data[i].name,
                image: lab_data[i].image,
                opening_hours: lab_branchs[0].opening_hours,
                closing_hours: lab_branchs[0].closing_hours,
                general_test_upto: lab_data[i].general_test_upto,
                subscriber_test_upto: lab_data[i].subscriber_test_upto,
                general_test_status: subscribe_plan_exists.length > 0 ? 0 : 1,
                subscriber_test_status: 1,
                branches: lab_branchs.length

            }
            lab_arr.push(lab_obj)
        }
        return res.status(200).json({ msg: "success", lab_arr: lab_arr, total: lab_arr.length, all_over_lab: all_over_lab.length })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "error", response: error.message })

    }
}

exports.active_test = async (req, res, next) => {
    try {
        // validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const lab_test_arr = []
        const labs_id = req.query.labs_id
        const { page = 1, limit = 5 } = req.query;
        const all_over_lab_test = await lab_fees_modal.find({ is_active: 1, lab_id: labs_id, subscription_type: "non_subscription" }).distinct('child_name')
        let lab_fees_data = '';
        if (req.query.name) {
            lab_fees_data = await lab_fees_modal.find({ is_active: 1, lab_id: labs_id, subscription_type: "non_subscription", child_name: { $regex: req.query.name, $options: 'i' } }).distinct('child_name')
        }
        else {
            lab_fees_data = await lab_fees_modal.find({ is_active: 1, lab_id: labs_id, subscription_type: "non_subscription" }).distinct('child_name')
        }
        console.log('****************');
        console.log(lab_fees_data);
        for (let i = 0; i < lab_fees_data.length; i++) {
            const lab_fees_detail = await lab_fees_modal.find({ child_name: lab_fees_data[i], is_active: 1, lab_id: labs_id, subscription_type: "non_subscription" }).select('lab_id child_name amount discounted_amount child_id').limit(limit * 1).skip((page - 1) * limit).sort({ labs_id: -1 });
            lab_test_arr.push(lab_fees_detail[0])
        }
        return res.status(200).json({ msg: "success", lab_test_arr: lab_test_arr, total: lab_test_arr.length, all_over_lab_test: all_over_lab_test.length })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "error", response: error.message })

    }
}

exports.lab_booking = async (req, res, next) => {
    try {
        // validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const lab_id = req.body.lab_id
        const total_amount = req.body.total_amount
        const user_id = req.user.user_id
        const patient_name = req.body.patient_name
        const age = req.body.age
        const phone_number = req.body.phone_number
        const branch_id = req.body.branch_id
        const prescription = req.body.prescription
        const collection_date = req.body.collection_date
        const lab_test_id = req.body.lab_test_id
        const lab_visit = req.body.lab_visit
        const home_visit = req.body.home_visit
        const description = req.body.description
        const address = req.body.address

        if (lab_test_id.length == 0) {
            return res.status(409).json({ msg: "error", response: "lab test name and id is required" })
        }

        let ltb_final_id = 0;
        let ltb_count = await lab_test_booking.findOne({}).sort({ ltb_id: -1 });
        if (ltb_count == null) {
            ltb_final_id = 1;
        } else {
            ltb_final_id = parseInt(ltb_count.ltb_id) + 1;
        }

        const branch_details = await lab_branch.findOne({ branch_id: branch_id, lab_id, lab_id, is_active: 1 })
        const home_visit_charges = await lab_modal.findOne({ labs_id: lab_id, is_active: 1 })
        let lbt_obj = {
            ltb_id: ltb_final_id,
            lab_id: lab_id,
            total_amount: total_amount,
            user_id: user_id,
            patient_name: patient_name,
            age: age,
            phone_number: phone_number,
            branch_id: branch_id,
            branch_name: branch_details.name,
            prescription: prescription,
            collection_date: collection_date,
            lab_visit: lab_visit,
            home_visit: home_visit
        }

        if (home_visit == 1) {
            lbt_obj['address'] = address
            lbt_obj['description'] = description
            lbt_obj['home_visit_charges'] = home_visit_charges.home_visit_charges
        }

        console.log('lab_test detail*******************');
        console.log(lab_test_id);
        if (lab_test_id.length > 0) {
            for (let i = 0; i < lab_test_id.length; i++) {
                let lab_child_details = await lab_child_category.findOne({ lcc_id: lab_test_id[i], is_active: 1 })
                let ltd_final_id = 0;
                let ltd_count = await lab_test_details.findOne({}).sort({ ltd_id: -1 });
                if (ltd_count == null) {
                    ltd_final_id = 1;
                } else {
                    ltd_final_id = parseInt(ltd_count.ltd_id) + 1;
                }

                let ltd_obj = {
                    ltd_id: ltd_final_id,
                    lbt_id: ltb_final_id,
                    user_id: user_id,
                    lab_id: lab_id,
                    lab_child_name: lab_child_details.child_name,
                    test_id: lab_test_id[i],
                }

                await new lab_test_details(ltd_obj).save();
            }
        }
        else {
            return res.status(409).json({ msg: "error", response: "lab test name and id is required" })
        }


        await new lab_test_booking(lbt_obj).save();

        return res.status(200).json({ msg: "success", response: "lab test booking successfully" })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "error", response: error.message })

    }
}




