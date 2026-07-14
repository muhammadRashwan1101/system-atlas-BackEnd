const jwt = require("jsonwebtoken")

const authMiddleware = ( req, res, next ) => {
    try {
        if(!req.headers.authorization) {
            return res.status(401).json({ msg: "Unauthorized Access" })
        }

        const token = req.headers.authorization.split(" ")[1]
        if(!token) {
            return res.status(401).json({ msg: "Unauthorized Access" })
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = payload
        next()
    } catch (error) {
        res.status(401).json({ msg: "Unauthorized Access" })
    }
}



module.exports = authMiddleware