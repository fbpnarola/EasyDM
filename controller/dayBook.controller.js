const DayBook = require('../model/DayBook')
const Activity = require('../model/ActivityDayBook')
const paginate = require('../helper/paginate')
const mongoose = require('mongoose')
const monthYearWiseData = require('../helper/monthYearWiseData')
const ContentScheduler = require('../model/ContentScheduler')

exports.createDayBook = async (req, res) => {
    try {
        if (req.body && req.body.hasOwnProperty('data')) {
            let dayBookData = req.body.data
            dayBookData.forEach(async (element) => {
                if (element.contentScheduler) {
                    const getCS = await ContentScheduler.findById(element.contentScheduler)
                    element.webpage = getCS.webpage
                }
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
        }
        return res.json({ data: [], status: false, message: 'Kindly enter data!!' })

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
        const updatedData = await DayBook.findById(req.params.id)
        return res.json({ data: [updatedData], status: true, message: 'Day Book updated!!' })
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
                $match: {
                    $and: filter
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'addedBy',
                    foreignField: '_id',
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
                    var dateTo = new Date(req.body.search.dateTo)
                    dateTo.setDate(dateTo.getDate() + 1);
                    query.push(
                        {
                            $match: {
                                $and: [
                                    { 'creationDate': { $gte: new Date(req.body.search.dateFrom) } },
                                    { 'creationDate': { $lte: new Date(dateTo) } }
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
                            "contentScheduler": "$contentScheduler",
                            "createdAt": "$createdAt"
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
        for (const element of DayBookData) {
            for (let element1 of element.info) {
                let conSchedulerTitle = null
                if (element1.contentScheduler !== null) {
                    const data = await ContentScheduler.findById(element1.contentScheduler)
                    conSchedulerTitle = data.topicTitle
                }
                element1.contentSchedulerTitle = conSchedulerTitle
            }
        }
        return res.status(200).json({ data: [DayBookData, Pagination], status: true, message: "Data Listed Successfully" })

    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getDayBookOfUser = async (req, res) => {
    try {
        const option = { ...req.body };
        if (!option.hasOwnProperty('query')) {
            option['query'] = {};
        }
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

exports.userDateWiseDayBook = async (req, res) => {
    try {
        let query = [
            {
                $lookup: {
                    from: 'User',
                    localField: 'addedBy',
                    foreignField: '_id',
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
                    var dateTo = new Date(req.body.search.dateTo)
                    dateTo.setDate(dateTo.getDate() + 1);
                    query.push(
                        {
                            $match: {
                                $and: [
                                    { 'creationDate': { $gte: new Date(req.body.search.dateFrom) } },
                                    { 'creationDate': { $lte: new Date(dateTo) } }
                                ]
                            }
                        }
                    )
                }
            }
        }
        query.push({
            $group:
            {
                _id: ['$userData._id', '$creationDate'],
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
                        "contentScheduler": "$contentScheduler",
                        "createdAt": "$createdAt"
                    }
                }
            }
        })
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
        for (const element of DayBookData) {
            for (let element1 of element.info) {
                let conSchedulerTitle = null
                if (element1.contentScheduler !== null) {
                    const data = await ContentScheduler.findById(element1.contentScheduler)
                    conSchedulerTitle = data.topicTitle
                }
                element1.contentSchedulerTitle = conSchedulerTitle
            }
        }
        return res.status(200).json({ data: [DayBookData, Pagination], status: true, message: "Data Listed Successfully" })

    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

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
                $match: {
                    $and: filter
                }
            },
            {
                $lookup: {
                    from: 'User',
                    localField: 'addedBy',
                    foreignField: '_id',
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
                    var dateTo = new Date(req.body.search.dateTo)
                    dateTo.setDate(dateTo.getDate() + 1);
                    query.push(
                        {
                            $match: {
                                $and: [
                                    { 'creationDate': { $gte: new Date(req.body.search.dateFrom) } },
                                    { 'creationDate': { $lte: new Date(dateTo) } }
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
                            "contentScheduler": "$contentScheduler",
                            "createdAt": "$createdAt"
                        }
                    }
                }
            }
        )
        const DayBookData = await DayBook.aggregate(query)
        const finalData = await monthYearWiseData.month_year_wise_data(DayBookData, "creationDate", "hours")
        return res.status(200).json({ data: finalData, status: true, message: "All user's the day book data" })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}