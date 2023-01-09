const setting_model = require('../model/SettingModel')

exports.view_terms_conition = async (req, res, next) => {
    try {
        const term_condition = await setting_model.findOne({ name: "Terms of Use" })
        return res.status(200).json({ msg: "success", response: term_condition })
    } catch (error) {
        return res.status(500).json({ msg: "error", response: error.message })
    }
}