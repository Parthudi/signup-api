const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const Speakeasy = require('speakeasy')
const jwt = require('jsonwebtoken')
const log4js  = require('log4js')


var logger = log4js.getLogger()
logger.level = "debug"

const userSchema = new mongoose.Schema({
            username: {
                type: String,
                unique: true,
                trim: true,
                default : 'Annonymous'
            },
            firstname: {
                type: String,
                validate(value) {
                    if(!validator. isAlpha(value)) {
                        throw new Error('Only Characters')
                    }
                  } 
               
            },
            lastname: {
                type: String,
                validate(value) {
                    if(!validator. isAlpha(value)) {
                        throw new Error('Only Characters')
                    }
                  } 
            },
            email: {
                type: String,
                unique: true,
                required: true,
                trim: true,
                lowercase: true,
                validate(value) {
                    if(!validator.isEmail(value)) {
                        throw new Error('Email incorrect! ')
                    }
                }
            },
            isVerified: { type: Boolean, default: false },
            total_attempts: { type: Number , default : '0'},
            mobile: {
                    type: String,
                    unique: true,
                    minlength: [9, 'numbers less than 9 not allowed '],
                    maxlength: [15 , 'numbers exceeded from 15'],
                    validate(value) {
                        if(!validator.isMobilePhone(value)) {
                            throw new Error('Mobile incorrect! ')
                        } 
                     
                    }} ,        
               password: {
                    type: String,
                    unique: true,
                    required: true,
                    validate(value) {
                    var rex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,32})");
                    
                  if(!rex.test(value)) {
                        throw new Error('password Weak')
                            }
                        }
                     },
               confirmPassword: {
                        type: String,
                        required: true,
                     },  
               location: {
                    Street_Address1: {
                            type: String,
                        },
                    Street_Address2: {
                        type: String
                      },
                    Current_city: {
                       type: String,
                        },
                    Home_Town: {
                       type: String
                      },
                    State: {
                      type: String
                       },
                    Country: {
                       type: String
                       },
                    Pincode: {
                        type: Number,
                        minlength: 6,
                        maxlength: 6
                       }
                     },
           Relevance: {
                    type: String,
                    required: true,
                    enum : [
                        "JOB_PORTAL", "IMS" , "NEWS_PORTAL"
                          ],
                        default : 'NEWS_PORTAL'
                      },
            UTM: {
                UTM_Parameters : [{
                    utm_source : { 
                        type: String,
                        required: true,
                        default : 'facebook'} ,
                    utm_medium: {
                        type: String,
                        required: true,
                        default : 'email'} ,
                    utm_campaign: {
                        type: String,
                        required: true,
                        default : 'book-launch-2014-may-7'},
                    utm_term: {
                        type: String,
                        default : 'non-profit-theme'},
                    utm_content: {
                        type: String,
                        default: 'cta-sidebar'}
                         }],
                    },
               userRole: {
                    type: String,
                    required: true,
                    enum: ['STUDENT', 'INDUSTRY PROFESSIONAL', 'FOUNDER' , 'RECUITER' , 'FRESHER'],
                    default: 'FOUNDER'
                  },
                Gender: {
                    type: String
                  },
                Birthdate: {
                    type: String,
                    validate(value) {
                        if(!validator.isDate(value) ) {
                            throw new Error('Date incorrect! ')
                        } 
                    }
                   },
                Marital_status : {
                    type: String
                },
                otp: [{
                    code: {
                        type: String,
                        required: true
                 }
                }],
                tokense: [{
                    token: {
                        type: String,
                        required: true
                    }
                  }],
                  
                }, {
                        timestamps : true
                    })

 
userSchema.pre('save', async function(next)  {
        const user = this

        if(user.isModified('password')) { 
            user.password = await bcrypt.hash(user.password, 8)
        }
        next()
})

userSchema.methods.toJSON = function() {  
    const user = this

    const userObject = user.toObject()

    delete userObject.username
    delete userObject.password
    delete userObject.otp
    delete userObject.email
    delete userObject.confirmPassword
    
    return userObject
}
userSchema.methods.generatetoken = async function()  {
    const user = this
    const secret = process.env.JWT_SECRET
    const token = jwt.sign({ _id: user._id.toString() } , secret)

    user.tokense = user.tokense.concat({ token })

    await user.save()
    return token
}

userSchema.methods.generateOtp = async function() {
     
     const code= Speakeasy.time({
           secret: process.env.VERIFY_SECRET,
           encoding: "base32",
           step:3000,//10 mins
           window:0
       })
      
    const user = this
    user.otp = user.otp.concat({ code })
    await user.save()
    
    return code
}

 
//while login the user needs to provide email & password of a valid user who had signup.
userSchema.statics.findByCredential = async(email, password) => {
    
    const user = await signup.findOne({ email })

    if(!user) {
        throw new Error('unable to find user')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error('login failed!!!!')
    }
     return user
}

userSchema.statics.finduser = async(email) => {

    const user = await signup.findOne({ email })
    
    if(!user) {
        logger.error('user  not  found')
        myUndefinedFunction()
        throw new Error('unable to find user')
    }
    return user
}


const signup = mongoose.model('signup', userSchema)
module.exports = signup