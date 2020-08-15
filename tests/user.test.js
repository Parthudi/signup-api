const request = require('supertest')
const app = require('../src/app')
const signup = require('../src/models/user')

beforeEach( async() => {
   await signup.deleteMany()
})

test('Should signin a new user' , async() => {
     await request(app).post('/user/signup').send({
      email: "parth.170410116046@gmail.com",
      password: "PaassPAA1234",
      UserRole: " Founder "
        }).expect(201)     
})
