const express = require('express')
require('./db/mongoose')
const useRouter = require('./routers/users')
const { application } = require('express')
const helmet = require("helmet")
var cors = require('cors')
const Sentry = require('@sentry/node')

const app = express()

app.use(express.json())
app.use(useRouter)
app.use(helmet())

//setting up the cors
app.use(cors())
Sentry.init({ dsn: process.env.SENTRY })
app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.errorHandler())

module.exports = app

 