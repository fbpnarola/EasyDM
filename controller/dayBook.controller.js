const DayBook = require('../model/DayBook')
const Activity = require('../model/ActivityDayBook')
const paginate = require('../helper/paginate')
const User = require('../model/User')
const mongoose = require('mongoose')
const moment = require('moment')

exports.createDayBook = async (req, res) => {
    try {
        let dayBookData = req.body.data
        dayBookData.forEach(async (element) => {
            element.addedBy = req.logInid
            const dayBook = await DayBook.create(element)
            const activityData = {
                dayBookId: dayBook._id,
                addedBy: req.logInid,
                details: 'Day Book Created.',
                time: dayBook.createdAt
            }
            await Activity.create(activityData)
        });
        return res.json({ data: [], status: true, message: 'Day book created successfully!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.updateDayBook = async (req, res) => {
    try {
        const checkBook = await DayBook.findById(req.params.id)
        if (!checkBook) {
            return res.json({ data: [], status: false, message: "This Day Book is not exist!!" })
        }
        const dayBookData = { ...req.body }
        if (Object.keys(dayBookData).length === 0) {
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
        const oldBookData = await DayBook.findById(req.params.id).select(fieldList)
        const updateBook = await DayBook.findByIdAndUpdate(req.params.id, dayBookData)
        if (!updateBook) {
            return res.json({ data: [], status: false, message: 'Not able to update Day Book!!' })
        }
        const activityData = {
            dayBookId: checkBook._id,
            addedBy: req.logInid,
            activityName: 'Updated',
            oldData: oldBookData,
            newData: dayBookData,
            details: 'Updated ' + updatedFields + ' Fields.',
            time: checkBook.updatedAt
        }
        await Activity.create(activityData)
        const n = await DayBook.findById(req.params.id)
        return res.json({ data: [n], status: true, message: 'Day Book updated!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.deleteDayBook = async (req, res) => {
    try {
        const checkBook = await DayBook.findById(req.params.id)
        if (!checkBook) {
            return res.json({ data: [], status: false, message: "This Day Book is not exist!!" })
        }
        if (req.type !== 1 && !(checkBook.addedBy.equals(req.logInid._id))) {
            return res.json({ data: [], status: false, message: 'Only the Admin and the User by themselves can delete the Day Book!!' })
        }
        const deleteDayBook = await DayBook.findByIdAndRemove(req.params.id)
        if (!deleteDayBook) {
            return res.json({ data: [], status: false, message: 'Not able to update Day Book!!' })
        }
        return res.json({ data: [], status: true, message: 'Day Book deleted!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getDayBook = async (req, res) => {
    try {
        const filter = [{}]
        if (req.body && req.body.hasOwnProperty('search')) {
            if (req.body.search.category) {
                filter.push({ 'category': { $eq: req.body.search.category } })
            }
            if (req.body.search.webpage) {
                filter.push({ 'webpage': new mongoose.Types.ObjectId(req.body.search.webpage) })
            }
            if (req.body.search.member) {
                let members = []
                req.body.search.member.forEach(element => {
                    members.push(new mongoose.Types.ObjectId(element))
                });
                filter.push({ 'addedBy': { $in: members } })
            }
        }
        let query = [
            {
                $sort: { 'createdAt': -1 }
            },
            {
                $match: {
                    $and: filter
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'addedBy',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$isDeleted", false] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'userData',
                }
            },
            {
                $unwind: '$userData'
            },
            {
                $lookup: {
                    from: 'Website',
                    localField: 'webpage',
                    foreignField: '_id',
                    as: 'webPageData',
                }
            },
            {
                $unwind: '$webPageData'
            }
        ]
        if (req.body && req.body.hasOwnProperty('search')) {
            if (req.body.search.dateFrom) {
                if (!req.body.search.dateTo) {
                    query.push(
                        {
                            $match: { 'creationDate': { $gte: new Date(req.body.search.dateFrom) } }
                        }
                    )
                }
                else {
                    query.push(
                        {
                            $match: {
                                $and: [
                                    { 'creationDate': { $gte: new Date(req.body.search.dateFrom) } },
                                    { 'creationDate': { $lte: new Date(req.body.search.dateTo) } }
                                ]
                            }
                        }
                    )
                }
            }
        }
        query.push(
            {
                $group:
                {
                    _id: '$userData._id',
                    totalHours: { $sum: '$hours' },
                    info: {
                        $push: {
                            "userName": "$userData.name",
                            "avatar": "$userData.avatar",
                            "addedBy": "$userData._id",
                            "dayBookId": "$_id",
                            "hours": "$hours",
                            "creationDate": "$creationDate",
                            "details": "$details",
                            "category": "$category",
                            "member": "$addedBy",
                            "webpageName": "$webPageData.webpage",
                            "webpageURL": "$webPageData.webpageUrl",
                            "webpage": "$webpage",
                        }
                    }
                }
            }
        )

        const addPagination = await DayBook.aggregate(query)
        let totalData = addPagination.length
        let pageNo = 1, perPage = 10
        if (req.body && req.body.hasOwnProperty('pageNo') && req.body.hasOwnProperty('perPage')) {
            pageNo = req.body.pageNo
            perPage = req.body.perPage
        }
        let page = (pageNo) ? parseInt(pageNo) : 1
        let limit = (perPage) ? parseInt(perPage) : 50
        let skip = (page - 1) * limit

        let endIndex = page * limit
        if (endIndex < totalData) {
            endIndex = page * limit
        }
        else {
            endIndex = totalData
        }

        const Pagination = {
            TotalPageData: endIndex,
            PageNo: pageNo
        }
        const DayBookData = await DayBook.aggregate(query).skip(skip).limit(limit)
        return res.status(200).json({ data: [DayBookData, Pagination], status: true, message: "Data Listed Successfully" })

    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getDayBookOfUser = async (req, res) => {
    try {
        const checkUser = await User.findById(req.params.id)
        if (!checkUser) {
            return res.json({ data: [], status: false, message: 'This user is not exist!!' })
        }
        const option = { ...req.body };
        if (!option.hasOwnProperty('query')) {
            option['query'] = {};
        }
        option.query['addedBy'] = checkUser._id

        const dayBookOfUser = await paginate(option, DayBook);
        return res.json({ data: [dayBookOfUser], status: true, message: "Data Listed Successfully" })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getDayBookById = async (req, res) => {
    try {
        const checkBook = await DayBook.findById(req.params.id)
            .populate('webpage', 'webpage category')
            .populate('addedBy', 'name category')
        if (!checkBook) {
            return res.json({ data: [], status: false, message: "This Day Book is not exist!!" })
        }
        return res.json({ data: [checkBook], status: true, message: "Particular Day book data." })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.viewActivity = async (req, res) => {
    try {
        const checkBook = await DayBook.findById(req.params.id)
        if (!checkBook) {
            return res.json({ data: [], status: false, message: "This Day Book is not exist!!" })
        }
        const activityData = await Activity.find({ dayBookId: req.params.id })
            .populate('addedBy', 'name avatar')
            .sort({ createdAt: -1 })
        if (!activityData) {
            return res.json({ data: [], status: false, message: 'Not able to fetch data for this Day Book!!' })
        }
        return res.json({ data: [activityData], status: true, message: "All the acticity data." })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

// exports.userDayBookActivity = async (req, res) => {
//     try {
//         // const checkUser = await User.findById(req.params.id)
//         // if (!checkUser) {
//         //     return res.json({ data: [], status: false, message: "This User is not exist!!" })
//         // }

//         let monthYear = [], hours = [], members = [], filters = [{}]
//         const date = new Date();
//         const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
//         var dateFrom = moment(firstDay).subtract(1, 'years')
//         let lastMOnth, users = {}, category = {}, webpage = {}
//         for (let i = 1; i <= 12; i++) {
//             let nextMonth = moment(dateFrom).add(i, 'months')
//             lastMOnth = moment(nextMonth).subtract(1, 'months')
//             if (req.body && req.body.hasOwnProperty('filter')) {
//                 if (req.body.filter.dateFrom) {
//                     nextMonth = moment(req.body.filter.dateFrom).add(i, 'months')
//                     lastMOnth = moment(nextMonth).subtract(1, 'months')
//                 }
//                 if (req.body.filter.member) {
//                     filters.push({ addedBy: req.body.filter.member })
//                 }
//                 if (req.body.filter.category) {
//                     category = req.body.filter.category
//                     // filters.push({ category: req.body.filter.category })
//                     console.log('category data ==>', Object.keys(category).length)
//                     // if (Object.keys(category).length > 0) {
//                     filters.push({ 'category': category })
//                     // }
//                 }
//                 if (req.body.filter.webpage) {
//                     filters.push({ webpage: req.body.filter.webpage })

//                 }
//             }
//             const month = moment(lastMOnth).format('MMM').toString();
//             const year = moment(lastMOnth).format('YYYY').toString();
//             const betweenDate = { $gte: new Date(lastMOnth), $lte: new Date(nextMonth) }
//             filters.push({ creationDate: betweenDate })

//             console.log('Filters data ==>', filters)
//             const monthWise = await DayBook.find({ $and: [{ creationDate: betweenDate }, { member: { $in: req.body.filter.members } }] })
//                 .populate('addedBy', 'name')
//             let count = 0, member = []
//             monthWise.forEach(element => {
//                 count = count + element.hours
//                 member.push(element.addedBy.name)
//             });
//             monthYear.push(`${month} - ${year}`)
//             hours.push(count)
//             members.push(member)
//         }
//         return res.json({ data: { hours: hours, months: monthYear, membersList: members }, status: true, message: "Last 1 Year's Data." })
//     } catch (error) {
//         console.log('Error ==>', error)
//         return res.json({ data: [], status: false, message: error.message })
//     }
// }

exports.userDayBookActivity = async (req, res) => {
    try {
        const filter = [{}]
        if (req.body && req.body.hasOwnProperty('search')) {
            if (req.body.search.category) {
                filter.push({ 'category': { $eq: req.body.search.category } })
            }
            if (req.body.search.webpage) {
                filter.push({ 'webpage': new mongoose.Types.ObjectId(req.body.search.webpage) })
            }
            if (req.body.search.member) {
                let members = []
                req.body.search.member.forEach(element => {
                    members.push(new mongoose.Types.ObjectId(element))
                });
                filter.push({ 'addedBy': { $in: members } })
            }
        }
        let query = [
            {
                $sort: { 'createdAt': -1 }
            },
            {
                $match: {
                    $and: filter
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'addedBy',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$isDeleted", false] },
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'userData',
                }
            },
            {
                $unwind: '$userData'
            }
        ]
        if (req.body && req.body.hasOwnProperty('search')) {
            if (req.body.search.dateFrom) {
                if (!req.body.search.dateTo) {
                    query.push(
                        {
                            $match: { 'creationDate': { $gte: new Date(req.body.search.dateFrom) } }
                        }
                    )
                }
                else {
                    query.push(
                        {
                            $match: {
                                $and: [
                                    { 'creationDate': { $gte: new Date(req.body.search.dateFrom) } },
                                    { 'creationDate': { $lte: new Date(req.body.search.dateTo) } }
                                ]
                            }
                        }
                    )
                }
            }
        }
        query.push(
            {
                $group:
                {
                    _id: '$userData._id',
                    totalHours: { $sum: '$hours' },
                    info: {
                        $push: {
                            "userName": "$userData.name",
                            "avatar": "$userData.avatar",
                            "addedBy": "$userData._id",
                            "dayBookId": "$_id",
                            "hours": "$hours",
                            "creationDate": "$creationDate",
                            "details": "$details",
                            "category": "$category",
                            "member": "$addedBy",
                            "webpage": "$webpage",
                        }
                    }
                }
            }
        )
        const DayBookData = await DayBook.aggregate(query)
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        var dateFrom = moment(firstDay).subtract(1, 'years')
        let lastMOnth, historyData = []
        for (let i = 1; i <= 12; i++) {
            let nextMonth = moment(dateFrom).add(i, 'months')
            lastMOnth = moment(nextMonth).subtract(1, 'months')
            const month = moment(lastMOnth).format('MMM').toString();
            const year = moment(lastMOnth).format('YYYY').toString();
            let hoursCnt = 0
            DayBookData.forEach(element => {
                element.info.forEach(element1 => {
                    if (element1.creationDate >= lastMOnth && element1.creationDate <= nextMonth) {
                        hoursCnt = hoursCnt + element1.hours
                    }
                });
            });
            historyData.push({ month: `${month}-${year}`, totalHours: hoursCnt })
        }
        return res.status(200).json({ data: [historyData], status: true, message: "All user's the day book data" })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}
