const express = require('express')
const router = express.Router()
const backLink = require('../controller/backLink.controller')
const authMiddleware = require('../middleware/auth.middleware')

router.post('/create_backlink', authMiddleware, backLink.createBackLinks)
router.get('/activity_backlink/:id', authMiddleware, backLink.viewActivity)
router.get('/get_backlink_ById/:id', authMiddleware, backLink.getBackLinksById)
router.put('/update_backlink/:id', authMiddleware, backLink.updateBackLinks)
router.delete('/delete_backlink/:id', authMiddleware, backLink.deleteBackLinks)
router.post('/backlinks', authMiddleware, backLink.getBackLinks)
router.get('/backLinkHistory/:id', authMiddleware, backLink.history)

module.exports = router;