const mongoose = require('mongoose');
const { PAGINATE_OPTIONS } = require('../util/pagination.constant');
const mongoosePaginate = require('mongoose-paginate-v2');

const BackLinksSchema = new mongoose.Schema({
    webpage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Website',
        require: true
    },
    publishedOn: {
        type: Date,
        require: true
    },
    monthYear: {
        type: Date,
        require: true
    },
    numberOfBacklinks: {
        type: Number,
        require: true
    }
}, {
    timestamps: true
})

mongoosePaginate.paginate.options = PAGINATE_OPTIONS;
BackLinksSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('BackLinks', BackLinksSchema, 'BackLinks')