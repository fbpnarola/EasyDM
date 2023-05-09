const mongoose = require('mongoose');
const { PAGINATE_OPTIONS } = require('../util/pagination.constant');
const mongoosePaginate = require('mongoose-paginate-v2');

const ActivityWebsiteSchema = new mongoose.Schema({
    webpageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Website',
        require: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    newData: Object,
    oldData: Object,
    activityName: {
        type: String,
        enum: ['Created', 'Updated'],
        default: 'Created'
    },
    details: String,
    time: Date,
}, {
    timestamps: true
})

mongoosePaginate.paginate.options = PAGINATE_OPTIONS;
ActivityWebsiteSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('ActivityWebsite', ActivityWebsiteSchema, 'ActivityWebsite')