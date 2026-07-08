const express = require('express')
const app = express()
const dotenv = require('dotenv')
const connectDB = require('./db/db')
const authRouter = require('./routes/auth.routes')
const workspaceRouter = require("./routes/workspace.routes")
const cors = require('cors')

app.use(cors({ origin: 'http://localhost:5173' }))
dotenv.config()

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/workspace', workspaceRouter)

connectDB()

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`)
})