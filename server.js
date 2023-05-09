const express = require('express')
const app = express()
const morgan = require('morgan')
const path = require('path')
const cors = require('cors')
require('dotenv').config()
require('./util/connection')
// require('./seed').userSeed()

const route = require('./route/index')
app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, '/views'));

app.use("/avatar", express.static(path.join(__dirname, '/public/avatar')));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
})
app.use(route)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Server runs on port ${PORT}!!!`);
})