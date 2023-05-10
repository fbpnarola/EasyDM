const jwt = require('jsonwebtoken');
const User = require('../model/User')

var checkUser = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res.json({ data: [], status: false, message: 'Token not exist!!' })
        }
        else {
            let token = authorization.split(' ')[1]
            let tokenData
            jwt.verify(token, process.env.SECRET_KEY, (err, verified) => {
                if (err) {
                    tokenData = undefined
                }
                else {
                    tokenData = verified
                }
            })
            if (tokenData === undefined) {
                return res.json({ data: [], status: false, message: 'Token expired!!' })
            }
            const user = await User.findOne({ $and: [{ _id: tokenData._id }, { isActive: true }] })
            req.logInid = tokenData;
            req.type = user.userRole
            next();
        }
    } catch (error) {
        return res.json({ data: [], status: false, message: 'Unauthorized User!!' })
    }
}

module.exports = checkUser