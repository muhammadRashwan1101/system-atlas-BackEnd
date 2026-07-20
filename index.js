const express = require('express')
const app = express()
const dotenv = require('dotenv')
const connectDB = require('./db/db')
const authRouter = require('./routes/auth.routes')
const workspaceRouter = require("./routes/workspace.routes")
const ProjectRouter = require("./routes/project.route")
const TechnologiesRouter = require("./routes/technologies.routes")
const setupWizardRouter = require("./routes/wizard.routes")
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
dotenv.config()

app.use(express.json())

app.use(morgan('dev'))

app.use('/api/auth', authRouter)
app.use('/api/workspaces', workspaceRouter)
app.use('/api/projects', ProjectRouter)
app.use('/api/technologies', TechnologiesRouter)
app.use("/api/wizard", setupWizardRouter)

connectDB()

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`)
})