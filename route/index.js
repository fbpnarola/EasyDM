const express = require('express')
const router = express.Router()

router.use('/api',
    require('./auth.route'),
    require('./website.route'),
    require('./contentScheduler.route'),
    require('./members.route'),
    require('./backLink.route'),
    require('./pageView.route'),
    require('./dayBook.route')
)

module.exports = router