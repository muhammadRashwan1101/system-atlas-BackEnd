const dotenv = require('dotenv')
dotenv.config()

const express = require('express')
const app = express()
const connectDB = require('./db/db')
const authRouter = require('./routes/auth.routes')
const workspaceRouter = require("./routes/workspace.routes")
const ProjectRouter=require("./routes/project.route")
const profileRouter = require("./routes/profile.route")
const globalErrorHandler = require('./middlewares/globalErrorHandler')

const cors = require('cors')

app.use(cors({ origin: 'http://localhost:5173' }))


app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/workspace', workspaceRouter)
app.use('/api/project', ProjectRouter)
app.use('/api/profile', profileRouter)

app.use(globalErrorHandler)

connectDB()

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`)
})