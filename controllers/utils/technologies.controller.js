const mongoose = require("mongoose")
const Technologies = require("../../constants/technologies")

const getTechnologies = async (req, res, next) => {
    try {
        const { type } = req.query
        if(!type) {
            return res.status(400).json({ msg: "Type is required" })
        }
        console.log(type)
        
        if(!Technologies[type.toLowerCase()]) {
            return res.status(400).json({ msg: "Invalid type" })
        }
        
        const technologies = Technologies[type.toLowerCase()]
        res.status(200).json(technologies)
    } catch(err) {
        next(err)
    }
}

module.exports = {
    getTechnologies
}