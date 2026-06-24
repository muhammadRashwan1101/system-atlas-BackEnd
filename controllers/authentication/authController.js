const mongoose = require("mongoose");
const User = require("../../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { loginValidation, signUpValidation } = require("../validation/authValidation")


 const register = async (req,res) => {

    const {error, value } = signUpValidation.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    }) 

    if(error) {
        console.log(error.details.map(err => err.message))
        return res.status(400).json({ msg: error.details.map(err => err.message) })
    }

    try {
        const existingUser = await User.findOne({email: value.email})
        
        if(existingUser) {
            return res.status(400).json({ msg: "User Already Exists" })
        }

        const hashedPass = await bcrypt.hash(value.password, 12)
        value.password = hashedPass

        const newUser = await User.create(value)            
        res.status(201).json({ msg: "User Created Successfully" , user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email
    }})
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
 }

 const login = async (req, res) => {
    const {error, value } = loginValidation.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    })

    if(error) {
        return res.status(400).json({ msg: error.details.map(err => err.message) })
    }

    try {
        const { email, password } =  value
        value.email = email.toLowerCase()
        
        const user = await User.findOne({email}).select("+password")
        if(!user) {
            return res.status(401).json({ msg: "Wrong Email or Password" })
        }

        const passwordMatch = await bcrypt.compare(password, user.password)
        delete value.confrimPassword

        if(!passwordMatch) {
            return res.status(400).json({ msg: "Wrong Email or Password" })
        }
        const token = jwt.sign({ id: user._id, role: user.role}, process.env.JWT_SECRET, { expiresIn: "1d" })
        res.status(200).json({ msg: `Logged In Successfully. Welcome ${user.fullName}!`, token })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
 }

 module.exports = {
    register,
    login
 }