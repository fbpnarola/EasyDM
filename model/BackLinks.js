const mongoose = require('mongoose');
const { PAGINATE_OPTIONS } = require('../util/pagination.constant');
const mongoosePaginate = require('mongoose-paginate-v2');

const BackLinksSchema = new mongoose.Schema({
    date: {
        type: Date,
        require: true
    },
    offPageActivity: {
        type: String,
        require: true,
        enum: ["Social Bookmarking", "Classified", "Directory", "Blog Submission", "Guest Posting", "Profile Creation", "Business Listing", "Visual Submisstion", "Q&A"]
    },
    category: {
        type: String,
        enum: ["Services", "Blogs", "Industry", "Career", "Technologies"],
        require: true
    },
    webpage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Website',
        default: null
    },
    contentScheduler: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContentScheduler',
        default: null
    },
    domain: {
        type: String,
        require: true
    },
    directUrl: {
        type: String,
        require: true
    },
    id: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    notes: String,
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ["In Review", "Done", "Rejected"]
    }
}, {
    timestamps: true
})

mongoosePaginate.paginate.options = PAGINATE_OPTIONS;
BackLinksSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('BackLinks1', BackLinksSchema, 'BackLinks1')