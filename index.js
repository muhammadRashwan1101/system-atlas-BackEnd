const express = require('express')
const app = express()
const dotenv = require('dotenv')
const connectDB = require('./db/db')
const authRouter = require('./routes/authRoutes')

dotenv.config()

app.use(express.json())

app.use('/api/auth', authRouter)

connectDB()

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`)
})