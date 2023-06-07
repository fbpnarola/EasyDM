const { check, validationResult } = require('express-validator')

exports.checkUser = [
    check('name').trim().not().isEmpty().withMessage('Name is required!!!'),
    check('email').isEmail().withMessage("Please enter proper emailid!!"),
    check('password').trim().not().isEmpty().withMessage('password is required!!!')
]

exports.checkWebsite = [
    check('category').trim().not().isEmpty().withMessage('Category is required!!!'),
    check('webpage').trim().not().isEmpty().withMessage('Webpage is required!!!'),
    check('webpageUrl').trim().not().isEmpty().withMessage('Webpage Url is required!!!'),
    check('publishedOn').trim().not().isEmpty().withMessage('Published Date is required!!!'),
    check('effectiveFrom').trim().not().isEmpty().withMessage('effectiveFrom Date is required!!!')
]

exports.checkContentScheduler = [
    check('webpage').trim().not().isEmpty().withMessage('Webpage is required!!!'),
    check('contentType').trim().not().isEmpty().withMessage('Content Type is required!!!'),
    check('topicTitle').trim().not().isEmpty().withMessage('Topic Title is required!!!'),
    check('assignedOn').trim().not().isEmpty().withMessage('Assigned Date is required!!!'),
    check('assignedBy').trim().not().isEmpty().withMessage('Assigned By is required!!!'),
    check('submitedOn').trim().not().isEmpty().withMessage('Submission Date is required!!!'),
    check('writtenBy').trim().not().isEmpty().withMessage('Written By is required!!!'),

]

exports.checkPageViews = [
    check('webpage').trim().not().isEmpty().withMessage('Webpage is required!!!'),
    check('publishedOn').trim().not().isEmpty().withMessage('Published Date is required!!!'),
    check('monthYear').trim().not().isEmpty().withMessage('Please select monthYear!!!'),
    check('numberOfPageviews').trim().not().isEmpty().withMessage('Qty of Pageviews are required!!!')
]

exports.login = [
    check('username').trim().not().isEmpty().withMessage('Username is required!!!'),
    check('password').trim().not().isEmpty().withMessage('password is required!!!')
]

exports.valResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array()[0].msg;
        return res.status(422).json({ data: [], status: false, message: error })
    }
    next();
};