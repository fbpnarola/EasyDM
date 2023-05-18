const express = require('express')
const router = express.Router()
const website = require('../controller/website.controller')
const authMiddleware = require('../middleware/auth.middleware')

router.post('/create_website', authMiddleware, website.createWebsite)
router.get('/activity_website/:id', authMiddleware, website.viewActivity)
router.get('/get_website_ById/:id', authMiddleware, website.getWebsiteById)
router.put('/update_website/:id', authMiddleware, website.updateWebsite)
router.delete('/delete_website/:id', authMiddleware, website.deleteWebsite)
router.post('/get_websites', authMiddleware, website.getWebsites)
router.get('/dashboard', authMiddleware, website.dashboard)

module.exports = router;

