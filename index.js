const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./db/db');

// Routes
const authRouter = require('./routes/auth.routes');
const workspaceRouter = require('./routes/workspace.routes');
const ProjectRouter = require('./routes/project.route');
const profileRouter = require('./routes/profile.route');
const teamLeadRoutes = require('./routes/teamLeadRoutes');
const teamRoutes = require('./routes/team.routes');

// Middleware
const globalErrorHandler = require('./middlewares/globalErrorHandler');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/workspace', workspaceRouter);
app.use('/api/project', ProjectRouter);
app.use('/api/profile', profileRouter);
app.use('/api/team-leads', teamLeadRoutes);
app.use('/api/teams', teamRoutes);


app.use(globalErrorHandler);


connectDB();

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
});