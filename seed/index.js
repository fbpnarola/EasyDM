async function userSeed() {
    const User = require('../model/User')
    const users = require('./user.json')
    for (let userIndex = 0; userIndex < users.length; userIndex++) {
        const user = users[userIndex];
        await User.findByIdAndUpdate(user._id, user, { upsert: true })
    }
}

module.exports = { userSeed }