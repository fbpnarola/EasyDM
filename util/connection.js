const mongoose = require('mongoose')

mongoose.set('strictQuery', true);
mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => { console.log("Connected to MongoDB!!") })
    .catch((error) => { console.log(error.message); })

module.exports = mongoose