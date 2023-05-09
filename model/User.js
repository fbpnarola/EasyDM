const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { PAGINATE_OPTIONS } = require('../util/pagination.constant');
const mongoosePaginate = require('mongoose-paginate-v2');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique: true
    },
    mobileNo: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    },
    password: String,
    avatar: String,
    resetPasswordToken: String,
    wrongAttempt: {
        type: Number,
        default: 0
    },
    expireToken: Date,
    userRole: Number,
    userType: {
        type: String,
        enum: ["DM Executive", "Content Writer", "Graphic Designer"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next();
})

mongoosePaginate.paginate.options = PAGINATE_OPTIONS;
UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', UserSchema, 'User')