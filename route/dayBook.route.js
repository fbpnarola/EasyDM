const express = require('express')
const router = express.Router()
const dayBook = require('../controller/dayBook.controller')
const authMiddleware = require('../middleware/auth.middleware')

router.post('/create_daybook', authMiddleware, dayBook.createDayBook)
router.get('/activity_daybook/:id', authMiddleware, dayBook.viewActivity)
router.get('/get_daybook_ById/:id', authMiddleware, dayBook.getDayBookById)
router.put('/update_daybook/:id', authMiddleware, dayBook.updateDayBook)
router.delete('/delete_daybook/:id', authMiddleware, dayBook.deleteDayBook)
router.post('/daybooks', authMiddleware, dayBook.getDayBook)
router.post('/usersdaybooks/:id', authMiddleware, dayBook.getDayBookOfUser)
router.post('/userDayBookActivity', authMiddleware, dayBook.userDayBookActivity)

module.exports = router;