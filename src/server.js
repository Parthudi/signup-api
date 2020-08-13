const app = require('./app')
var log4js = require('log4js')

const logger = log4js.getLogger();
logger.level = "debug";

//setting up environmental port
const port = process.env.PORT

//starting up the server
app.listen(port , () => {
    logger.debug("Server is running on port :" +port)
})