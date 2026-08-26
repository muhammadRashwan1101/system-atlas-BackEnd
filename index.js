const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./db/db');

// Routes
const authRouter = require('./routes/auth.routes');
const workspaceRouter = require('./routes/workspace.routes');
const ProjectRouter = require('./routes/project.route');
const profileRouter = require('./routes/profile.route');
const teamLeadRoutes = require('./routes/teamLeadRoutes');
const teamRoutes = require('./routes/team.routes');
const wizardRoutes = require('./routes/wizard.routes');
const invitationRouter = require('./routes/invitation.routes');
// Middleware
const globalErrorHandler = require('./middlewares/globalErrorHandler');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/workspaces', workspaceRouter);
app.use('/api/projects', ProjectRouter);
app.use('/api/profile', profileRouter);
app.use('/api/team-leads', teamLeadRoutes);
app.use('/api/wizard', wizardRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/invitations', invitationRouter);
app.use('/uploads', express.static('uploads'));

app.use(globalErrorHandler)

connectDB()

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});