const express = require('express')
require('./db/mongoose')
const useRouter = require('./routers/users')
const { application } = require('express')
const helmet = require("helmet")
var cors = require('cors')

const app = express()

app.use(express.json())
app.use(useRouter)
app.use(helmet())
app.use(cors())

module.exports = app