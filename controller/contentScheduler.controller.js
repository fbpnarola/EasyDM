const ContentScheduler = require('../model/ContentScheduler')
const Activity = require('../model/ActivityContentScheduler')
const paginate = require('../helper/paginate')

exports.createContentScheduler = async (req, res) => {
    try {
        const data = { ...req.body }
        const scheduler = await ContentScheduler.create(data)
        if (!scheduler) {
            return res.json({ data: [], status: false, message: 'Something went wrong! Not able to create Content Scheduler!!' })
        }
        const activityData = {
            contentSchedulerId: scheduler._id,
            addedBy: req.logInid,
            details: 'Content Scheduler Created.',
            time: scheduler.createdAt
        }
        await Activity.create(activityData)
        return res.json({ data: [scheduler], status: true, message: 'Content Scheduler created successfully!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getContentSchedulersById = async (req, res) => {
    try {
        const checkScheduler = await ContentScheduler.findById(req.params.id)
            .populate('webpage', 'webpage category')
        if (!checkScheduler) {
            return res.json({ data: [], status: false, message: "This Content Scheduler is not exist!!" })
        }
        return res.json({ data: [checkScheduler], status: true, message: "Selected content scheduler's data." })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.viewActivity = async (req, res) => {
    try {
        const checkScheduler = await ContentScheduler.findById(req.params.id)
        if (!checkScheduler) {
            return res.json({ data: [], status: false, message: 'This Content Scheduler is not exist!!' })
        }
        const activityData = await Activity.find({ contentSchedulerId: req.params.id })
            .populate('addedBy', 'name avatar')
            .sort({ createdAt: -1 })
        if (!activityData) {
            return res.json({ data: [], status: false, message: 'Something went wrong! Not able fetch data for website!!' })
        }
        return res.json({ data: [activityData], status: true, message: "All the activity data." })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.updateContentScheduler = async (req, res) => {
    try {
        const checkScheduler = await ContentScheduler.findById(req.params.id)
        if (!checkScheduler) {
            return res.json({ data: [], status: false, message: 'This Content Scheduler is not exist!!' })
        }
        const schedulerData = { ...req.body }
        if (Object.keys(schedulerData).length === 0) {
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
        const oldSchedulerData = await ContentScheduler.findById(req.params.id).select(fieldList)

        const updateScheduler = await ContentScheduler.findByIdAndUpdate(req.params.id, schedulerData)
        if (!updateScheduler) {
            return res.json({ data: [], status: false, message: 'Not able to update Content Scheduler!!' })
        }
        const activityData = {
            contentSchedulerId: checkScheduler._id,
            addedBy: req.logInid,
            activityName: 'Updated',
            oldData: oldSchedulerData,
            newData: schedulerData,
            details: 'Updated ' + updatedFields + ' Fields.',
            time: checkScheduler.updatedAt
        }
        await Activity.create(activityData)
        return res.json({ data: [], status: true, message: 'Content Scheduler updated!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.deleteContentScheduler = async (req, res) => {
    try {
        const checkScheduler = await ContentScheduler.findById(req.params.id)
        if (!checkScheduler) {
            return res.json({ data: [], status: false, message: 'This content scheduler is not available!!' })
        }
        if (req.type === 2) {
            return res.json({ data: [], status: false, message: 'Only Admin can delete the content scheduler!!' })
        }
        const deleteScheduler = await ContentScheduler.findByIdAndRemove(req.params.id)
        if (!deleteScheduler) {
            return res.json({ data: [], status: false, message: 'Not able to update content scheduler!!' })
        }
        return res.json({ data: [], status: true, message: 'Content scheduler deleted!!' })
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}

exports.getContentScheduler = async (req, res, next) => {
    try {
        const option = { ...req.body };
        if (!option.hasOwnProperty('query')) {
            option['query'] = {};
        }
        option.query['isDeleted'] = false

        const scheduler = await paginate(option, ContentScheduler);
        return res.json({ data: [scheduler], status: true, message: "Data Listed Successfully" });
    } catch (error) {
        return res.json({ data: [], status: false, message: error.message })
    }
}