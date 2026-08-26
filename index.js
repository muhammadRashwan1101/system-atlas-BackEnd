const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./db/db");

// =====================================================
// Routes
// =====================================================

const authRouter = require("./routes/auth.routes");
const workspaceRouter = require("./routes/workspace.routes");
const projectRouter = require("./routes/project.route");
const profileRouter = require("./routes/profile.route");
const technologiesRouter = require("./routes/technologies.routes");
const teamLeadRoutes = require("./routes/teamLeadRoutes");
const teamRoutes = require("./routes/team.routes");
const userRoutes = require("./routes/createUserRoute");
const teamMemberRoutes = require("./routes/teamMember.routes");
const wizardRoutes = require("./routes/wizard.routes");

// =====================================================
// Middleware
// =====================================================

const globalErrorHandler = require("./middlewares/globalErrorHandler");

// =====================================================
// Environment
// =====================================================

dotenv.config();

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
app.use("/api/workspaces", workspaceRouter);
app.use("/api/projects", projectRouter);
app.use("/api/profile", profileRouter);
app.use("/api/team-leads", teamLeadRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/wizard", wizardRoutes);
app.use("/api/technologies", technologiesRouter);
app.use("/api/users", userRoutes);
app.use("/api", teamMemberRoutes);

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