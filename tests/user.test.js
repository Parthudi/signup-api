const request = require('supertest')
const app = require('../src/app')
const signup = require('../src/models/user')

const userOne = {
   email: "parth.170410116046@gmail.com",
   password: "PaassPAA1234",
   confirmPassword: "PaassPAA1234",
   userRole: "FOUNDER"
}

beforeEach( async() => {
   await signup.deleteMany()
   await new signup(userOne).save()
})

test('Email should be unique' , async() => {
   await request(app).post('/user/signup').send({
    email: "parth.170410116046@gmail.com",
    password: "PaassPAA1234",
    confirmPassword: "PaassPAA1234",
    userRole: "FOUNDER"
      }).expect(201)     
})


test('Email should be of proper formate' , async() => {
   await request(app).post('/user/signup').send({
    email: "parthudiii",
    password: "PaassPAA1234",
    confirmPassword: "PaassPAA1234",
    userRole: "FOUNDER"
      }).expect(201)     
})


test('Password should be with specific characters' , async() => {
   await request(app).post('/user/signup').send({
    email: "parth.170410116046@gmail.com",
    password: "Paas",
    confirmPassword: "Paas",
    userRole: "FOUNDER"
      }).expect(201)     
})