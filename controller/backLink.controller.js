const BackLinks = require('../model/BackLinks')
const Website = require('../model/Website')
const Activity = require('../model/ActivityBackLinks')
const ContentScheduler = require('../model/ContentScheduler')
const paginate = require('../helper/paginate')
// const monthYearWiseData = require('../helper/monthYearWiseData')

exports.checkBackLinks = async (req, res) => {
    try {
        const backLinkData = { ...req.body }
        let conditionArray = [{ domain: backLinkData.domain }]
        if (backLinkData.webpage) {
            conditionArray.push({ webpage: backLinkData.webpage })
        }
        if (backLinkData.contentScheduler && backLinkData.contentScheduler !== null) {
            conditionArray.push({ contentScheduler: backLinkData.contentScheduler })
        }
        const oldData = await BackLinks.findOne({ $and: conditionArray })
        if (oldData) {
            return res.json({ data: [oldData], status: true, message: "ID Password found!!" })
        }
        return res.json({ data: [], status: true, message: "ID Password not found!!" })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.createBackLinks = async (req, res) => {
    try {
        const backLinkData = { ...req.body }
        const oldData = await BackLinks.findOne({ $and: [{ domain: backLinkData.domain }, { directUrl: backLinkData.directUrl }, { date: backLinkData.date }] })
        if (oldData) {
            return res.json({ data: [], status: false, message: "BackLink already exists with the same domain!!" })
        }
        if (backLinkData.contentScheduler !== null) {
            const data1 = await ContentScheduler.findById(backLinkData.contentScheduler)
            backLinkData.webpage = data1.webpage
        }
        backLinkData.addedBy = req.logInid
        const backLink = await BackLinks.create(backLinkData)
        if (!backLink) {
            return res.json({ data: [], status: false, message: "Something went wrong! Not able to create Back Link!!" })
        }
        const activityData = {
            backLinksId: backLink._id,
            addedBy: req.logInid,
            details: 'Back Link Created.',
            time: backLink.createdAt,
            date: backLink.date
        }
        await Activity.create(activityData)
        return res.json({ data: [backLink], status: true, message: 'Back Link created successfully!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.updateBackLinks = async (req, res) => {
    try {
        const checkLink = await BackLinks.findById(req.params.id)
        if (!checkLink) {
            return res.json({ data: [], status: false, message: "This back link is not exist!!" })
        }
        const linkData = { ...req.body }
        if (Object.keys(linkData).length === 0) {
            return res.json({ data: [], status: true, message: "Cannot update empty object!!" })
        }
        const updatedFields = [], updatedValues = []
        let fieldList = []

        for (const [keys, value] of Object.entries(req.body)) {
            let finalValue = value
            fieldList.push(keys)
            updatedFields.push(' ' + keys)
            if (keys === 'webpage') {
                const webdata = await Website.findById(value)
                finalValue = webdata.webpage
            }
            if (keys === 'contentScheduler') {
                const contentdata = await ContentScheduler.findById(value)
                finalValue = contentdata.topicTitle
            }
            updatedValues.push(finalValue)
        }
        let newDataObject = {}
        fieldList.forEach((element, index) => {
            newDataObject[element] = updatedValues[index];
        });

        fieldList.push('-_id')
        const oldLinkData = await BackLinks.findById(req.params.id).select(fieldList)
        let oldDataObject = { ...oldLinkData._doc }
        if (oldLinkData.contentScheduler && oldLinkData.contentScheduler !== null) {
            const checkData = await ContentScheduler.findById(oldLinkData.contentScheduler)
            oldDataObject.contentScheduler = checkData.topicTitle
        }
        if (oldLinkData.webpage) {
            const checkData = await Website.findById(oldLinkData.webpage)
            oldDataObject.webpage = checkData.webpage
        }
        const updateLink = await BackLinks.findByIdAndUpdate(req.params.id, linkData)
        if (!updateLink) {
            return res.json({ data: [], status: false, message: 'Not able to update Content Scheduler!!' })
        }
        const activityData = {
            backLinksId: checkLink._id,
            addedBy: req.logInid,
            activityName: 'Updated',
            oldData: oldDataObject,
            newData: newDataObject,
            details: 'Updated ' + updatedFields + ' Fields.',
            time: checkLink.updatedAt,
            date: linkData.date
        }
        await Activity.create(activityData)
        return res.json({ data: [], status: true, message: 'Back Link updated!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.deleteBackLinks = async (req, res) => {
    try {
        const checkLink = await BackLinks.findById(req.params.id)
        if (!checkLink) {
            return res.json({ data: [], status: false, message: "This back link is not exist!!" })
        }
        if (req.type === 2 && req.logInid !== checkLink.addedBy) {
            return res.json({ data: [], status: false, message: 'Only Admin or User who created the BackLink can delete the back link!!' })
        }
        const deleteLink = await BackLinks.findByIdAndRemove(req.params.id)
        if (!deleteLink) {
            return res.json({ data: [], status: false, message: 'Not able to update back link!!' })
        }
        return res.json({ data: [], status: true, message: 'Back link deleted!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.viewActivity = async (req, res) => {
    try {
        const checkLink = await BackLinks.findById(req.params.id)
        if (!checkLink) {
            return res.json({ data: [], status: false, message: "This back link is not exist!!" })
        }
        const activityData = await Activity.find({ backLinksId: req.params.id })
            .populate('addedBy', 'name avatar')
            .sort({ createdAt: -1 })
        if (!activityData) {
            return res.json({ data: [], status: false, message: 'Not able to fetch data for this back link!!' })
        }
        return res.json({ data: [activityData], status: true, message: "All the activity data." })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getBackLinks = async (req, res) => {
    try {
        const option = { ...req.body };
        if (!option.hasOwnProperty('query')) {
            option['query'] = {};
        }
        option.query['isDeleted'] = false
        if (option.query.hasOwnProperty('date')) {
            let latestDate = new Date(option.query.date.$lte)
            option.query.date.$lte = latestDate.setDate(latestDate.getDate() + 1)
        }
        const backLinks = await paginate(option, BackLinks);
        for (const element of backLinks.list) {
            let contentTitle = null
            if (element.contentScheduler !== null) {
                const contentData = await ContentScheduler.findById(element.contentScheduler)
                contentTitle = contentData.topicTitle
            }
            element.contentTopicTitle = contentTitle
        }
        return res.json({ data: [backLinks], status: true, message: "Data Listed Successfully" });
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

// exports.getBackLinksById = async (req, res) => {
//     try {
//         const checkLink = await BackLinks.findById(req.params.id)
//             .populate('webpage', 'webpage category')
//         if (!checkLink) {
//             return res.json({ data: [], status: false, message: "This back link is not exist!!" })
//         }
//         return res.json({ data: [checkLink], status: true, message: "Particular Back Link's data." })
//     } catch (error) {
//         return res.json({ data: [], status: false, message: error.message })
//     }
// }

// exports.history = async (req, res) => {
//     try {
//         const condition = [{ webpage: req.params.id }]
//         const finalData = await monthYearWiseData.month_year_wise_data_model(BackLinks, condition, "monthYear", "numberOfBacklinks")
//         return res.json({ data: finalData, status: true, message: "Last 1 Year's Data." })
//     } catch (error) {
//         return res.json({ data: [], status: false, message: error.message })
//     }
// }