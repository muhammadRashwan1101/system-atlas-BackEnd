const express = require("express");

const router = express.Router();

const projectController = require("../controllers/project.controller");
const authMiddleware = require("../middlewares/authMiddleware");

const setupWizardController = require("../controllers/setupWizard.controller");
const architechtureValidator = require("../middlewares/architechtureValidator");
const componentController = require("../controllers/component.controller");

// =====================================================
// Authentication
// =====================================================

router.use(authMiddleware);

// =====================================================
// Project Routes
// =====================================================

// Create project
router.post("/", projectController.createProject);

// Get all projects
router.get("/", projectController.getProjects);

// Get project by ID
router.get("/:projectId", projectController.getProjectById);

// Update project
router.patch("/:projectId", projectController.updateProject);

// Delete project
router.delete("/:projectId", projectController.deleteProject);

// =====================================================
// Setup Wizard Routes
// =====================================================

router
    .route("/:projectId/wizard")
    .post(
        architechtureValidator,
        setupWizardController.newSetupWizard
    );

// =====================================================
// Component Routes
// =====================================================

router
    .route("/:projectId/components")
    .get(
        architechtureValidator,
        componentController.getComponentsByProjectId
    );

// =====================================================
// Export
// =====================================================

module.exports = router;