const BackLinks = require('../model/BackLinks')
const Activity = require('../model/ActivityBackLinks')
const paginate = require('../helper/paginate')
const moment = require('moment')
const monthYearWiseData = require('../helper/monthYearWiseData')

exports.createBackLinks = async (req, res) => {
    try {
        const backLinkData = { ...req.body }
        const oldData = await BackLinks.findOne({ $and: [{ webpage: backLinkData.webpage }, { monthYear: backLinkData.monthYear }] })
        if (oldData) {
            return res.json({ data: [], status: false, message: "Back Link already created for this webpage with same month-year!!" })
        }
        const backLink = await BackLinks.create(backLinkData)
        if (!backLink) {
            return res.json({ data: [], status: false, message: "Something went wrong! Not able to create Back Link!!" })
        }
        const activityData = {
            backLinksId: backLink._id,
            addedBy: req.logInid,
            details: 'Back Link Created.',
            time: backLink.createdAt,
            monthYear: backLink.monthYear,
            numberOfBacklinks: backLink.numberOfBacklinks
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
        let fieldList = ['-_id']
        Object.keys(req.body).forEach(function (fields) {
            fieldList.push(fields)
            updatedFields.push(' ' + fields)
        })
        Object.values(req.body).forEach(function (value) {
            updatedValues.push(value)
        })
        const oldLinkData = await BackLinks.findById(req.params.id).select(fieldList)
        const updateLink = await BackLinks.findByIdAndUpdate(req.params.id, linkData)
        if (!updateLink) {
            return res.json({ data: [], status: false, message: 'Not able to update Content Scheduler!!' })
        }

        const activityData = {
            backLinksId: checkLink._id,
            addedBy: req.logInid,
            activityName: 'Updated',
            oldData: oldLinkData,
            newData: linkData,
            details: 'Updated ' + updatedFields + ' Fields.',
            time: checkLink.updatedAt,
            monthYear: linkData.monthYear,
            numberOfBacklinks: linkData.numberOfBacklinks
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
        if (req.type === 2) {
            return res.json({ data: [], status: false, message: 'Only Admin can delete the back link!!' })
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

exports.getBackLinks = async (req, res) => {
    try {
        const option = { ...req.body };
        if (!option.hasOwnProperty('query')) {
            option['query'] = {};
        }
        option.query['isDeleted'] = false
        const backLinks = await paginate(option, BackLinks);
        return res.json({ data: [backLinks], status: true, message: "Data Listed Successfully" });
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getBackLinksById = async (req, res) => {
    try {
        const checkLink = await BackLinks.findById(req.params.id)
            .populate('webpage', 'webpage category')
        if (!checkLink) {
            return res.json({ data: [], status: false, message: "This back link is not exist!!" })
        }
        return res.json({ data: [checkLink], status: true, message: "Particular Back Link's data." })
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

exports.history = async (req, res) => {
    try {
        const condition = [{ webpage: req.params.id }]
        const finalData = await monthYearWiseData.month_year_wise_data_model(BackLinks, condition, "numberOfBacklinks")
        // let monthYear = [], data = [], finalData = []
        // const date = new Date();
        // const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        // var dateFrom = moment(firstDay).subtract(1, 'years')
        // let lastMOnth
        // for (let i = 1; i <= 12; i++) {
        //     let nextMonth = moment(dateFrom).add(i, 'months')
        //     lastMOnth = moment(nextMonth).subtract(1, 'months')
        //     const month = moment(lastMOnth).format('MMM')
        //     const year = moment(lastMOnth).format('YYYY');
        //     const betweenDate = { $lte: nextMonth, $gt: lastMOnth }
        //     const monthWise = await BackLinks.find({ $and: [{ isDeleted: false }, { monthYear: betweenDate }, { webpage: req.params.id }] })
        //     let count = 0
        //     monthWise.forEach(element => {
        //         count = count + element.numberOfBacklinks
        //     });
        //     monthYear.push(`${month} - ${year}`)
        //     data.push(count)
        //     finalData.push({ month: `${month} - ${year}`, CntVariable: count })
        //     console.log('Data Display ==>', finalData)
        // }
        return res.json({ data: finalData, status: true, message: "Last 1 Year's Data." })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}