const express = require('express')
const router = express.Router()
const auth = require('../controller/auth.controller')
const imageMiddleware = require('../middleware/image.middleware')
const authMiddleware = require('../middleware/auth.middleware')

router.post('/registration', imageMiddleware.single('avatar'), auth.registration)
router.post('/login', auth.login)
router.get('/me', authMiddleware, auth.me)
router.post('/forgotLink', auth.forgotPassLink)
// router.post('/forgotpassword', auth.forgotPassword)
router.post('/resetpassword', authMiddleware, auth.resetPassword)

module.exports = router;


