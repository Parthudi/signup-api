const express = require('express')
const router = new express.Router()
const log4js = require("log4js")
const signup = require('../models/user')
const nodemailer = require('nodemailer')
const auth = require('../middleware/auth')
const Speakeasy = require('speakeasy')

const logger = log4js.getLogger()
logger.level = "debug"

//signup route 
router.post('/user/signup',  async(req, res) => {
      try {
        const me = new signup(req.body) 

        await me.save()
        logger.debug(' saved to database')

        const token = await me.generatetoken()
        logger.debug(' token generated')

        const generatestr = await me.generateOtp()
        logger.debug(' string generated : ' +generatestr)

      var transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
          auth: {
            user: "b9d74b649d02df",
            pass: process.env.NODEMAILER_PASS
          }
        })

        const url = `http://localhost:3000/confirmation`
        const mailOptions = {
                from: 'parmarparth597@gmail.com',
                to: me.email,
                subject: 'Account Verification Token',
                html: '<h2> welcome mr/mrs ' +me.username+ ' to our app let us know if u have any query regarding our application  </h2><br>' + 
                       '<a href=' +url+ '>' +url+'</a>' + '<h2> OTP: ' +generatestr+ ' otp only valid for 10 minutes</h2> ' 
              }
        await transport.sendMail(mailOptions)
          
         res.status(200).send({me , token });
       logger.debug('user sucessfully signedin! ')
     
      } catch(error) {
        logger.error('user enable to signup')
        res.status(400).send('Unable to signup');
      }
               
})
router.post('/confirmation' , async(req, res) => {
  
    try {
            const code = req.body.token
             
                const vefy = Speakeasy.time.verify({
                        secret: process.env.VERIFY_SECRET,
                        encoding: 'base32',
                        token: code,
                        step:600,//10 mins
                        window:0
                    })
                logger.debug('You have entered ' +vefy+ ' OTP')
                
          if(!vefy) {
            logger.error('Wrong OTP')
                }
          
          if(vefy) {
              logger.debug('Email Verified !!! ')
                }
            
        res.status(200).send('verification' +vefy)
    
  }
     catch(e) {
       logger.error('User confirmation failed')
      res.status(400).send('User not verified')
    }
         
})
        

module.exports = router 

