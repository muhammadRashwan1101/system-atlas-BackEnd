const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db/db');

// Import Routes
const authRouter = require('./routes/auth.routes');
const workspaceRouter = require('./routes/workspace.routes');
const ProjectRouter = require('./routes/project.route');
const teamLeadRoutes = require('./routes/teamLeadRoutes');
const teamRoutes = require('./routes/team.routes'); 

dotenv.config();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/workspace', workspaceRouter);
app.use('/api/project', ProjectRouter);
app.use('/api/team-leads', teamLeadRoutes);
app.use('/api/teams', teamRoutes);

// Connect to Database
connectDB();

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`);
});