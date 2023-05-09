const mongoose = require('mongoose');
const { PAGINATE_OPTIONS } = require('../util/pagination.constant');
const mongoosePaginate = require('mongoose-paginate-v2');

const WebsiteSchema = new mongoose.Schema({
    category: {
        type: String,
        require: true,
        enum: ["Services", "Blogs", "Industry", "Career", "Technologies"]
    },
    webpage: {
        type: String,
        require: true
    },
    webpageUrl: {
        type: String,
        require: true
    },
    publishedOn: {
        type: Date,
        require: true
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    effectiveFrom: {
        type: Date,
        require: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
})

mongoosePaginate.paginate.options = PAGINATE_OPTIONS;
WebsiteSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Website', WebsiteSchema, 'Website')