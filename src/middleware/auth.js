const jwt = require('jsonwebtoken')
const signup = require('../models/user')
const log4js = require("log4js")

var logger = log4js.getLogger()
logger.level = "debug"

//checking the user is valid user or not by matching the token & giving permission to perform task on if the user is authenticated.
const auth = async(req, res, next) => {
    try{
        const token  = req.header('Authorization').replace('Bearer ', '')
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const user   = await signup.findOne({_id: decode._id, 'tokense.token': token })
        
        if(!user) {
            throw new Error()
          }

        req.token = token    
        req.user  = user
        next()
    } catch(error) {
        logger.error("Authentication failed")
      
        res.status(401).send('error : please authenticate. ')
    }
   
}


module.exports = {
    auth
} 