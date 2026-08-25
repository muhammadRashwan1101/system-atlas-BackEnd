const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./db/db");

const authRouter = require("./routes/auth.routes");
const workspaceRouter = require("./routes/workspace.routes");
const ProjectRouter = require("./routes/project.route");
const profileRouter = require("./routes/profile.route");
const TechnologiesRouter = require("./routes/technologies.routes");
const setupWizardRouter = require("./routes/wizard.routes");
const teamLeadRoutes = require("./routes/teamLeadRoutes");
const teamRoutes = require("./routes/team.routes");

const globalErrorHandler = require("./middlewares/globalErrorHandler");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRouter);

// Workspace & Project
app.use("/api/workspace", workspaceRouter);
app.use("/api", ProjectRouter);

// Team
app.use("/api/team-leads", teamLeadRoutes);
app.use("/api/teams", teamRoutes);

// Other Routes
app.use("/api/profile", profileRouter);
app.use("/api/technologies", TechnologiesRouter);
app.use("/api/wizard", setupWizardRouter);

// Global Error Handler
app.use(globalErrorHandler);

// Database
connectDB();

// Start Server
app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on port ${process.env.PORT || 8000}`);
});