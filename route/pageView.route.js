const express = require('express')
const router = express.Router()
const pageView = require('../controller/pageView.controller')
const authMiddleware = require('../middleware/auth.middleware')

router.post('/create_pageview', authMiddleware, pageView.createPageView)
router.get('/activity_pageview/:id', authMiddleware, pageView.viewActivity)
router.get('/get_pageview_ById/:id', authMiddleware, pageView.getPageViewById)
router.put('/update_pageview/:id', authMiddleware, pageView.updatePageView)
router.delete('/delete_pageview/:id', authMiddleware, pageView.deletePageView)
router.post('/pageviews', authMiddleware, pageView.getPageView)
router.get('/pageViewHistory/:id', authMiddleware, pageView.history)

module.exports = router;