const User = require('../model/User')
const paginate = require('../helper/paginate')
const bcrypt = require('bcryptjs');

exports.getAllMembers = async (req, res) => {
    try {
        const option = { ...req.body };
        if (!option.hasOwnProperty('query')) {
            option['query'] = {};
        }
        option.query['userRole'] = { $ne: 1 }

        const member = await paginate(option, User);
        return res.json({ data: [member], status: true, message: "All member's data!!" });
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.updateMember = async (req, res) => {
    try {
        const checkUser = await User.findById(req.params.id)
        if (!checkUser) {
            return res.json({ data: [], status: false, message: 'This member is not available!!' })
        }
        const userData = { ...req.body }
        if (Object.keys(userData).length === 0) {
            return res.json({ data: [], status: true, message: "Cannot update empty object!!" })
        }
        let avatar = "";
        if (req.file !== undefined) {
            avatar = req.file.filename;
            userData.avatar = avatar
        }
        if (req.body.password) {
            if (req.type !== 1) {
                return res.json({ data: [], status: false, message: 'Only Admin can change the password!!' })
            }
            const hashPass = await bcrypt.hash(req.body.password, 10)
            userData.password = hashPass
        }
        const checkUpdate = await User.findByIdAndUpdate(req.params.id, userData)
        if (!checkUpdate) {
            return res.json({ data: [], status: false, message: 'Not able to update member!!' })
        }
        const updatedData = await User.findById(checkUpdate._id)
        return res.json({ data: [updatedData], status: true, message: 'Member updated!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.deleteMember = async (req, res) => {
    try {
        const checkUser = await User.findById(req.params.id)
        if (!checkUser) {
            return res.json({ data: [], status: false, message: 'This member is not available!!' })
        }
        if (req.type === 2) {
            return res.json({ data: [], status: false, message: 'Only Admin can delete the member!!' })
        }
        const deleteUser = await User.findByIdAndRemove(req.params.id)
        if (!deleteUser) {
            return res.json({ data: [], status: false, message: 'Not able to update member!!' })
        }
        return res.json({ data: [], status: true, message: 'Member deleted!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getMemberById = async (req, res) => {
    try {
        const checkMember = await User.findById(req.params.id)
        if (!checkMember) {
            return res.json({ data: [], status: false, message: "This member is not exist!!" })
        }
        return res.json({ data: [checkMember], status: true, message: "Particular member's data." })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}