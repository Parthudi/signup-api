const express = require('express')
const router = new express.Router()
const log4js = require("log4js")
const signup = require('../models/user')
const nodemailer = require('nodemailer')
const {auth} = require('../middleware/auth')
const Speakeasy = require('speakeasy')

const logger = log4js.getLogger()
logger.level = "debug"

//signup route 
router.post('/user/signup',  async(req, res) => {
      try {
        logger.debug('Entered signup')
        const me = new signup(req.body) 
        
        await me.save()
        logger.debug(' saved to database')

        if(req.body.password === req.body.confirmPassword) {
          logger.debug(' Password and confirmpassword matched')
          const token = await me.generatetoken()
          logger.debug(' token generated')
  
          const generatestr = await me.generateOtp()
  
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
                         '<a href=' +url+ '>' +url+'</a>' + '<h2> OTP: ' +generatestr+ ' ,this otp you need to provide by clicking on the above link, Remember otp is only valid for 10 minutes</h2> ' 
                }
           await transport.sendMail(mailOptions)           
           logger.debug('mail sent to your email')    
                                                                      
           logger.debug('user sucessfully signedin! ')
           res.status(201).send({me , token });
        }
      else {
          logger.error('Password didnt matched')
          throw new Error('password didnt match')
        }
       
    } catch(error) {
        logger.error('user enable to signup')
        res.status(400).send('Unable to signup');
      }
               
})

//confirmation route
router.post('/confirmation' , async(req, res) => {
  
    try {
      
             const code = req.body.token
             console.log(code)
                const vefy = Speakeasy.time.verify({
                        secret: process.env.VERIFY_SECRET,
                        encoding: 'base32',
                        token: code,
                        step:3000,//10 mins
                        window:0
                    })
                logger.debug('You have entered ' +vefy+ ' OTP')
                
          if(!vefy) {
             logger.error('Wrong OTP')
             throw new Error('invalid OTP')
          } 

          if(vefy) {
              logger.debug('Email Verified !!! ')
               logger.debug('email entered by user : ' +req.body.email)

               const user = await signup.finduser(req.body.email)
               if(user) {
                 logger.debug('user found')
                 user.isVerified = true   
                }   
          
              
           user.total_attempts +=1
           
           user.timestamps = true
           
            await user.save()
            logger.debug(' Congraluations you are verified!! ')
            res.status(200).send({user})
      }
  }
     catch(e) {
       logger.error('User confirmation failed')
      res.status(400).send('User not verified')
    }
         
})
        
//login route
router.post('/user/login', auth , async(req, res) => {
    try {
      const user = await signup.findByCredential( req.body.email , req.body.password )
     
      logger.debug("New User logged-in")
       res.status(200).send({user})
  
    } catch(error) {
        logger.error('Login failed')
        res.status(400).send('login not verified')
    }
})

module.exports = router 

