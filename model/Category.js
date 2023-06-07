const mongoose = require('mongoose');
const { PAGINATE_OPTIONS } = require('../util/pagination.constant');
const mongoosePaginate = require('mongoose-paginate-v2');

const CategorySchema = new mongoose.Schema({
    name: String,
    details: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

mongoosePaginate.paginate.options = PAGINATE_OPTIONS;
CategorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Category', CategorySchema, 'Category')