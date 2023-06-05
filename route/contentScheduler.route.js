const express = require('express')
const router = express.Router()
const contentScheduler = require('../controller/contentScheduler.controller')
const authMiddleware = require('../middleware/auth.middleware')
const { checkContentScheduler, valResult } = require('../middleware/validation.middleware')

router.post('/create_scheduler', authMiddleware, checkContentScheduler, valResult, contentScheduler.createContentScheduler)
router.get('/activity_scheduler/:id', authMiddleware, contentScheduler.viewActivity)
router.get('/get_scheduler_ById/:id', authMiddleware, contentScheduler.getContentSchedulersById)
router.put('/update_scheduler/:id', authMiddleware, contentScheduler.updateContentScheduler)
router.delete('/delete_scheduler/:id', authMiddleware, contentScheduler.deleteContentScheduler)
router.post('/scheduler', authMiddleware, contentScheduler.getContentScheduler)

module.exports = router;