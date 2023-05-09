const express = require('express')
const router = express.Router()
const members = require('../controller/members.controller')
const imageMiddleware = require('../middleware/image.middleware')
const authMiddleware = require('../middleware/auth.middleware')

router.post('/members', authMiddleware, members.getAllMembers)
router.put('/update_member/:id', authMiddleware, imageMiddleware.single('avatar'), members.updateMember)
router.delete('/delete_member/:id', authMiddleware, members.deleteMember)
router.get('/get_member_ById/:id', authMiddleware, members.getMemberById)

module.exports = router;