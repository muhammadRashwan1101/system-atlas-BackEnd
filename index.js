const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./db/db");

// =====================================================
// Routes
// =====================================================

const authRouter = require("./routes/auth.routes");
const workspaceRouter = require("./routes/workspace.routes");
const ProjectRouter = require("./routes/project.route");
const profileRouter = require("./routes/profile.route");
const TechnologiesRouter = require("./routes/technologies.routes");
const setupWizardRouter = require("./routes/wizard.routes");
const teamLeadRoutes = require("./routes/teamLeadRoutes");
const teamRoutes = require("./routes/team.routes");

// =====================================================
// Middleware
// =====================================================

const globalErrorHandler = require("./middlewares/globalErrorHandler");

// =====================================================
// App
// =====================================================

const app = express();

// =====================================================
// Global Middlewares
// =====================================================

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// =====================================================
// API Routes
// =====================================================

app.use("/api/auth", authRouter);

// Workspace
app.use("/api/workspaces", workspaceRouter);

// Projects
app.use("/api/projects", ProjectRouter);

// Profile
app.use("/api/profile", profileRouter);

// Team Leads
app.use("/api/team-leads", teamLeadRoutes);

// Teams
app.use("/api/teams", teamRoutes);

// Wizard
app.use("/api/wizard", setupWizardRouter);

// Technologies
app.use("/api/technologies", TechnologiesRouter);

// =====================================================
// Static Files
// =====================================================

app.use("/uploads", express.static("uploads"));

// =====================================================
// Global Error Handler
// =====================================================

app.use(globalErrorHandler);

// =====================================================
// Database
// =====================================================

connectDB();

// =====================================================
// Start Server
// =====================================================

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});