const mongoose = require("mongoose");
const User = require("../../models/user.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")

dotenv.config()

 const register = async (req,res) => {
    try {
        const newUser = req.body
        if(!newUser) {
            res.status(400).json({ msg: "Invalid Request" })
        }

        const hashedPass = await bcrypt.hash(newUser.password, 12)
        newUser.password = hashedPass

        await User.create(newUser)
            .then((user) => {
                res.status(201).json({ msg: "User Created Successfully" , user})
            })
            .catch((err) => {
                res.status(400).json({ msg: err.message })
            })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
 }

 const login = async (req, res) => {
    try {
        const { email, password } =  req.body
        
        if(!email || !password) {
            return res.status(400).json({ msg: "Wrong Email or Password" })
        }

        const user = await User.findOne({email}).select("+password")
        if(!user) {
            return res.status(404).json({ msg: "No Such user Found" })
        }

        const passwordMatch = await bcrypt.compare(password, user.password)
        
        if(!passwordMatch) {
            return res.status(400).json({ msg: "Wrong Email or Password" })
        }

        const token = jwt.sign({ id: user._id, role: user.role, fullName: user.fullName}, process.env.JWT_SECRET, { expiresIn: "1d" })
        res.status(200).json({ msg: `Logged In Successfully. Welcome ${user.fullName}!`, token })
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
 }

 module.exports = {
    register,
    login
 }