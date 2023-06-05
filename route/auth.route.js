const express = require('express')
const router = express.Router()
const auth = require('../controller/auth.controller')
const imageMiddleware = require('../middleware/image.middleware')
const authMiddleware = require('../middleware/auth.middleware')
const { login, checkUser, valResult } = require('../middleware/validation.middleware')

router.post('/registration', checkUser, valResult, imageMiddleware.single('avatar'), auth.registration)
router.post('/login', login, valResult, auth.login)
router.get('/me', authMiddleware, auth.me)
router.post('/forgotLink', auth.forgotPassLink)
// router.post('/forgotpassword', auth.forgotPassword)
router.post('/resetpassword', authMiddleware, auth.resetPassword)

module.exports = router;


