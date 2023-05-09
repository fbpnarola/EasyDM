const PageView = require('../../model/PageViews')
const Activity = require('../../model/ActivityPageViews')
const paginate = require('../helper/paginate')
const moment = require('moment')

exports.createPageView = async (req, res) => {
    try {
        const pageViewData = { ...req.body }
        const oldData = await PageView.findOne({ $and: [{ webpage: pageViewData.webpage }, { monthYear: pageViewData.monthYear }] })
        if (oldData) {
            return res.json({ data: [], status: false, message: "Page View already created for this webpage with same month-year!!" })
        }
        const pageView = await PageView.create(pageViewData)
        if (!pageView) {
            return res.json({ data: [], status: false, message: "Something went wrong! Not able to create Page view!!" })
        }
        const activityData = {
            pageViewsId: pageView._id,
            addedBy: req.logInid,
            details: 'Page view Created.',
            time: pageView.createdAt,
            monthYear: pageView.monthYear,
            numberOfPageviews: pageView.numberOfPageviews
        }
        await Activity.create(activityData)
        return res.json({ data: [pageView], status: true, message: 'Page view created successfully!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.updatePageView = async (req, res) => {
    try {
        const checkView = await PageView.findById(req.params.id)
        if (!checkView) {
            return res.json({ data: [], status: false, message: "This Page view is not exist!!" })
        }
        const viewData = { ...req.body }
        if (Object.keys(viewData).length === 0) {
            return res.json({ data: [], status: true, message: "Cannot update empty object!!" })
        }
        const updatedFields = [], updatedValues = []
        let fieldList = ['-_id']
        Object.keys(req.body).forEach(function (fields) {
            updatedFields.push(' ' + fields)
        })
        Object.values(req.body).forEach(function (value) {
            updatedValues.push(value)
        })
        const oldViewData = await PageView.findById(req.params.id).select(fieldList)
        const updateView = await PageView.findByIdAndUpdate(req.params.id, viewData)
        if (!updateView) {
            return res.json({ data: [], status: false, message: 'Not able to update page view!!' })
        }

        const activityData = {
            pageViewsId: checkView._id,
            addedBy: req.logInid,
            activityName: 'Updated',
            oldData: oldViewData,
            newData: viewData,
            details: 'Updated ' + updatedFields + ' Fields.',
            time: checkView.updatedAt,
            monthYear: viewData.monthYear,
            numberOfPageviews: viewData.numberOfPageviews
        }
        await Activity.create(activityData)
        return res.json({ data: [updateView], status: true, message: 'Page view updated!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.deletePageView = async (req, res) => {
    try {
        const checkView = await PageView.findById(req.params.id)
        if (!checkView) {
            return res.json({ data: [], status: false, message: "This page view is not exist!!" })
        }
        if (req.type === 2) {
            return res.json({ data: [], status: false, message: 'Only Admin can delete the page view!!' })
        }
        const deleteView = await PageView.findByIdAndRemove(req.params.id)
        if (!deleteView) {
            return res.json({ data: [], status: false, message: 'Not able to update page view!!' })
        }
        return res.json({ data: [], status: true, message: 'Page view deleted!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getPageView = async (req, res) => {
    try {
        const option = { ...req.body };
        if (!option.hasOwnProperty('query')) {
            option['query'] = {};
        }
        option.query['isDeleted'] = false
        const pageView = await paginate(option, PageView);
        return res.json({ data: [pageView], status: false, message: "All the page view" });
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getPageViewById = async (req, res) => {
    try {
        const checkView = await PageView.findById(req.params.id)
            .populate('webpage', 'webpage category')
        if (!checkView) {
            return res.json({ data: [], status: false, message: "This Page view is not exist!!" })
        }
        return res.json({ data: [checkView], status: true, message: "Particular Page View data." })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.viewActivity = async (req, res) => {
    try {
        const checkView = await PageView.findById(req.params.id)
        if (!checkView) {
            return res.json({ data: [], status: false, message: "This Page view is not exist!!" })
        }
        const activityData = await Activity.find({ pageViewsId: req.params.id })
            .populate('addedBy', 'name avatar')
            .sort({ createdAt: -1 })
        if (!activityData) {
            return res.json({ data: [], status: false, message: 'Not able to fetch data for this Page view!!' })
        }
        return res.json({ data: [activityData], status: true, message: "All the activity data." })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

// exports.history = async (req, res) => {
//     try {
//         const date1 = Date.now() + -365 * 24 * 3600000
//         const endDate = new Date(date1).toISOString()
//         const betweenDate = { $lte: new Date, $gte: endDate }
//         const LastYearData = await PageView.find({ $and: [{ isDeleted: false }, { monthYear: betweenDate }] })
//         const data = [], months = []
//         LastYearData.forEach(element => {
//             data.push(element.numberOfPageviews)
//             let month = element.monthYear.toLocaleString('default', { month: 'short' });
//             let year = new Date(element.monthYear).getFullYear();
//             months.push(`${month}-${year}`)
//         });

//         return res.json({ data: { data: data, months: months }, status: true, message: "Last 1 Year's Data." })
//     } catch (error) {
//         return res.json({ data: [], status: false, message: error.message })
//     }
// }

// exports.history = async (req, res) => {
//     try {
//         let monthYear = [], data = []
//         for (let i = 24; i >= 2; i--) {
//             const date = Date.now() + -365 * i * 3600000
//             const nextMonth = Date.now() + -365 * (i - 2) * 3600000
//             const dateFormat = new Date(date).toISOString()
//             const nextDateFormat = new Date(nextMonth).toISOString()
//             const month = new Date(date).toLocaleString('default', { month: 'short' })
//             const year = new Date(date).getFullYear();
//             const betweenDate = { $lte: nextDateFormat, $gte: dateFormat }
//             const monthWise = await PageView.find({ $and: [{ isDeleted: false }, { monthYear: betweenDate }, { webpage: req.params.id }] })
//             let count = 0
//             monthWise.forEach(element => {
//                 count = count + element.numberOfPageviews
//             });
//             monthYear.push(`${month} - ${year}`)
//             data.push(count)
//             i--
//         }
//         return res.json({ data: { data: data, months: monthYear }, status: true, message: "Last 1 Year's Data." })

//     } catch (error) {
//         return res.json({ data: [], status: false, message: error.message })
//     }
// }

exports.history = async (req, res) => {
    try {
        let monthYear = [], data = []
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        var dateFrom = moment(firstDay).subtract(1, 'years')
        let lastMOnth
        for (let i = 1; i <= 12; i++) {
            let nextMonth = moment(dateFrom).add(i, 'months')
            lastMOnth = moment(nextMonth).subtract(1, 'months')
            const month = moment(lastMOnth).format('MMM')
            const year = moment(lastMOnth).format('YYYY');
            const betweenDate = { $lte: nextMonth, $gt: lastMOnth }
            const monthWise = await PageView.find({ $and: [{ isDeleted: false }, { monthYear: betweenDate }, { webpage: req.params.id }] })
            let count = 0
            monthWise.forEach(element => {
                count = count + element.numberOfPageviews
            });
            monthYear.push(`${month} - ${year}`)
            data.push(count)
        }
        return res.json({ data: { data: data, months: monthYear }, status: true, message: "Last 1 Year's Data." })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}